// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RoleManager} from "./RoleManager.sol";

/**
 * @title ContractRegistry
 * @notice Lightweight registry that stores the addresses of deployed EquiX modules.
 */
contract ContractRegistry is RoleManager {
    mapping(bytes32 => address) private _addresses;

    event AddressRegistered(bytes32 indexed key, address indexed value);

    constructor(address admin) RoleManager(admin) {}

    function setAddress(bytes32 key, address value) external onlyAdmin {
        _addresses[key] = value;
        emit AddressRegistered(key, value);
    }

    function getAddress(bytes32 key) external view returns (address) {
        return _addresses[key];
    }
}

