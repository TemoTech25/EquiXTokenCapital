// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {RoleManager} from "../common/RoleManager.sol";

/**
 * @title Marketplace
 * @notice Lists and enables purchases of tokenised properties/fractions.
 */
contract Marketplace is RoleManager {
    struct Listing {
        uint256 listingId;
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 price;
        address paymentToken; // address(0) for HBAR
        bool active;
    }

    uint256 private _listingIdTracker;
    mapping(uint256 => Listing) private _listings;

    event Listed(uint256 indexed listingId, address indexed seller, address tokenContract, uint256 tokenId, uint256 price);
    event Bought(uint256 indexed listingId, address indexed buyer, uint256 price);
    event Cancelled(uint256 indexed listingId);

    constructor(address admin) RoleManager(admin) {}

    function listProperty(address tokenContract, uint256 tokenId, uint256 price, address paymentToken)
        external
        returns (uint256 listingId)
    {
        require(price > 0, "MKT:PRICE");
        IERC721 token = IERC721(tokenContract);
        require(token.ownerOf(tokenId) == _msgSender(), "MKT:NOT_OWNER");

        listingId = ++_listingIdTracker;
        _listings[listingId] = Listing({
            listingId: listingId,
            seller: _msgSender(),
            tokenContract: tokenContract,
            tokenId: tokenId,
            price: price,
            paymentToken: paymentToken,
            active: true
        });

        emit Listed(listingId, _msgSender(), tokenContract, tokenId, price);
    }

    function buyProperty(uint256 listingId) external payable {
        Listing storage listing = _requireActive(listingId);
        if (listing.paymentToken == address(0)) {
            require(msg.value == listing.price, "MKT:INVALID_VALUE");
            (bool ok, ) = listing.seller.call{value: listing.price}("");
            require(ok, "MKT:PAYOUT_FAIL");
        } else {
            require(msg.value == 0, "MKT:HBAR_NOT_ALLOWED");
            IERC20(listing.paymentToken).transferFrom(_msgSender(), listing.seller, listing.price);
        }

        IERC721(listing.tokenContract).safeTransferFrom(listing.seller, _msgSender(), listing.tokenId);
        listing.active = false;

        emit Bought(listingId, _msgSender(), listing.price);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = _requireActive(listingId);
        require(listing.seller == _msgSender() || hasRole(OPERATOR_ROLE, _msgSender()), "MKT:NOT_SELLER");
        listing.active = false;
        emit Cancelled(listingId);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }

    function _requireActive(uint256 listingId) internal view returns (Listing storage) {
        Listing storage listing = _listings[listingId];
        require(listing.active, "MKT:NOT_ACTIVE");
        return listing;
    }
}
