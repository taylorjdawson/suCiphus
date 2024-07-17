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

    // Mapping of id(threadId) to the round number to enforce rejection of late submissions
    // This mapping is used to check if a submission is within the valid round timeframe when determining success.
    mapping(bytes32 => uint256) public threadToRound;

    // mapping of id(threadId) to the player address, to verify that the player is the one who submitted the original prompt
    mapping(bytes32 => address) public threadToPlayer;

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

    constructor() {
        owner = msg.sender;
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
    }

    struct AuthRegistration {
        string apiKey;
        string assistantId;
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

    function submitPromptCallback(
        string memory threadId,
        address player
    ) public emitOffchainLogs {
        // Update the round for the threadId
        threadToRound[id(threadId)] = round;
        // map threadId to player
        threadToPlayer[id(threadId)] = player;
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

    /// Returns true if submission returned an ethereum address.
    /// TODO: move argument to conf store
    function checkSubmission(string memory threadId) public returns (bool) {
        // TODO: add onlyThreadOwner here and elsewhere
        // Ensure that this thread's submission is within the current round
        require(threadToRound[id(threadId)] == round, "The round has ended");

        Assistant assistant = getAssistant();

        string memory lastMessage = assistant.getLastMessage(threadId);

        string memory lowerLastMessage = toLower(lastMessage);

        strings.slice memory lastMessageSlice = lowerLastMessage.toSlice();
        bool containsPlayerAddress = lastMessageSlice.contains(
            addressToString(msg.sender).toSlice()
        );

        if (containsPlayerAddress) {
            uint256 balance = address(this).balance;
            uint256 houseCut = Math.mulDiv(balance, HOUSE_CUT_PERCENTAGE, 100);
            uint256 amountToSend = balance - houseCut;

            payable(msg.sender).transfer(amountToSend);
            emit SuccessfulSubmission(msg.sender, amountToSend, round, season);
            // @todo we want to advance to the next round before returning here
            // this is to prevent race conditions
            // the round is autoclosed on succesful submission
            nextRound();
        }

        // @todo consider the event where the prompt is succesful but the contract reverts

        return containsPlayerAddress;
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
}
