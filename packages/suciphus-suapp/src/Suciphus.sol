// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Assistant.sol";
import "forge-std/console.sol";

contract Suciphus {
    string private apiKey;
    Assistant private assistant;  // State variable to hold the ChatGPT instance

    constructor(string memory _apiKey) {
        apiKey = _apiKey;
        assistant = new Assistant(apiKey, "assistantId", address(this));
    }
    
    function submitPrompt(string memory userMessage) public {
        assistant.createMessageAndRun(msg.sender, userMessage);
    }

    
}