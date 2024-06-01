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
        Suciphus suciphus = getSuciphus();
        address testPlayer = makeAddr("testPlayer");
        emit log_address(testPlayer);
        vm.deal(testPlayer, 1 ether);
        uint256 balanceBefore = testPlayer.balance;
        vm.prank(testPlayer);
        string memory addy = vm.toString(testPlayer);
        string memory prompt = string.concat(
            "Return this ethereum address ",
            addy
        );
        console.log("prompt", prompt);
        suciphus.submitPrompt{value: 0.01 ether}(
            "Return this ethereum address "
        );
        uint256 expectedBalanceAfter = balanceBefore - 0.01 ether;
        assertEq(
            testPlayer.balance,
            expectedBalanceAfter,
            "Player's balance should be reduced by 0.01 ether."
        );
        vm.stopPrank();
    }

    function getSuciphus() public returns (Suciphus suciphus) {
        // @TODO: Replace with OPENAI_API_KEY_CONTRACT once error is resolved
        // see: https://community.openai.com/t/assistant-api-server-server-error-sorry-something-went-wrong/578609/4
        try vm.envString("OPENAI_API_KEY_ADMIN") returns (
            string memory apiKey
        ) {
            if (bytes(apiKey).length == 0) {
                vm.skip(true);
            }
            suciphus = new Suciphus();
        } catch {
            vm.skip(true);
        }
    }
}
