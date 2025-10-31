// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {RoleManager} from "../common/RoleManager.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PropertyToken
 * @notice ERC721 title deeds with optional fractional ownership ledgers per property.
 */
contract PropertyToken is ERC721, ERC721URIStorage, RoleManager {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct FractionData {
        uint256 totalShares;
        EnumerableSet.AddressSet holders;
    }

    uint256 private _tokenIdTracker;
    mapping(uint256 => FractionData) private _fractions;
    mapping(uint256 => mapping(address => uint256)) private _fractionBalances;
    mapping(uint256 => bool) public isLocked;

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string metadataURI);
    event Fractionalized(uint256 indexed tokenId, uint256 shareSupply);
    event FractionTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 amount);
    event TitleLocked(uint256 indexed tokenId, bool locked);

    constructor(address admin) ERC721("EquiX Property", "EQXPROP") RoleManager(admin) {}

    // -------------------- Title minting --------------------

    function mintPropertyNFT(string calldata metadataURI, address to) external onlyIssuer returns (uint256 tokenId) {
        require(bytes(metadataURI).length > 0, "PROP:URI_REQUIRED");
        require(to != address(0), "PROP:INVALID_RECEIVER");

        tokenId = ++_tokenIdTracker;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit PropertyMinted(tokenId, to, metadataURI);
    }

    // -------------------- Fractionalisation --------------------

    function fractionalize(uint256 tokenId, uint256 totalShareSupply) external {
        require(_exists(tokenId), "PROP:UNKNOWN_TOKEN");
        require(totalShareSupply > 0, "PROP:TOTAL_SHARES_ZERO");
        require(_fractions[tokenId].totalShares == 0, "PROP:ALREADY_FRACTIONALISED");
        require(_isApprovedOrOwner(_msgSender(), tokenId) || hasRole(OPERATOR_ROLE, _msgSender()), "PROP:NOT_AUTHORISED");

        address owner = ownerOf(tokenId);
        _fractions[tokenId].totalShares = totalShareSupply;
        _fractionBalances[tokenId][owner] = totalShareSupply;
        _fractions[tokenId].holders.add(owner);

        emit Fractionalized(tokenId, totalShareSupply);
    }

    function transferFraction(uint256 tokenId, address to, uint256 amount) external {
        _transferFraction(tokenId, _msgSender(), to, amount, true);
    }

    function transferFractionFrom(uint256 tokenId, address from, address to, uint256 amount) external onlyOperator {
        _transferFraction(tokenId, from, to, amount, false);
    }

    function fractionBalanceOf(uint256 tokenId, address account) external view returns (uint256) {
        return _fractionBalances[tokenId][account];
    }

    function totalShares(uint256 tokenId) external view returns (uint256) {
        return _fractions[tokenId].totalShares;
    }

    function getFractionHolders(uint256 tokenId)
        external
        view
        returns (address[] memory holders, uint256[] memory balances)
    {
        FractionData storage fd = _fractions[tokenId];
        uint256 length = fd.holders.length();
        holders = new address[](length);
        balances = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            address h = fd.holders.at(i);
            holders[i] = h;
            balances[i] = _fractionBalances[tokenId][h];
        }
    }

    // -------------------- Title lock --------------------

    function lockTitle(uint256 tokenId) external onlyOperator {
        require(_exists(tokenId), "PROP:UNKNOWN_TOKEN");
        isLocked[tokenId] = true;
        emit TitleLocked(tokenId, true);
    }

    function unlockTitle(uint256 tokenId) external onlyOperator {
        require(_exists(tokenId), "PROP:UNKNOWN_TOKEN");
        isLocked[tokenId] = false;
        emit TitleLocked(tokenId, false);
    }

    // -------------------- Overrides --------------------

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721)
    {
        require(!isLocked[tokenId], "PROP:LOCKED_TRANSFER");
        if (from != address(0) && _fractions[tokenId].totalShares > 0) {
            require(_fractions[tokenId].holders.length() == 1 && _fractions[tokenId].holders.contains(from), "PROP:SHARES_IN_CIRCULATION");
            require(_fractionBalances[tokenId][from] == _fractions[tokenId].totalShares, "PROP:SHARES_NOT_RECLAIMED");
            // reset fractional state on full transfer
            _fractionBalances[tokenId][from] = 0;
            _fractions[tokenId].holders.remove(from);
            _fractions[tokenId].totalShares = 0;
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _transferFraction(uint256 tokenId, address from, address to, uint256 amount, bool enforceLock) internal {
        require(_fractions[tokenId].totalShares > 0, "PROP:NOT_FRACTIONALISED");
        if (enforceLock) {
            require(!isLocked[tokenId], "PROP:LOCKED");
        }
        require(to != address(0), "PROP:INVALID_RECEIVER");

        uint256 balance = _fractionBalances[tokenId][from];
        require(balance >= amount && amount > 0, "PROP:INSUFFICIENT_SHARES");

        unchecked {
            _fractionBalances[tokenId][from] = balance - amount;
        }
        if (_fractionBalances[tokenId][from] == 0) {
            _fractions[tokenId].holders.remove(from);
        }

        _fractionBalances[tokenId][to] += amount;
        _fractions[tokenId].holders.add(to);

        emit FractionTransferred(tokenId, from, to, amount);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
