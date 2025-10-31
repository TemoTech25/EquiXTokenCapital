// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RoleManager} from "../common/RoleManager.sol";
import {DataTypes} from "../common/DataTypes.sol";

/**
 * @title PropertyRegistry
 * @notice Records property ownership, deed hashes, and maintains an audit trail of transfers.
 */
contract PropertyRegistry is RoleManager {
    mapping(uint256 => DataTypes.PropertyRecord) private _records;
    mapping(uint256 => address[]) private _history;
    mapping(uint256 => string[]) private _deedHistory;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string deedHash);
    event OwnershipUpdated(uint256 indexed propertyId, address indexed newOwner, string deedHash);
    event DeedVerified(uint256 indexed propertyId, string deedHash);

    constructor(address admin) RoleManager(admin) {}

    function registerProperty(uint256 propertyId, address owner, string calldata deedHash) external onlyOperator {
        require(owner != address(0), "REGISTRY:INVALID_OWNER");
        require(bytes(deedHash).length > 0, "REGISTRY:HASH_REQUIRED");
        require(_records[propertyId].propertyId == 0, "REGISTRY:EXISTS");

        _records[propertyId] = DataTypes.PropertyRecord({
            propertyId: propertyId,
            currentOwner: owner,
            deedHash: deedHash,
            registeredAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });
        _history[propertyId].push(owner);
        _deedHistory[propertyId].push(deedHash);

        emit PropertyRegistered(propertyId, owner, deedHash);
    }

    function updateOwnership(uint256 propertyId, address newOwner, string calldata deedHash) external onlyOperator {
        require(newOwner != address(0), "REGISTRY:INVALID_OWNER");
        DataTypes.PropertyRecord storage record = _requireRecord(propertyId);
        record.currentOwner = newOwner;
        if (bytes(deedHash).length > 0) {
            record.deedHash = deedHash;
            _deedHistory[propertyId].push(deedHash);
        }
        record.updatedAt = uint64(block.timestamp);
        _history[propertyId].push(newOwner);

        emit OwnershipUpdated(propertyId, newOwner, record.deedHash);
    }

    function verifyTitle(uint256 propertyId) external view returns (string memory deedHash) {
        DataTypes.PropertyRecord storage record = _requireRecord(propertyId);
        return record.deedHash;
    }

    function getPropertyHistory(uint256 propertyId)
        external
        view
        returns (address[] memory owners, string[] memory deedHashes)
    {
        owners = _history[propertyId];
        deedHashes = _deedHistory[propertyId];
    }

    function getRecord(uint256 propertyId) external view returns (DataTypes.PropertyRecord memory) {
        return _requireRecord(propertyId);
    }

    function _requireRecord(uint256 propertyId) internal view returns (DataTypes.PropertyRecord storage) {
        DataTypes.PropertyRecord storage record = _records[propertyId];
        require(record.propertyId != 0, "REGISTRY:NOT_FOUND");
        return record;
    }
}

