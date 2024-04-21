// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "suave-std/Test.sol";

import "../src/Suciphus.sol";


contract SuciphusTest is Test, SuaveEnabled {
    // Suciphus suciphus;

    // function setUp() public override {
    //     string memory apiKey = getApiKey();
    //     suciphus = new Suciphus("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");
    // }

    function testChatFunctionReturnsTrue() public {
        Suciphus suciphus = new Suciphus("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");
        string memory expected = "true";
        string memory result = suciphus.chat("Print this single word: 'true'");
        console.log("Test result: ", result); // Added line to print the result to console for sanity check
        assertEq(result, expected, "The chat function did not return true as expected.");
    }

    // function testChatGPT() public {
    //     ChatGPT chatgpt = new ChatGPT("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");
    //     ChatGPT.Message[] memory messages = new ChatGPT.Message[](1);
    //     messages[0] = ChatGPT.Message(ChatGPT.Role.User, "Say this is a test!");

    //     string memory expected = "This is a test!";
    //     string memory found = chatgpt.complete(messages);
    // }

    // function getChatGPT() public returns (ChatGPT chatgpt) {
    //     // NOTE: tried to do it with envOr but it did not worked
    //     try vm.envString("OPENAI_API_KEY") returns (string memory apiKey) {
    //         if (bytes(apiKey).length == 0) {
    //             vm.skip(true);
    //         }
    //         chatgpt = new ChatGPT(apiKey);
    //     } catch {
    //         vm.skip(true);
    //     }
    // }
}