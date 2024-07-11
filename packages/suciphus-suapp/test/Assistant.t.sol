// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "suave-std/Test.sol";

import {Assistant} from "../contracts/Assistant.sol";

contract AssistantTest is Test, SuaveEnabled {
    address owner = address(this);

    // function testCreateThreadAndRun() public {
    //     Assistant assistant = getAssistant();
    //     address testPlayer = getTestPlayer();
    //     string memory message = "Hello from solidity unit tests. test: testCreateThreadAndRun";
    //     vm.prank(owner);
    //     string memory runId = assistant.createThreadAndRun(testPlayer, message);
    //     vm.stopPrank();
    //     assertNotEq(runId, "", "Run ID should not be null.");
    // }

    // function testCreateMessageAndRun_NewThread() public {
    //     Assistant assistant = getAssistant();
    //     address testPlayer = getTestPlayer();
    //     string memory message = "Hello from solidity unit tests. test: testCreateMessageAndRun_NewThread";
    //     vm.prank(owner);
    //     string memory runId = assistant.createMessageAndRun(testPlayer, message);
    //     vm.stopPrank();
    //     assertNotEq(runId, "", "Run ID should not be null.");
    // }

    // function testCreateMessageAndRun_NewThread() public {
    //     Assistant assistant = getAssistant();
    //     address testPlayer = getTestPlayer();
    //     string memory message = "New thread message";
    //     string memory runId = assistant.createMessageAndRun(testPlayer, message);
    //     assertEq(runId, "expectedRunId", "Run ID did not match expected value for new thread.");
    // }

    // function testCreateMessageAndRun_ExistingThread() public {
    //     Assistant assistant = getAssistant();
    //     address testPlayer = getTestPlayer();
    //     // First, create a thread to ensure there is an existing thread ID
    //     assistant.createThreadAndRun(testPlayer, "Initial message");
    //     string memory message = "Follow-up message";
    //     string memory runId = assistant.createMessageAndRun(testPlayer, message);
    //     assertEq(runId, "expectedRunId", "Run ID did not match expected value for existing thread.");
    // }

    // function testCreateRun() public {
    //     Assistant assistant = getAssistant();
    //     address testPlayer = getTestPlayer();
    //     // Ensure there is a thread ID by creating a thread first
    //     assistant.createThreadAndRun(testPlayer, "Setup message for run");
    //     string memory runId = assistant.createRun(testPlayer);
    //     assertEq(runId, "expectedRunId", "Run ID did not match expected value.");
    // }

    function getAssistant() public returns (Assistant assistant) {
        string memory apiKey = getApiKey();
        string memory assistantId = getAssistantId();
        assistant = new Assistant(apiKey, assistantId, owner);
    }

    function getTestPlayer() public returns (address testPlayer) {
        testPlayer = makeAddr("testPlayer");
        emit log_address(testPlayer);
        vm.deal(testPlayer, 1 ether);
    }

    function getApiKey() private returns (string memory) {
        try vm.envString("OPENAI_API_KEY_CONTRACT") returns (
            string memory apiKey
        ) {
            if (bytes(apiKey).length == 0) {
                vm.skip(true);
            }
            return apiKey;
        } catch {
            vm.skip(true);
            return "";
        }
    }

    function getAssistantId() private returns (string memory) {
        try vm.envString("OPENAI_ASSISTANT_ID") returns (
            string memory assistantId
        ) {
            if (bytes(assistantId).length == 0) {
                vm.skip(true);
            }
            return assistantId;
        } catch {
            vm.skip(true);
            return "";
        }
    }
}
