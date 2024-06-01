// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "solidity-stringutils/strings.sol";
import "suave-std/Context.sol";

import "./Assistant.sol";
import "forge-std/console.sol";

contract Suciphus {
    Suave.DataId apiKeyRecord;
    string public API_KEY = "API_KEY";

    // string private apiKey;
    Assistant private assistant;
    string private assistantId = "asst_RuBcImIY1V98C7I8HOu3D5pu";
    uint256 public SUBMISSION_FEE = 0.01 ether;

    // Season - we can update the contract and change the "season"
    // a season is a fixed period of time where `n` rounds may be played
    // when the game mechanics change there will be a new "season"
    uint256 public season = 0;

    //
    uint256 public round = 0;

    // The current pot value
    uint256 public pot = 0 ether;

    // @todo Need to track winning prompt to payout

    // constructor(string memory _apiKey) {
    //     apiKey = _apiKey;
    //     assistant = new Assistant(apiKey, assistantId, address(this));
    // }

    // Define debugging events
    event LogString(string label, string message);
    event LogAddress(string label, address value);
    event LogUint(string label, uint256 value);

    function getAssistant() private returns (Assistant) {
        if (address(assistant) == address(0)) {
            // bytes memory keyData = Suave.confidentialRetrieve(
            //     apiKeyRecord,
            //     API_KEY
            // );
            // string memory apiKey = bytesToString(keyData);
            // if (bytes(apiKey).length == 0) {
            //     revert("API key is undefined");
            // }
            assistant = new Assistant(
                "sk-proj-ws01324BczctxkMGQ9DgT3BlbkFJjwU3ep1q6dswK4cg3T6C",
                assistantId,
                address(this)
            );
        }
        return assistant;
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

    // @todo: might want these prompts to be hidden until the pot reset
    function submitPrompt(string memory prompt) public payable {
        // @todo: maybe should prevent overpaying for submission by checking msg.value
        require(
            msg.value >= SUBMISSION_FEE,
            "Insufficient funds sent for submission"
        );
        emit LogString("submitPrompt", "getting assistant");
        assistant = getAssistant();
        require(address(assistant) != address(0), "Assistant not initialized");
        emit LogString("submitPrompt - prompt", prompt);
        try assistant.createMessageAndRun(msg.sender, prompt) {
            // Successfully called assistant function
        } catch Error(string memory reason) {
            // Catch failing revert() and require() calls
            revert(string(abi.encodePacked("Assistant call failed: ", reason)));
        } catch (bytes memory lowLevelData) {
            // Catch failing assert() and low-level errors
            revert("Assistant call failed: low-level error");
        }
        emit LogAddress("submitPrompt - msg.sender", address(msg.sender));
    }

    function getSubmissionFee() public view returns (uint256) {
        return SUBMISSION_FEE;
    }

    // Allow players to reset the conversation with Suciphus
    // Prevents players from getting stuck with a corrupted thread
    // Consider: Only allow convo resets after `n` messages (to prevent gaming?)
    function resetThread() public view returns (uint256) {
        return SUBMISSION_FEE;
    }

    // Takes the message sender and then checks to see the result
    // of their prompt
    function checkSubmission() public view returns (uint256) {
        // get the message sender

        // get the last message from the assistant

        // use the stringutils to see if it returned the address somewhere
        // in the response

        // var s = "A B C B D".toSlice();
        // var needle = "B".toSlice();
        // var substring = s.until(s.copy().find(needle).beyond(needle));

        // @todo we want to advance to the next round before returning here
        // this is to prevent race conditions
        // the round is autoclosed on succesful submission
        // nextRound()

        // @todo consider the event where the prompt is succesful but the contract revets

        return SUBMISSION_FEE;
    }

    // advances to the next round
    // @todo call this function when checking a submission and it is sucessful
    function nextRound() private {
        // @todo reset pot value to 0
        // @todo increment round
        // @todo need to send the winning thread to the ai to update the assistant
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
}
