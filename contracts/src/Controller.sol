// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContriToken.sol";

/**
 * @title Controller
 * @dev Controller contract for the ContriBlock platform
 * Manages contributions, token minting, and impact distribution
 */
contract Controller is Ownable {
    ContriToken public token;

    struct Contribution {
        uint256 id;
        address author;
        string cid;
        bool approved;
        uint256 mintedAmount;
    }

    mapping(uint256 => Contribution) public contributions;
    mapping(address => bool) public verifiers;

    event ContributionRegistered(uint256 indexed id, address indexed author, string cid);
    event TokensMinted(uint256 indexed id, address indexed author, uint256 amount);
    event ImpactDistributed(uint256[] ids, uint256[] scores, uint256 poolAmount);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    /**
     * @dev Constructor
     * @param _token The address of the ContriToken contract
     * @param initialOwner The address of the initial owner
     */
    constructor(address _token, address initialOwner) {
        require(_token != address(0), "Token cannot be zero address");
        require(initialOwner != address(0), "Owner cannot be zero address");

        token = ContriToken(_token);
        _transferOwnership(initialOwner); // ✅ OpenZeppelin v5 way
    }

    /**
     * @dev Add a verifier
     * @param _verifier The address of the verifier
     */
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Verifier cannot be zero address");
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    /**
     * @dev Remove a verifier
     * @param _verifier The address of the verifier
     */
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    /**
     * @dev Register a contribution
     * @param _id The ID of the contribution
     * @param _author The address of the author
     * @param _cid The IPFS CID of the contribution
     */
    function registerContribution(uint256 _id, address _author, string calldata _cid) external {
        require(_author != address(0), "Author cannot be zero address");
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(contributions[_id].author == address(0), "Contribution already exists");

        contributions[_id] = Contribution({
            id: _id,
            author: _author,
            cid: _cid,
            approved: false,
            mintedAmount: 0
        });

        emit ContributionRegistered(_id, _author, _cid);
    }

    /**
     * @dev Mint tokens on approval of a contribution
     * @param _id The ID of the contribution
     * @param _amount The amount of tokens to mint
     */
    function mintOnApproval(uint256 _id, uint256 _amount) external onlyVerifier {
        Contribution storage contribution = contributions[_id];
        require(contribution.author != address(0), "Contribution does not exist");
        require(!contribution.approved, "Contribution already approved");
        require(_amount > 0, "Amount must be greater than zero");

        contribution.approved = true;
        contribution.mintedAmount = _amount;

        token.mint(contribution.author, _amount);

        emit TokensMinted(_id, contribution.author, _amount);
    }

    /**
     * @dev Distribute impact to contributions
     * @param _ids The IDs of the contributions
     * @param _scores The impact scores of the contributions
     * @param _poolAmount The total amount of tokens to distribute
     */
    function distributeImpact(
        uint256[] calldata _ids,
        uint256[] calldata _scores,
        uint256 _poolAmount
    ) external onlyOwner {
        require(_ids.length == _scores.length, "Arrays must have same length");
        require(_ids.length > 0, "Arrays cannot be empty");
        require(_poolAmount > 0, "Pool amount must be greater than zero");

        uint256 totalScore = 0;
        for (uint256 i = 0; i < _scores.length; i++) {
            totalScore += _scores[i];
        }

        require(totalScore > 0, "Total score must be greater than zero");

        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 id = _ids[i];
            uint256 score = _scores[i];
            Contribution storage contribution = contributions[id];

            require(contribution.author != address(0), "Contribution does not exist");
            require(contribution.approved, "Contribution not approved");

            uint256 amount = (_poolAmount * score) / totalScore;
            if (amount > 0) {
                token.mint(contribution.author, amount);
            }
        }

        emit ImpactDistributed(_ids, _scores, _poolAmount);
    }
}
