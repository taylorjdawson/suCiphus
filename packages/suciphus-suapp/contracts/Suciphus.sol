// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "solidity-stringutils/strings.sol";
import {Suave} from "suave-std/suavelib/Suave.sol";
import "suave-std/Context.sol";
import {Suapp} from "suave-std/Suapp.sol";
import "solady/src/utils/LibString.sol";
import {Assistant} from "./Assistant.sol";
import "forge-std/console.sol";
import "openzeppelin-contracts/contracts/utils/math/Math.sol";
import {WithUtils} from "./utils.sol";
import {WETH9} from "./WETH9.sol";

contract Suciphus is Suapp, WithUtils {
    using strings for *;

    Suave.DataId apiKeyRecord;
    Suave.DataId assistantIdRecord;

    // @todo: set this with conf inputs or constructor
    uint256 public SUBMISSION_FEE = 0.01 ether;

    // This percentage represents the portion of funds retained by the contract to support the dapp's operations
    // Currently this is set to 10%
    uint256 public HOUSE_CUT_PERCENTAGE = 10;

    // Season - we can update the contract and change the "season"
    // a season is a fixed period of time where `n` rounds may be played
    // when the game mechanics change there will be a new "season"
    uint256 public season = 0;

    // Current round number in the ongoing season
    uint256 public round = 0;

    string private constant NAMESPACE_API = "suciphus:openai_api_key";
    string private constant NAMESPACE_ASSISTANT =
        "suciphus:openai_assistant_id";
    string private constant KEY_API_KEY = "api_key";
    string private constant KEY_ASSISTANT_ID = "assistant_id";
    uint public constant ATTEMPTS_PER_ETH = 100;

    WETH9 public WETH;

    // Mapping of id(threadId) to the round number to enforce rejection of late submissions
    // This mapping is used to check if a submission is within the valid round timeframe when determining success.
    mapping(bytes32 => uint256) public threadToRound;

    // mapping of id(threadId) to the player address, to verify that the player is the one who submitted the original prompt
    mapping(bytes32 => address) public threadToPlayer;

    // Mapping from player address to list of thread IDs
    mapping(address => string[]) private playerToThreads;

    address private owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /** Restricts function access to owner of given threadId.
     * NOTE: This restricts access _only_ if a threadId has been set.
     */
    modifier onlyThreadOwner(string memory threadId) {
        bytes32 threadKey = id(threadId);
        if (threadKey != id("")) {
            require(
                threadToPlayer[id(threadId)] == msg.sender,
                "Only the thread owner can call this function"
            );
        }
        _;
    }

    modifier confidential() {
        require(Suave.isConfidential(), "must call confidentially");
        _;
    }

    constructor(address weth) {
        owner = msg.sender;
        WETH = WETH9(payable(weth));
    }

    // Define debugging events
    event LogString(string label, string message);
    event LogAddress(string label, address value);
    event LogUint(string label, uint256 value);
    event LogBytes(string label, bytes value);
    event LogStrings(string label, string[] values);

    event SuccessfulSubmission(
        address indexed player,
        uint256 reward,
        uint256 round,
        uint256 season
    );

    event PromptSubmitted(
        address indexed player,
        // @todo: possible make this an indexed field to make it easier to query
        string threadId,
        string runId,
        uint256 round,
        uint256 season
    );

    struct Prompt {
        string prompt;
        string threadId;
        string runId; // Added runId to the Prompt struct
    }

    struct AuthRegistration {
        string apiKey;
        string assistantId;
    }

    struct TokenDeposit {
        uint256 amount;
    }

    uint64 public stateNum;
    event UpdatedState(uint64 newState);
    event NothingHappened();

    receive() external payable {}

    fallback() external payable {
        emit NothingHappened();
    }

    function getApiKey() public returns (string memory) {
        require(isValueSet(apiKeyRecord), "API key not set");
        bytes memory apiKey = Suave.confidentialRetrieve(
            apiKeyRecord,
            KEY_API_KEY
        );
        return string(apiKey);
    }

    function getAssistantId() public returns (string memory) {
        require(isValueSet(assistantIdRecord), "Assistant id not set");
        bytes memory assistantId = Suave.confidentialRetrieve(
            assistantIdRecord,
            KEY_ASSISTANT_ID
        );
        return string(assistantId);
    }

    function getAssistant() public returns (Assistant assistant) {
        string memory apiKey = getApiKey();
        string memory assistantId = getAssistantId();
        assistant = new Assistant(apiKey, assistantId);
    }

    function updateAuthOnchain(
        Suave.DataId _apiKeyRecord,
        Suave.DataId _assistantIdRecord
    ) public onlyOwner {
        apiKeyRecord = _apiKeyRecord;
        assistantIdRecord = _assistantIdRecord;
    }

    function registerAuthOffchain()
        public
        onlyOwner
        confidential
        returns (bytes memory)
    {
        bytes memory authData = Context.confidentialInputs();
        AuthRegistration memory auth = abi.decode(authData, (AuthRegistration));

        address[] memory peekers = new address[](1);
        peekers[0] = address(this);

        Suave.DataId apiKeyRecordId;
        Suave.DataId assistantIdRecordId;
        if (bytes(auth.apiKey).length > 0) {
            Suave.DataRecord memory record = Suave.newDataRecord(
                0,
                peekers,
                peekers,
                NAMESPACE_API
            );
            Suave.confidentialStore(record.id, KEY_API_KEY, bytes(auth.apiKey));
            apiKeyRecordId = record.id;
        }
        if (bytes(auth.assistantId).length > 0) {
            Suave.DataRecord memory record = Suave.newDataRecord(
                0,
                peekers,
                peekers,
                NAMESPACE_ASSISTANT
            );
            Suave.confidentialStore(
                record.id,
                KEY_ASSISTANT_ID,
                bytes(auth.assistantId)
            );
            assistantIdRecordId = record.id;
        }
        return
            abi.encodeWithSelector(
                this.updateAuthOnchain.selector,
                apiKeyRecordId,
                assistantIdRecordId
            );
    }

    function depositTokens() public confidential {}

    function submitPromptCallback(
        string memory threadId,
        address player
    ) public emitOffchainLogs {
        uint256 requiredAmount = 0.01 ether;
        require(
            WETH.balanceOf(player) >= requiredAmount,
            "Insufficient balance to submit prompt"
        );

        WETH.transferFrom(player, address(this), requiredAmount);
        // Update the round for the threadId
        threadToRound[id(threadId)] = round;
        // Map threadId to player if it's not already mapped
        if (threadToPlayer[id(threadId)] == address(0)) {
            threadToPlayer[id(threadId)] = player;
            // Add threadId to the list of threads for the player
            playerToThreads[player].push(threadId);
        }
    }

    function submitPrompt() public confidential returns (bytes memory) {
        bytes memory confPrompt = Context.confidentialInputs();
        Prompt memory prompt = abi.decode(confPrompt, (Prompt));

        Assistant assistant = getAssistant();
        (string memory runId, string memory threadId) = assistant
            .createMessageAndRun(msg.sender, prompt.threadId, prompt.prompt);

        emit PromptSubmitted(msg.sender, threadId, runId, round, season);
        return
            abi.encodeWithSelector(
                this.submitPromptCallback.selector,
                threadId,
                msg.sender
            );
    }

    function getSubmissionFee() public view returns (uint256) {
        return SUBMISSION_FEE;
    }

    function getHouseCutPercentage() public view returns (uint256) {
        return HOUSE_CUT_PERCENTAGE;
    }

    function onReadMessages() public emitOffchainLogs {}

    function readMessages() public confidential returns (bytes memory) {
        bytes memory confInputs = Context.confidentialInputs();
        string memory threadId = abi.decode(confInputs, (Prompt)).threadId;
        Assistant assistant = getAssistant();
        string[] memory messages = assistant.getMessages(threadId);
        emit LogStrings("messages", messages);
        return abi.encodeWithSelector(this.onReadMessages.selector);
    }

    function onCheckSubmission(
        bool containsPlayerAddress,
        address player
    ) public emitOffchainLogs {
        if (containsPlayerAddress) {
            uint256 balance = WETH.balanceOf(address(this));
            uint256 houseCut = Math.mulDiv(balance, HOUSE_CUT_PERCENTAGE, 100);
            uint256 amountToSend = balance - houseCut;

            emit SuccessfulSubmission(msg.sender, amountToSend, round, season);
            WETH.transfer(player, amountToSend);
            // the round is autoclosed on succesful submission
            nextRound();
        } else {
            emit NothingHappened();
        }
    }

    /// Returns true if submission returned an ethereum address.
    function checkSubmission() public returns (bytes memory) {
        bytes memory confInputs = Context.confidentialInputs();
        Prompt memory prompt = abi.decode(confInputs, (Prompt));
        // TODO: add onlyThreadOwner here and elsewhere
        // Ensure that this thread's submission is within the current round
        require(
            threadToRound[id(prompt.threadId)] == round,
            "The round has ended"
        );

        Assistant assistant = getAssistant();

        string memory lastMessage = assistant.getMessages(
            prompt.threadId,
            prompt.runId,
            1
        );
        string memory lowerLastMessage = toLower(lastMessage);
        strings.slice memory lastMessageSlice = lowerLastMessage.toSlice();
        bool containsPlayerAddress = lastMessageSlice.contains(
            addressToString(msg.sender).toSlice()
        );

        // @todo consider the event where the prompt is succesful but the contract reverts

        // return containsPlayerAddress;
        return
            abi.encodeWithSelector(
                this.onCheckSubmission.selector,
                containsPlayerAddress,
                msg.sender
            );
    }

    /// @notice Retrieves the current round number
    /// @return The current round number
    function getCurrentRound() public view returns (uint256) {
        return round;
    }

    // advances to the next round
    // @todo call this function when checking a submission and it is sucessful
    function nextRound() private {
        // @todo need to send the winning thread to the ai to update the assistant
        round++;
        // Clear the thread to round mapping to free up storage
        // delete threadToRound;
    }

    function getThreadIdsByPlayer(
        address player
    ) public view returns (string[] memory) {
        return playerToThreads[player];
    }
}
