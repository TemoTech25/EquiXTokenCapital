// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {RoleManager} from "../common/RoleManager.sol";
import {DataTypes} from "../common/DataTypes.sol";

interface IPropertyToken {
    function mintPropertyNFT(string calldata metadataURI, address to) external returns (uint256);
    function fractionalize(uint256 tokenId, uint256 totalShares) external;
    function transferFraction(uint256 tokenId, address to, uint256 amount) external;
    function transferFractionFrom(uint256 tokenId, address from, address to, uint256 amount) external;
    function fractionBalanceOf(uint256 tokenId, address account) external view returns (uint256);
    function totalShares(uint256 tokenId) external view returns (uint256);
}

interface IEscrowManager {
    function createEscrow(address buyer, address seller, uint256 amount, address paymentToken, address asset, uint256 assetId) external returns (uint256);
    function depositFunds(uint256 escrowId) external payable;
}

interface IComplianceOracle {
    function isCompliant(address user, uint256 propertyId) external view returns (bool);
}

/**
 * @title InvestmentOffering
 * @notice Manages capital raises for tokenised properties.
 */
contract InvestmentOffering is RoleManager, ReentrancyGuard {
    mapping(uint256 => DataTypes.Offering) private _offerings;
    mapping(uint256 => DataTypes.Contribution[]) private _contributions;
    uint256 private _offeringIdTracker;

    event OfferingCreated(uint256 indexed offeringId, uint256 targetAmount, uint256 minInvestment, uint256 maxInvestment, address propertyToken);
    event InvestmentMade(uint256 indexed offeringId, address indexed investor, uint256 amount);
    event OfferingClosed(uint256 indexed offeringId, uint256 totalRaised);
    event OfferingFailed(uint256 indexed offeringId);
    event Refunded(uint256 indexed offeringId, address indexed investor, uint256 amount);

    address public immutable paymentToken;
    address public immutable escrowManager;
    address public immutable propertyToken;

    address public immutable complianceOracle;

    constructor(address admin, address _paymentToken, address _escrowManager, address _propertyToken, address _complianceOracle)
        RoleManager(admin)
    {
        paymentToken = _paymentToken;
        escrowManager = _escrowManager;
        propertyToken = _propertyToken;
        complianceOracle = _complianceOracle;
    }

    function getOffering(uint256 offeringId) external view returns (DataTypes.Offering memory) {
        return _offerings[offeringId];
    }

    function createOffering(
        uint256 targetAmount,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint64 closesAt,
        uint256 propertyTokenId
    ) external onlyIssuer returns (uint256 offeringId) {
        require(targetAmount > 0, "OFFERING:TARGET");
        require(minInvestment <= maxInvestment, "OFFERING:LIMITS");
        require(closesAt > block.timestamp, "OFFERING:DEADLINE");

        offeringId = ++_offeringIdTracker;
        DataTypes.Offering storage off = _offerings[offeringId];
        off.targetAmount = targetAmount;
        off.minInvestment = minInvestment;
        off.maxInvestment = maxInvestment;
        off.totalRaised = 0;
        off.opensAt = uint64(block.timestamp);
        off.closesAt = closesAt;
        off.status = DataTypes.OfferingStatus.ACTIVE;
        off.propertyToken = propertyToken;
        off.propertyTokenId = propertyTokenId;

        emit OfferingCreated(offeringId, targetAmount, minInvestment, maxInvestment, propertyToken);
    }

    function invest(uint256 offeringId, uint256 amount) external nonReentrant {
        DataTypes.Offering storage off = _requireActive(offeringId);
        require(block.timestamp <= off.closesAt, "OFFERING:CLOSED");
        require(amount >= off.minInvestment && amount <= off.maxInvestment, "OFFERING:AMOUNT_RANGE");
        require(IComplianceOracle(complianceOracle).isCompliant(_msgSender(), off.propertyTokenId), "OFFERING:COMPLIANCE");

        IERC20(paymentToken).transferFrom(_msgSender(), address(this), amount);
        off.totalRaised += amount;
        _contributions[offeringId].push(DataTypes.Contribution({investor: _msgSender(), amount: amount}));

        emit InvestmentMade(offeringId, _msgSender(), amount);

        if (off.totalRaised >= off.targetAmount) {
            _closeOffering(offeringId);
        }
    }

    function closeOffering(uint256 offeringId) external onlyOperator {
        DataTypes.Offering storage off = _requireActive(offeringId);
        require(block.timestamp >= off.closesAt || off.totalRaised >= off.targetAmount, "OFFERING:STILL_OPEN");
        if (off.totalRaised >= off.targetAmount) {
            _closeOffering(offeringId);
        } else {
            _failOffering(offeringId);
        }
    }

    function refundInvestors(uint256 offeringId) external onlyOperator nonReentrant {
        DataTypes.Offering storage off = _offerings[offeringId];
        require(off.status == DataTypes.OfferingStatus.FAILED, "OFFERING:NOT_FAILED");

        DataTypes.Contribution[] storage list = _contributions[offeringId];
        for (uint256 i = 0; i < list.length; i++) {
            IERC20(paymentToken).transfer(list[i].investor, list[i].amount);
            emit Refunded(offeringId, list[i].investor, list[i].amount);
        }
        delete _contributions[offeringId];
    }

    function _closeOffering(uint256 offeringId) internal {
        DataTypes.Offering storage off = _offerings[offeringId];
        off.status = DataTypes.OfferingStatus.FILLED;

        // create escrow for proceeds
        address propertyOwner = IERC721(off.propertyToken).ownerOf(off.propertyTokenId);

        uint256 escrowId = IEscrowManager(escrowManager).createEscrow({
            buyer: address(this),
            seller: propertyOwner,
            amount: off.totalRaised,
            paymentToken: paymentToken,
            asset: off.propertyToken,
            assetId: off.propertyTokenId
        });
        off.escrowId = escrowId;

        // Distribute fractions proportionally
        uint256 totalShares = off.totalRaised; // 1 token per currency unit for now
        IPropertyToken property = IPropertyToken(propertyToken);
        if (property.totalShares(off.propertyTokenId) == 0) {
            property.fractionalize(off.propertyTokenId, totalShares);
        }

        DataTypes.Contribution[] storage list = _contributions[offeringId];
        for (uint256 i = 0; i < list.length; i++) {
            uint256 shareAmount = (totalShares * list[i].amount) / off.totalRaised;
            property.transferFractionFrom(off.propertyTokenId, propertyOwner, list[i].investor, shareAmount);
        }

        if (paymentToken == address(0)) {
            IEscrowManager(escrowManager).depositFunds{value: off.totalRaised}(escrowId);
        } else {
            IERC20(paymentToken).approve(escrowManager, off.totalRaised);
            IEscrowManager(escrowManager).depositFunds(escrowId);
        }

        emit OfferingClosed(offeringId, off.totalRaised);
    }

    function _failOffering(uint256 offeringId) internal {
        DataTypes.Offering storage off = _offerings[offeringId];
        off.status = DataTypes.OfferingStatus.FAILED;
        emit OfferingFailed(offeringId);
    }

    function _requireActive(uint256 offeringId) internal view returns (DataTypes.Offering storage) {
        DataTypes.Offering storage off = _offerings[offeringId];
        require(off.status == DataTypes.OfferingStatus.ACTIVE, "OFFERING:NOT_ACTIVE");
        return off;
    }
}
