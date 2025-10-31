// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RoleManager} from "../common/RoleManager.sol";

/**
 * @title IdentityRegistry
 * @notice Maintains DID hashes and verification status for participants.
 */
contract IdentityRegistry is RoleManager {
    struct Identity {
        string didHash;
        bool verified;
        uint64 updatedAt;
    }

    mapping(address => Identity) private _identities;

    event IdentityRegistered(address indexed user, string didHash);
    event IdentityVerified(address indexed user, bool verified);

    constructor(address admin) RoleManager(admin) {}

    function registerIdentity(address user, string calldata didHash) external onlyOperator {
        require(user != address(0), "ID:INVALID_USER");
        require(bytes(didHash).length > 0, "ID:HASH_REQUIRED");
        _identities[user].didHash = didHash;
        _identities[user].updatedAt = uint64(block.timestamp);
        emit IdentityRegistered(user, didHash);
    }

    function verifyIdentity(address user, bool verified) external onlyOracle {
        require(_identities[user].updatedAt != 0, "ID:NOT_REGISTERED");
        _identities[user].verified = verified;
        _identities[user].updatedAt = uint64(block.timestamp);
        emit IdentityVerified(user, verified);
    }

    function getIdentity(address user) external view returns (string memory didHash, bool verified, uint64 updatedAt) {
        Identity memory identity = _identities[user];
        return (identity.didHash, identity.verified, identity.updatedAt);
    }
}

