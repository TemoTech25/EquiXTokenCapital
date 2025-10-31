import path from "path";
import fs from "fs";
import solc from "solc";

const CONTRACTS_DIR = path.join(process.cwd(), "contracts");
const ARTIFACTS_DIR = path.join(process.cwd(), "artifacts", "contracts");

type SourceMap = Record<string, { content: string }>;

function listSolidityFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const resolved = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      return listSolidityFiles(resolved);
    }
    return entry.name.endsWith(".sol") ? [resolved] : [];
  });
}

function loadSources(): SourceMap {
  const files = listSolidityFiles(CONTRACTS_DIR);
  const sources: SourceMap = {};
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, "/");
    sources[relativePath] = { content: fs.readFileSync(file, "utf8") };
  }
  return sources;
}

function findImports(importPath: string) {
  const normalized = importPath.replace(/\\/g, "/");
  const localPath = path.resolve(process.cwd(), normalized);
  if (fs.existsSync(localPath)) {
    return { contents: fs.readFileSync(localPath, "utf8") };
  }

  const nodeModulePath = path.resolve(process.cwd(), "node_modules", normalized);
  if (fs.existsSync(nodeModulePath)) {
    return { contents: fs.readFileSync(nodeModulePath, "utf8") };
  }

  return { error: `File not found: ${importPath}` };
}

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function writeArtifact(sourcePath: string, contractName: string, contractOutput: any) {
  const cleanPath = sourcePath
    .replace(/^contracts[\\/]/, "")
    .replace(/\.sol$/i, ".sol");
  const artifactDir = path.join(ARTIFACTS_DIR, cleanPath);
  await ensureDir(artifactDir);

  const artifactPath = path.join(artifactDir, `${contractName}.json`);
  const artifact = {
    contractName,
    abi: contractOutput.abi,
    bytecode: {
      object: contractOutput.evm?.bytecode?.object ?? "",
    },
    deployedBytecode: {
      object: contractOutput.evm?.deployedBytecode?.object ?? "",
    },
    metadata: contractOutput.metadata,
  };

  await fs.promises.writeFile(artifactPath, JSON.stringify(artifact, null, 2));
}

async function compile() {
  const sources = loadSources();
  const input = {
    language: "Solidity",
    sources,
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "metadata", "evm.bytecode", "evm.deployedBytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const hasError = output.errors.some((e: any) => e.severity === "error");
    output.errors.forEach((err: any) => console.log(`${err.severity}: ${err.formattedMessage}`));
    if (hasError) {
      throw new Error("Compilation failed");
    }
  }

  await ensureDir(ARTIFACTS_DIR);

  for (const [sourcePath, contracts] of Object.entries(output.contracts ?? {})) {
    for (const [contractName, contractOutput] of Object.entries<any>(contracts)) {
      await writeArtifact(sourcePath, contractName, contractOutput);
    }
  }

  console.log("✅ Solidity compilation completed");
}

compile().catch((err) => {
  console.error(err);
  process.exit(1);
});
