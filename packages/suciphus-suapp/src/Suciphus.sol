// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "solidity-stringutils/strings.sol";

import "./Assistant.sol";
import "forge-std/console.sol";

contract Suciphus {
    string private apiKey;
    Assistant private assistant;  
    string private assistantId = "asst_RuBcImIY1V98C7I8HOu3D5pu";
    uint256 public SUBMISSION_FEE = 0.01 ether;

    constructor(string memory _apiKey) {
        apiKey = _apiKey;
        assistant = new Assistant(apiKey, assistantId, address(this));
    }
    
    function submitPrompt(string memory prompt) public payable {
        // @todo: maybe should prevent overpaying for submission by checking msg.value
        require(msg.value >= SUBMISSION_FEE, "Insufficient funds sent for submission");
        assistant.createMessageAndRun(msg.sender, prompt);
        // var s = "A B C B D".toSlice();
        // var needle = "B".toSlice();
        // var substring = s.until(s.copy().find(needle).beyond(needle));
    }

    function getSubmissionFee() public view returns (uint256) {
        return SUBMISSION_FEE;
    }
}