// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {RoleManager} from "../common/RoleManager.sol";
import {DataTypes} from "../common/DataTypes.sol";

/**
 * @title EscrowManager
 * @notice Handles milestone-based escrows for property transfers and investments.
 */
contract EscrowManager is RoleManager, ReentrancyGuard {
    uint256 private _escrowIdTracker;
    mapping(uint256 => DataTypes.Escrow) private _escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount, address paymentToken);
    event FundsDeposited(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event ConditionUpdated(uint256 indexed escrowId, bytes32 conditionId, bool satisfied);
    event FundsReleased(uint256 indexed escrowId, address indexed to, uint256 amount);
    event Refunded(uint256 indexed escrowId, address indexed to, uint256 amount);

    address public immutable complianceOracle;

    constructor(address admin, address _complianceOracle) RoleManager(admin) {
        complianceOracle = _complianceOracle;
    }

    function getEscrow(uint256 escrowId) external view returns (DataTypes.Escrow memory) {
        return _escrows[escrowId];
    }

    function createEscrow(
        address buyer,
        address seller,
        uint256 amount,
        address paymentToken,
        address asset,
        uint256 assetId
    ) external onlyEscrowAgent returns (uint256 escrowId) {
        require(buyer != address(0) && seller != address(0), "ESCROW:INVALID_PARTY");
        require(amount > 0, "ESCROW:AMOUNT_ZERO");

        escrowId = ++_escrowIdTracker;
        DataTypes.Escrow storage esc = _escrows[escrowId];
        esc.buyer = buyer;
        esc.seller = seller;
        esc.amount = amount;
        esc.paymentToken = paymentToken;
        esc.asset = asset;
        esc.assetId = assetId;
        esc.status = DataTypes.EscrowStatus.CREATED;
        esc.createdAt = uint64(block.timestamp);

        emit EscrowCreated(escrowId, buyer, seller, amount, paymentToken);
    }

    function setConditions(uint256 escrowId, DataTypes.EscrowCondition[] calldata conditions) external onlyEscrowAgent {
        DataTypes.Escrow storage esc = _requireEscrow(escrowId);
        require(esc.status == DataTypes.EscrowStatus.CREATED || esc.status == DataTypes.EscrowStatus.FUNDED, "ESCROW:STATUS");

        delete esc.conditions;
        for (uint256 i = 0; i < conditions.length; i++) {
            esc.conditions.push(
                DataTypes.EscrowCondition({
                    id: conditions[i].id,
                    description: conditions[i].description,
                    satisfied: conditions[i].satisfied,
                    satisfiedAt: conditions[i].satisfied ? uint64(block.timestamp) : 0
                })
            );
            emit ConditionUpdated(escrowId, conditions[i].id, conditions[i].satisfied);
        }
    }

    function markCondition(uint256 escrowId, bytes32 conditionId, bool satisfied) external onlyOracle {
        DataTypes.Escrow storage esc = _requireEscrow(escrowId);
        for (uint256 i = 0; i < esc.conditions.length; i++) {
            if (esc.conditions[i].id == conditionId) {
                esc.conditions[i].satisfied = satisfied;
                esc.conditions[i].satisfiedAt = satisfied ? uint64(block.timestamp) : 0;
                emit ConditionUpdated(escrowId, conditionId, satisfied);
                return;
            }
        }
        revert("ESCROW:UNKNOWN_CONDITION");
    }

    function depositFunds(uint256 escrowId) external payable nonReentrant {
        DataTypes.Escrow storage esc = _requireEscrow(escrowId);
        require(esc.status == DataTypes.EscrowStatus.CREATED, "ESCROW:STATUS");
        require(_msgSender() == esc.buyer, "ESCROW:NOT_BUYER");

        if (esc.paymentToken == address(0)) {
            require(msg.value == esc.amount, "ESCROW:INVALID_VALUE");
        } else {
            require(msg.value == 0, "ESCROW:HBAR_NOT_ALLOWED");
            IERC20(esc.paymentToken).transferFrom(_msgSender(), address(this), esc.amount);
        }

        require(IComplianceOracle(complianceOracle).isCompliant(esc.buyer, esc.assetId), "ESCROW:BUYER_NON_COMPLIANT");
        require(IComplianceOracle(complianceOracle).isCompliant(esc.seller, esc.assetId), "ESCROW:SELLER_NON_COMPLIANT");

        esc.status = DataTypes.EscrowStatus.FUNDED;
        esc.fundedAt = uint64(block.timestamp);

        emit FundsDeposited(escrowId, _msgSender(), esc.amount);
    }

    function releaseFunds(uint256 escrowId) external nonReentrant onlyEscrowAgent {
        DataTypes.Escrow storage esc = _requireEscrow(escrowId);
        require(esc.status == DataTypes.EscrowStatus.FUNDED, "ESCROW:STATUS");
        require(_conditionsSatisfied(esc), "ESCROW:CONDITIONS_PENDING");

        esc.status = DataTypes.EscrowStatus.RELEASED;
        esc.releasedAt = uint64(block.timestamp);

        _payout(esc.seller, esc.paymentToken, esc.amount);
        emit FundsReleased(escrowId, esc.seller, esc.amount);
    }

    function refundBuyer(uint256 escrowId) external nonReentrant onlyEscrowAgent {
        DataTypes.Escrow storage esc = _requireEscrow(escrowId);
        require(esc.status == DataTypes.EscrowStatus.FUNDED, "ESCROW:STATUS");

        esc.status = DataTypes.EscrowStatus.REFUNDED;
        _payout(esc.buyer, esc.paymentToken, esc.amount);
        emit Refunded(escrowId, esc.buyer, esc.amount);
    }

    function _payout(address to, address paymentToken, uint256 amount) internal {
        if (paymentToken == address(0)) {
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "ESCROW:HBAR_TRANSFER_FAIL");
        } else {
            IERC20(paymentToken).transfer(to, amount);
        }
    }

    function _conditionsSatisfied(DataTypes.Escrow storage esc) internal view returns (bool) {
        for (uint256 i = 0; i < esc.conditions.length; i++) {
            if (!esc.conditions[i].satisfied) {
                return false;
            }
        }
        return true;
    }

    function _requireEscrow(uint256 escrowId) internal view returns (DataTypes.Escrow storage) {
        DataTypes.Escrow storage esc = _escrows[escrowId];
        require(esc.buyer != address(0), "ESCROW:UNKNOWN");
        return esc;
    }
    receive() external payable {}
}

interface IComplianceOracle {
    function isCompliant(address user, uint256 propertyId) external view returns (bool);
}
