// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "suave-std/protocols/ChatGPT.sol";
import "forge-std/console.sol";

contract Suciphus {
    string private apiKey;

    constructor(string memory _apiKey) {
        apiKey = _apiKey;
    }
    function chat(string memory userMessage) public returns (string memory) {
        ChatGPT chatgpt = new ChatGPT(apiKey);
        ChatGPT.Message[] memory messages = new ChatGPT.Message[](1);
        messages[0] = ChatGPT.Message(ChatGPT.Role.User, userMessage);
        console.log("User message: ", userMessage);
        string memory completion = chatgpt.complete(messages);
        console.log("Completion: ", completion);
        return completion;
    }
}

