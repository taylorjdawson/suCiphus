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
        suciphus.submitPrompt{value: 0.01 ether}("Print this single word: 'true'");
        uint256 expectedBalanceAfter = balanceBefore - 0.01 ether;
        assertEq(testPlayer.balance, expectedBalanceAfter, "Player's balance should be reduced by 0.01 ether.");
        vm.stopPrank();
    }

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