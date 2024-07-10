// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "solidity-stringutils/strings.sol";
import "suave-std/Context.sol";
import {Suapp} from "suave-std/Suapp.sol";
import "solady/src/utils/LibString.sol";
import "./Assistant.sol";
import "forge-std/console.sol";
import "openzeppelin-contracts/contracts/utils/math/Math.sol";

contract Suciphus is Suapp {
    using strings for *;

    Suave.DataId apiKeyRecord;
    string public API_KEY = "API_KEY";

    // string private apiKey;
    Assistant private assistant;

    // @todo: set this with conf inputs or constructor
    string private assistantId = "asst_RuBcImIY1V98C7I8HOu3D5pu";
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

    // Mapping of threadId to the round number to enforce rejection of late submissions
    // This mapping is used to check if a submission is within the valid round timeframe when determining success.
    mapping(string => uint256) public threadToRound;

    constructor()
    /*
        string memory _apiKey,
        string memory _assistantId
    */ {
        // apiKey = _apiKey;
        assistant = new Assistant("apiKey", assistantId, address(this));
    }

    // Define debugging events
    event LogString(string label, string message);
    event LogAddress(string label, address value);
    event LogUint(string label, uint256 value);
    event LogBytes(string label, bytes value);

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

    uint64 public stateNum;
    event UpdatedState(uint64 newState);
    event NothingHappened();

    receive() external payable {}

    fallback() external payable {
        emit NothingHappened();
    }

    function updateAPIKeyOnchain(Suave.DataId _apiKeyRecord) public {
        apiKeyRecord = _apiKeyRecord;
    }

    function registerAPIKeyOffchain() public returns (bytes memory) {
        bytes memory keyData = Context.confidentialInputs();

        address[] memory peekers = new address[](1);
        peekers[0] = address(this);

        Suave.DataRecord memory record = Suave.newDataRecord(
            0,
            peekers,
            peekers,
            "api_key"
        );
        Suave.confidentialStore(record.id, API_KEY, keyData);

        return
            abi.encodeWithSelector(
                this.updateAPIKeyOnchain.selector,
                record.id
            );
    }

    function submitPromptCallback(
        address player,
        string memory threadId,
        string memory runId,
        bytes memory data
    ) public {
        // Update the round for the threadId
        threadToRound[threadId] = round;
        // @todo potentially store the threadId in the contract by player address

        emit PromptSubmitted(player, threadId, runId, round, season);
        emit LogBytes("confPrompt", data); // TODO: remove this in prod; for debugging
    }

    function submitPrompt() public returns (bytes memory) {
        require(Suave.isConfidential(), "must call confidentially");
        bytes memory confPrompt = Context.confidentialInputs();
        Prompt memory prompt = abi.decode(confPrompt, (Prompt));

        (string memory runId, string memory threadId) = assistant
            .createMessageAndRun(msg.sender, prompt.threadId, prompt.prompt);

        return
            abi.encodeWithSelector(
                this.submitPromptCallback.selector,
                msg.sender,
                threadId,
                runId,
                confPrompt
            );
    }

    function getSubmissionFee() public view returns (uint256) {
        return SUBMISSION_FEE;
    }

    function getHouseCutPercentage() public view returns (uint256) {
        return HOUSE_CUT_PERCENTAGE;
    }

    // Takes the message sender and then checks to see the result
    // of their prompt
    function checkSubmission(string memory threadId) public returns (bool) {
        // Ensure that this thread's submission is within the current round
        require(threadToRound[threadId] == round, "The round has ended");

        string memory lastMessage = assistant.getLastMessage(
            msg.sender,
            threadId
        );

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

    function bytesToString(
        bytes memory data
    ) internal pure returns (string memory) {
        uint256 length = data.length;
        bytes memory chars = new bytes(length);

        for (uint i = 0; i < length; i++) {
            chars[i] = data[i];
        }

        return string(chars);
    }

    function addressToString(
        address _addr
    ) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase characters are between 65 ('A') and 90 ('Z')
            if (bStr[i] >= 0x41 && bStr[i] <= 0x5A) {
                // Convert uppercase to lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}
