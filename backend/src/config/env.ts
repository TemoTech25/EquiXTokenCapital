import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  JWT_SECRET: z.string(),
  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().default(86_400),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(60 * 60 * 24 * 7),
  HEDERA_NETWORK: z.enum(["testnet", "mainnet"]),
  HEDERA_OPERATOR_ID: z.string(),
  HEDERA_OPERATOR_KEY: z.string(),
  MIRROR_NODE_URL: z.string().url(),
  HASHCONNECT_APP_METADATA_NAME: z.string(),
  HASHCONNECT_APP_METADATA_DESCRIPTION: z.string(),
  HASHCONNECT_APP_METADATA_ICON: z.string().url(),
  HASHCONNECT_APP_METADATA_URL: z.string().url(),
  FEATURE_MARKETPLACE: z.string().transform((val) => val === "true"),
  FEATURE_CUSTODIAL_WALLETS: z.string().transform((val) => val === "true"),
  FEATURE_GUARDIAN: z.string().transform((val) => val === "true"),
  PAYMENT_BANK_WEBHOOK_SECRET: z.string(),
  PAYMENT_STABLECOIN_WEBHOOK_SECRET: z.string(),
  KYC_PROVIDER_API_KEY: z.string(),
  AI_SERVICE_ENDPOINT: z.string().url().optional(),
  LOG_LEVEL: z.string().default("info"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  KMS_KEY_ID: z.string().optional(),
  VAULT_ADDR: z.string().url().optional(),
  VAULT_TOKEN: z.string().optional(),
  AUTH_DEV_BYPASS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AUTH_DEV_USER_ID: z.string().optional(),
  AUTH_DEV_TENANT_ID: z.string().optional(),
  AUTH_DEV_ROLE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const loadEnv = (): Env => {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Environment validation failed", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  cachedEnv = parsed.data;
  return cachedEnv;
};
