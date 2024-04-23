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

    // function testChatFunctionReturnsTrue() public {
    //     Suciphus suciphus = getSuciphus();
    //     string memory expected = "true";
    //     suciphus.submitPrompt("Print this single word: 'true'");
    //     console.log("Test result: ", result); // Added line to print the result to console for sanity check
    //     assertEq(result, expected, "The chat function did not return true as expected.");
    // }

    function getSuciphus() public returns (Suciphus suciphus) {
        try vm.envString("OPENAI_API_KEY_CONTRACT") returns (string memory apiKey) {
            if (bytes(apiKey).length == 0) {
                vm.skip(true);
            }
            suciphus = new Suciphus(apiKey);
        } catch {
            vm.skip(true);
        }
    }
}