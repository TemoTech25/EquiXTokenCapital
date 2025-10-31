// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RoleManager} from "../common/RoleManager.sol";

/**
 * @title StablecoinBridge
 * @notice Wraps off-chain fiat flows into on-chain stablecoin mint/burn operations.
 */
contract StablecoinBridge is RoleManager {
    IERC20 public immutable stablecoin;
    uint256 public exchangeRate; // stored as 1e18

    event FiatDeposited(address indexed user, uint256 amountFiat, uint256 amountMinted, bytes proofHash);
    event StableWithdrawn(address indexed user, uint256 amountStable, uint256 amountFiat, bytes proofHash);
    event ExchangeRateUpdated(uint256 newRate);

    constructor(address admin, IERC20 _stablecoin, uint256 initialRate) RoleManager(admin) {
        stablecoin = _stablecoin;
        exchangeRate = initialRate;
    }

    function setExchangeRate(uint256 newRate) external onlyOperator {
        require(newRate > 0, "BRIDGE:RATE");
        exchangeRate = newRate;
        emit ExchangeRateUpdated(newRate);
    }

    function depositFiatProof(address to, uint256 amountFiat, bytes calldata proof) external onlyOperator {
        require(amountFiat > 0, "BRIDGE:AMOUNT");
        uint256 mintAmount = (amountFiat * 1e18) / exchangeRate;
        stablecoin.transfer(to, mintAmount);
        emit FiatDeposited(to, amountFiat, mintAmount, proof);
    }

    function withdrawStable(address from, uint256 amountStable, bytes calldata proof) external onlyOperator {
        require(amountStable > 0, "BRIDGE:AMOUNT");
        uint256 fiatEquivalent = (amountStable * exchangeRate) / 1e18;
        stablecoin.transferFrom(from, address(this), amountStable);
        emit StableWithdrawn(from, amountStable, fiatEquivalent, proof);
    }
}

