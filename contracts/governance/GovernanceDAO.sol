// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RoleManager} from "../common/RoleManager.sol";
import {DataTypes} from "../common/DataTypes.sol";
import {IFractionLedger} from "../revenue/RevenueDistribution.sol";

/**
 * @title GovernanceDAO
 * @notice Simple token-weighted governance for property decisions.
 */
contract GovernanceDAO is RoleManager {
    uint256 private _proposalIdTracker;
    mapping(uint256 => DataTypes.Proposal) private _proposals;
    mapping(uint256 => mapping(address => bool)) private _hasVoted;

    address public immutable propertyToken;

    event ProposalCreated(uint256 indexed proposalId, string description, uint64 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address admin, address _propertyToken) RoleManager(admin) {
        propertyToken = _propertyToken;
    }

    function createProposal(string calldata description, uint64 deadline, address target, bytes calldata callData)
        external
        onlyOperator
        returns (uint256 proposalId)
    {
        require(deadline > block.timestamp, "DAO:DEADLINE");

        proposalId = ++_proposalIdTracker;
        _proposals[proposalId] = DataTypes.Proposal({
            description: description,
            createdAt: uint64(block.timestamp),
            deadline: deadline,
            forVotes: 0,
            againstVotes: 0,
            status: DataTypes.ProposalStatus.ACTIVE,
            callData: callData,
            target: target
        });

        emit ProposalCreated(proposalId, description, deadline);
    }

    function vote(uint256 proposalId, bool support, uint256 propertyTokenId) external {
        DataTypes.Proposal storage proposal = _requireActive(proposalId);
        require(block.timestamp <= proposal.deadline, "DAO:DEADLINE_PASSED");
        require(!_hasVoted[proposalId][_msgSender()], "DAO:ALREADY_VOTED");

        uint256 weight = IFractionLedger(propertyToken).fractionBalanceOf(propertyTokenId, _msgSender());
        require(weight > 0, "DAO:NO_WEIGHT");

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        _hasVoted[proposalId][_msgSender()] = true;

        emit Voted(proposalId, _msgSender(), support, weight);
    }

    function executeProposal(uint256 proposalId) external onlyOperator {
        DataTypes.Proposal storage proposal = _requireActive(proposalId);
        require(block.timestamp > proposal.deadline, "DAO:DEADLINE_NOT_PASSED");
        require(proposal.forVotes > proposal.againstVotes, "DAO:NOT_APPROVED");

        proposal.status = DataTypes.ProposalStatus.EXECUTED;
        if (proposal.target != address(0) && proposal.callData.length > 0) {
            (bool ok, ) = proposal.target.call(proposal.callData);
            require(ok, "DAO:CALL_FAILED");
        }

        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (DataTypes.Proposal memory) {
        return _proposals[proposalId];
    }

    function _requireActive(uint256 proposalId) internal view returns (DataTypes.Proposal storage) {
        DataTypes.Proposal storage proposal = _proposals[proposalId];
        require(proposal.status == DataTypes.ProposalStatus.ACTIVE, "DAO:NOT_ACTIVE");
        return proposal;
    }
}

