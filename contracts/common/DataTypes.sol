// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DataTypes
 * @notice Shared structs and enums reused across the EquiXToken Capital smart-contract suite.
 */
library DataTypes {
    // -------------------- Property / Fraction Ownership --------------------
    struct FractionHolder {
        address holder;
        uint256 balance;
    }

    struct FractionSnapshot {
        uint256 totalShares;
        FractionHolder[] holders;
        uint256 timestamp;
    }

    // -------------------- Escrow --------------------
    enum EscrowStatus {
        NONE,
        CREATED,
        FUNDED,
        RELEASED,
        REFUNDED
    }

    struct EscrowCondition {
        bytes32 id;
        string description;
        bool satisfied;
        uint64 satisfiedAt;
    }

    struct Escrow {
        address buyer;
        address seller;
        address asset;
        uint256 assetId;
        address paymentToken; // address(0) for HBAR
        uint256 amount;
        EscrowStatus status;
        uint64 createdAt;
        uint64 fundedAt;
        uint64 releasedAt;
        EscrowCondition[] conditions;
    }

    // -------------------- Investment Offering --------------------
    enum OfferingStatus {
        NONE,
        ACTIVE,
        FILLED,
        CLOSED,
        FAILED
    }

    struct Contribution {
        address investor;
        uint256 amount;
    }

    struct Offering {
        uint256 targetAmount;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 totalRaised;
        uint64 opensAt;
        uint64 closesAt;
        OfferingStatus status;
        uint256 escrowId;
        address propertyToken;
        uint256 propertyTokenId;
    }

    // -------------------- Governance --------------------
    enum ProposalStatus {
        NONE,
        ACTIVE,
        EXECUTED,
        EXPIRED,
        CANCELLED
    }

    struct Proposal {
        string description;
        uint64 createdAt;
        uint64 deadline;
        uint256 forVotes;
        uint256 againstVotes;
        ProposalStatus status;
        bytes callData;
        address target;
    }

    // -------------------- Registry / Deeds --------------------
    struct DeedMeta {
        uint256 propertyId;
        string hash;
        string[] signatures;
        uint64 createdAt;
        address creator;
    }

    struct PropertyRecord {
        uint256 propertyId;
        address currentOwner;
        string deedHash;
        uint64 registeredAt;
        uint64 updatedAt;
    }
}
