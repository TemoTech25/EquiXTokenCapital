// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RoleManager} from "../common/RoleManager.sol";

/**
 * @title ComplianceOracle
 * @notice Maintains KYC/KYB and municipal clearance statuses used by other modules.
 */
contract ComplianceOracle is RoleManager {
    struct UserStatus {
        bool kycPassed;
        uint64 updatedAt;
    }

    struct PropertyStatus {
        bool municipalCleared;
        uint64 updatedAt;
    }

    mapping(address => UserStatus) private _userStatus;
    mapping(uint256 => PropertyStatus) private _propertyStatus;

    event KYCVerified(address indexed user, bool passed, uint64 timestamp);
    event MunicipalCleared(uint256 indexed propertyId, bool cleared, uint64 timestamp);

    constructor(address admin) RoleManager(admin) {}

    function setComplianceStatus(address user, bool passed) external onlyOracle {
        _userStatus[user] = UserStatus({kycPassed: passed, updatedAt: uint64(block.timestamp)});
        emit KYCVerified(user, passed, uint64(block.timestamp));
    }

    function getComplianceStatus(address user) external view returns (bool passed, uint64 updatedAt) {
        UserStatus memory status = _userStatus[user];
        return (status.kycPassed, status.updatedAt);
    }

    function updateMunicipalClearance(uint256 propertyId, bool cleared) external onlyOracle {
        _propertyStatus[propertyId] = PropertyStatus({municipalCleared: cleared, updatedAt: uint64(block.timestamp)});
        emit MunicipalCleared(propertyId, cleared, uint64(block.timestamp));
    }

    function isCompliant(address user, uint256 propertyId) external view returns (bool) {
        UserStatus memory status = _userStatus[user];
        if (!status.kycPassed) return false;
        PropertyStatus memory property = _propertyStatus[propertyId];
        return property.municipalCleared;
    }

    function getMunicipalStatus(uint256 propertyId) external view returns (bool cleared, uint64 updatedAt) {
        PropertyStatus memory status = _propertyStatus[propertyId];
        return (status.municipalCleared, status.updatedAt);
    }
}

