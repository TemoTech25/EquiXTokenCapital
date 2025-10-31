// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {RoleManager} from "../common/RoleManager.sol";
import {EquixUtils} from "../common/EquixUtils.sol";

interface IFractionLedger {
    function totalShares(uint256 tokenId) external view returns (uint256);
    function getFractionHolders(uint256 tokenId) external view returns (address[] memory holders, uint256[] memory balances);
    function fractionBalanceOf(uint256 tokenId, address account) external view returns (uint256);
}

/**
 * @title RevenueDistribution
 * @notice Distributes rental income or yield to fractional holders based on share balances.
 */
contract RevenueDistribution is RoleManager, ReentrancyGuard {
    using EquixUtils for uint256;

    address public immutable propertyToken;
    address public immutable payoutToken; // address(0) for HBAR

    event RevenueDeposited(uint256 indexed propertyTokenId, uint256 amount, address indexed depositor);
    event RevenueDistributed(uint256 indexed propertyTokenId, uint256 totalAmount);

    constructor(address admin, address _propertyToken, address _payoutToken) RoleManager(admin) {
        propertyToken = _propertyToken;
        payoutToken = _payoutToken;
    }

    function depositRevenue(uint256 propertyTokenId, uint256 amount) external payable onlyOperator {
        if (payoutToken == address(0)) {
            require(msg.value == amount && amount > 0, "REV:INVALID_VALUE");
        } else {
            require(msg.value == 0, "REV:HBAR_NOT_ALLOWED");
            IERC20(payoutToken).transferFrom(_msgSender(), address(this), amount);
        }
        emit RevenueDeposited(propertyTokenId, amount, _msgSender());
    }

    function distribute(uint256 propertyTokenId) external nonReentrant onlyOperator {
        IFractionLedger ledger = IFractionLedger(propertyToken);
        (address[] memory holders, uint256[] memory balances) = ledger.getFractionHolders(propertyTokenId);
        uint256 totalShares = ledger.totalShares(propertyTokenId);
        require(totalShares > 0, "REV:NO_SHARES");

        uint256 balanceBefore = _balance();
        require(balanceBefore > 0, "REV:NO_FUNDS");

        for (uint256 i = 0; i < holders.length; i++) {
            uint256 amount = (balanceBefore * balances[i]) / totalShares;
            if (amount > 0) {
                _payout(holders[i], amount);
            }
        }

        emit RevenueDistributed(propertyTokenId, balanceBefore);
    }

    function _balance() internal view returns (uint256) {
        if (payoutToken == address(0)) {
            return address(this).balance;
        }
        return IERC20(payoutToken).balanceOf(address(this));
    }

    function _payout(address to, uint256 amount) internal {
        if (payoutToken == address(0)) {
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "REV:HBAR_FAIL");
        } else {
            IERC20(payoutToken).transfer(to, amount);
        }
    }

    receive() external payable {}
}
