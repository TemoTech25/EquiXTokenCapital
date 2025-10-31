import { expect } from "chai";
import { ethers } from "hardhat";

describe("EquiXToken smoke flow", () => {
  it("runs compliance-gated investment flow", async () => {
    const [admin, seller, investor] = await ethers.getSigners();

    const mockFactory = await ethers.getContractFactory("MockERC20");
    const stablecoin = await mockFactory.deploy("MockUSD", "MUSD", 18);
    await stablecoin.deployed();

    const registry = await (await ethers.getContractFactory("ContractRegistry")).deploy(admin.address);
    await registry.deployed();

    const compliance = await (await ethers.getContractFactory("ComplianceOracle")).deploy(admin.address);
    await compliance.deployed();

    const propertyToken = await (await ethers.getContractFactory("PropertyToken")).deploy(admin.address);
    await propertyToken.deployed();

    const escrowManager = await (await ethers.getContractFactory("EscrowManager")).deploy(admin.address, compliance.address);
    await escrowManager.deployed();

    const investmentOffering = await (await ethers.getContractFactory("InvestmentOffering")).deploy(
      admin.address,
      stablecoin.address,
      escrowManager.address,
      propertyToken.address,
      compliance.address,
    );
    await investmentOffering.deployed();

    const revenueDistribution = await (await ethers.getContractFactory("RevenueDistribution")).deploy(
      admin.address,
      propertyToken.address,
      stablecoin.address,
    );
    await revenueDistribution.deployed();

    // assign roles
    const issuerRole = await propertyToken.ISSUER_ROLE();
    const operatorRole = await propertyToken.OPERATOR_ROLE();
    await propertyToken.grantRole(issuerRole, admin.address);
    await propertyToken.grantRole(operatorRole, escrowManager.address);
    await propertyToken.grantRole(operatorRole, investmentOffering.address);
    await propertyToken.grantRole(issuerRole, investmentOffering.address);
    await escrowManager.grantRole(await escrowManager.ESCROW_ROLE(), investmentOffering.address);

    // mint property to seller
    await propertyToken.connect(admin).mintPropertyNFT("ipfs://property", seller.address);
    const tokenId = 1;

    // create offering by admin
    await investmentOffering.connect(admin).createOffering(
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("50"),
      Math.floor(Date.now() / 1000) + 3600,
      tokenId,
    );

    await stablecoin.connect(admin).mint(investor.address, ethers.utils.parseEther("100"));
    await stablecoin.connect(investor).approve(investmentOffering.address, ethers.utils.parseEther("100"));

    // should revert before compliance
    await expect(investmentOffering.connect(investor).invest(1, ethers.utils.parseEther("20"))).to.be.revertedWith(
      "OFFERING:COMPLIANCE",
    );

    await compliance.setComplianceStatus(investor.address, true);
    await compliance.setComplianceStatus(seller.address, true);
    await compliance.updateMunicipalClearance(tokenId, true);

    // seller transfers fractional control to investment offering via approval
    await propertyToken.connect(seller).approve(investmentOffering.address, tokenId);

    await expect(investmentOffering.connect(investor).invest(1, ethers.utils.parseEther("20"))).to.not.be.reverted;

    const offering = await investmentOffering.getOffering(1);
    expect(offering.totalRaised).to.equal(ethers.utils.parseEther("20"));

    const escrow = await escrowManager.getEscrow(offering.escrowId);
    expect(escrow.status).to.equal(1); // FUNDED

    // mark escrow conditions and release
    const condition = [{ id: ethers.utils.id("KYC"), description: "KYC", satisfied: true, satisfiedAt: 0 }];
    await escrowManager.setConditions(offering.escrowId, condition);
    await escrowManager.markCondition(offering.escrowId, condition[0].id, true);
    await escrowManager.releaseFunds(offering.escrowId);

    // revenue distribution
    const holders = await propertyToken.getFractionHolders(tokenId);
    expect(holders[0].length).to.equal(1);

    const revenueAmount = ethers.utils.parseEther("10");
    await stablecoin.connect(admin).mint(admin.address, revenueAmount);
    await stablecoin.connect(admin).approve(revenueDistribution.address, revenueAmount);
    await revenueDistribution.grantRole(await revenueDistribution.OPERATOR_ROLE(), admin.address);
    await revenueDistribution.connect(admin).depositRevenue(tokenId, revenueAmount);
    await revenueDistribution.connect(admin).distribute(tokenId);

    const investorBalance = await stablecoin.balanceOf(investor.address);
    expect(investorBalance).to.equal(ethers.utils.parseEther("90"));
  });
});
