// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleManager
 * @notice Centralised role definitions shared across the EquiXToken Capital contracts.
 */
abstract contract RoleManager is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ESCROW_ROLE = keccak256("ESCROW_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setRoleAdmin(OPERATOR_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ESCROW_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ORACLE_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ISSUER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(GOVERNANCE_ROLE, DEFAULT_ADMIN_ROLE);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ROLE:ADMIN_ONLY");
        _;
    }

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, _msgSender()), "ROLE:OPERATOR_ONLY");
        _;
    }

    modifier onlyEscrowAgent() {
        require(hasRole(ESCROW_ROLE, _msgSender()), "ROLE:ESCROW_ONLY");
        _;
    }

    modifier onlyOracle() {
        require(hasRole(ORACLE_ROLE, _msgSender()), "ROLE:ORACLE_ONLY");
        _;
    }

    modifier onlyIssuer() {
        require(hasRole(ISSUER_ROLE, _msgSender()), "ROLE:ISSUER_ONLY");
        _;
    }
}

