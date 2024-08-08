// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "suave-std/suavelib/Suave.sol";
import "solady/src/utils/JSONParserLib.sol";
import {WithUtils} from "./utils.sol";

/** Transient contract. Should only be deployed inside a confidential offchain request. */
contract Assistant is WithUtils {
    using JSONParserLib for *;

    string public apiKey;
    string assistantId;

    constructor(string memory _apiKey, string memory _assistantId) {
        apiKey = _apiKey;
        assistantId = _assistantId;
    }

    function newOpenAIRequest(
        string memory method,
        string memory route
    ) internal view returns (Suave.HttpRequest memory request) {
        request.method = method;
        request.url = string.concat("https://api.openai.com/v1/", route);
        request.headers = new string[](3);
        request.headers[0] = string.concat("Authorization: Bearer ", apiKey);
        request.headers[1] = "Content-Type: application/json";
        request.headers[2] = "OpenAI-Beta: assistants=v2";
    }

    function createThreadAndRun(
        address player,
        string calldata message
    ) public returns (string memory runId, string memory threadId) {
        Suave.HttpRequest memory request = newOpenAIRequest(
            "POST",
            "threads/runs"
        );
        request.body = abi.encodePacked(
            '{"assistant_id": "',
            assistantId,
            '", "thread": {"messages": [{"role": "user", "content": "',
            message,
            '"}]}}'
        );

        bytes memory response = Suave.doHTTPRequest(request);
        JSONParserLib.Item memory item = string(response).parse();
        runId = item.at('"id"').value();
        threadId = item.at('"thread_id"').value();
        saveThread(player, threadId);
    }

    function createMessageAndRun(
        address player,
        string calldata _threadId,
        string calldata message
    ) public returns (string memory runId, string memory threadId) {
        if (bytes(_threadId).length == 0) {
            (runId, threadId) = createThreadAndRun(player, message);
        } else {
            threadId = _threadId;
            Suave.HttpRequest memory request = newOpenAIRequest(
                "POST",
                string.concat("threads/", threadId, "/messages")
            );
            request.body = abi.encodePacked(
                '{"role": "user", "content": "',
                message,
                '"}'
            );

            Suave.doHTTPRequest(request);
            runId = createRun(player, threadId);
        }
        return (runId, threadId);
    }

    function createRun(
        address player,
        string memory threadId
    ) public returns (string memory) {
        Suave.HttpRequest memory request = newOpenAIRequest(
            "POST",
            string.concat("threads/", threadId, "/runs")
        );
        request.body = abi.encodePacked(
            '{"assistant_id": "',
            assistantId,
            '"}'
        );

        bytes memory response = Suave.doHTTPRequest(request);
        JSONParserLib.Item memory item = string(response).parse();
        string memory runId = item.at('"id"').value();
        return runId;
    }

    function getMessages(
        string memory threadId,
        string memory runId,
        string memory limit
    ) public returns (string[] memory) {
        string memory queryParams = string.concat(
            bytes(limit).length > 0 || bytes(runId).length > 0 ? "?" : "",
            bytes(limit).length > 0 ? string.concat("limit=", limit) : "",
            bytes(limit).length > 0 && bytes(runId).length > 0 ? "&" : "",
            bytes(runId).length > 0 ? string.concat("runId=", runId) : ""
        );
        Suave.HttpRequest memory request = newOpenAIRequest(
            "GET",
            string.concat("threads/", threadId, "/messages", queryParams)
        );

        bytes memory response = Suave.doHTTPRequest(request);
        JSONParserLib.Item memory item = string(response).parse();
        JSONParserLib.Item[] memory messages = item.at('"data"').children();
        string[] memory results = new string[](messages.length);

        for (uint i = 0; i < messages.length; i++) {
            string memory role = messages[i].at('"role"').value();
            string memory message = messages[i]
                .at('"content"')
                .at(0)
                .at('"text"')
                .at('"value"')
                .value();
            results[i] = string.concat(
                '{"role": ',
                role,
                ', "message": ',
                message,
                "}"
            );
        }

        return results;
    }

    function getMessages(
        string memory threadId
    ) public returns (string[] memory) {
        return getMessages(threadId, "", "");
    }

    function getLastMessage(
        string memory threadId
    ) public returns (string memory) {
        return getMessages(threadId, "", "1")[0];
    }

    function saveThread(address player, string memory threadId) internal {
        Suave.HttpRequest memory request;
        request.method = "POST";
        // @todo: change to production url
        request.url = "https://su-ciphus-admin.vercel.app/api/thread";
        request.headers = new string[](1);
        request.headers[0] = "Content-Type: application/json";
        request.body = abi.encodePacked(
            '{"player":"',
            addressToString(player),
            '","thread_id":',
            threadId,
            "}"
        );

        Suave.doHTTPRequest(request);
    }
}
