// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library EquixUtils {
    uint256 internal constant BPS_DENOMINATOR = 10_000;

    function toBps(uint256 numerator, uint256 denominator) internal pure returns (uint256) {
        if (denominator == 0) return 0;
        return (numerator * BPS_DENOMINATOR) / denominator;
    }

    function applyBps(uint256 value, uint256 bps) internal pure returns (uint256) {
        return (value * bps) / BPS_DENOMINATOR;
    }

    function requireNonZero(address account, string memory message) internal pure {
        require(account != address(0), message);
    }
}

