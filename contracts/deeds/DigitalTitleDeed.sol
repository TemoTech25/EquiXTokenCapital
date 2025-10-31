// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RoleManager} from "../common/RoleManager.sol";
import {DataTypes} from "../common/DataTypes.sol";

/**
 * @title DigitalTitleDeed
 * @notice Stores deed metadata, hashes, and signatures anchored to a property.
 */
contract DigitalTitleDeed is RoleManager {
    uint256 private _deedIdTracker;
    mapping(uint256 => DataTypes.DeedMeta) private _deeds;
    mapping(uint256 => uint256) private _propertyToDeed;

    event DeedCreated(uint256 indexed deedId, uint256 indexed propertyId, string hash);
    event DeedTransferred(uint256 indexed deedId, address indexed newOwner);
    event DeedVerified(uint256 indexed deedId, string hash);

    constructor(address admin) RoleManager(admin) {}

    function createDeed(uint256 propertyId, string calldata hash, string[] calldata signatures)
        external
        onlyOperator
        returns (uint256 deedId)
    {
        require(propertyId != 0, "DEED:PROPERTY_REQUIRED");
        require(bytes(hash).length > 0, "DEED:HASH_REQUIRED");

        deedId = ++_deedIdTracker;
        _deeds[deedId] = DataTypes.DeedMeta({
            propertyId: propertyId,
            hash: hash,
            signatures: signatures,
            createdAt: uint64(block.timestamp),
            creator: _msgSender()
        });
        _propertyToDeed[propertyId] = deedId;

        emit DeedCreated(deedId, propertyId, hash);
    }

    function updateSignatures(uint256 deedId, string[] calldata signatures) external onlyOperator {
        DataTypes.DeedMeta storage deed = _requireDeed(deedId);
        deed.signatures = signatures;
    }

    function transferDeed(uint256 deedId, address newOwner) external onlyOperator {
        require(newOwner != address(0), "DEED:INVALID_OWNER");
        DataTypes.DeedMeta storage deed = _requireDeed(deedId);
        deed.creator = newOwner;
        emit DeedTransferred(deedId, newOwner);
    }

    function verifyDeed(uint256 deedId) external view returns (string memory hash, string[] memory signatures) {
        DataTypes.DeedMeta storage deed = _requireDeed(deedId);
        return (deed.hash, deed.signatures);
    }

    function getDeed(uint256 deedId) external view returns (DataTypes.DeedMeta memory) {
        return _requireDeed(deedId);
    }

    function getDeedByProperty(uint256 propertyId) external view returns (uint256 deedId) {
        return _propertyToDeed[propertyId];
    }

    function _requireDeed(uint256 deedId) internal view returns (DataTypes.DeedMeta storage) {
        DataTypes.DeedMeta storage deed = _deeds[deedId];
        require(deed.propertyId != 0, "DEED:NOT_FOUND");
        return deed;
    }
}

