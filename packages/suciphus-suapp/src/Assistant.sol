// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "suave-std/suavelib/Suave.sol";
import "solady/src/utils/JSONParserLib.sol";
import "forge-std/console.sol";

contract Assistant {
    using JSONParserLib for *;

    string private apiKey;
    string private assistantId;
    mapping(address => string) private threadIds;
    address private owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(string memory _apiKey, string memory _assistantId, address _owner) {
        apiKey = _apiKey;
        assistantId = _assistantId;
        owner = _owner;
    }

    function createThreadAndRun(address player, string memory message) public onlyOwner returns (string memory) {
        Suave.HttpRequest memory request;
        request.method = "POST";
        request.url = "https://api.openai.com/v1/threads/runs";
        request.headers = new string[](3);
        request.headers[0] = string.concat("Authorization: Bearer ", apiKey);
        request.headers[1] = "Content-Type: application/json";
        request.headers[2] = "OpenAI-Beta: assistants=v2";
        request.body = abi.encodePacked('{"assistant_id": "', assistantId, '", "thread": {"messages": [{"role": "user", "content": "', message, '"}]}}');
        console.log("request", string(request.body));
        bytes memory response = Suave.doHTTPRequest(request);
        console.log("response");//, string(response));
        JSONParserLib.Item memory item = string(response).parse();
        string memory runId = item.at('"id"').value();
        string memory threadId = item.at('"thread_id"').value();
        threadIds[player] = threadId;

        return runId;
    }

    function createMessageAndRun(address player, string memory message) public onlyOwner returns (string memory) {
        string memory threadId = threadIds[player];
        if (bytes(threadId).length == 0) {
            return createThreadAndRun(player, message);
        } else {
            Suave.HttpRequest memory request;
            request.method = "POST";
            request.url = string.concat("https://api.openai.com/v1/threads/", threadId, "/messages");
            request.headers = new string[](2);
            request.headers[0] = "Content-Type: application/json";
            request.headers[1] = string.concat("Authorization: Bearer ", apiKey);
            request.body = abi.encodePacked('{"role": "user", "content": "', message, '"}');

            Suave.doHTTPRequest(request);
            return createRun(player);
        }
    }

    function createRun(address player) public onlyOwner returns (string memory) {
        string memory threadId = threadIds[player];
        require(bytes(threadId).length > 0, "Thread ID not found for player");

        Suave.HttpRequest memory request;
        request.method = "POST";
        request.url = string.concat("https://api.openai.com/v1/threads/", threadId, "/runs");
        request.headers = new string[](2);
        request.headers[0] = "Content-Type: application/json";
        request.headers[1] = string.concat("Authorization: Bearer ", apiKey);
        request.body = abi.encodePacked('{"assistant_id": "', assistantId, '"}');

        bytes memory response = Suave.doHTTPRequest(request);
        JSONParserLib.Item memory item = string(response).parse();
        string memory runId = item.at('"id"').value();
        return runId;
    }

    function getMessages(address player, string memory runId) public onlyOwner returns (string[] memory) {
        string memory threadId = threadIds[player];
        require(bytes(threadId).length > 0, "Thread ID not found for player");

        Suave.HttpRequest memory request;
        request.method = "GET";
        request.url = string.concat("https://api.openai.com/v1/threads/", threadId, "/messages", (bytes(runId).length > 0 ? string.concat("?runId=", runId) : ""));
        request.headers = new string[](3);
        request.headers[0] = "Content-Type: application/json";
        request.headers[1] = string.concat("Authorization: Bearer ", apiKey);
        request.headers[2] = "OpenAI-Beta: assistants=v2";

        bytes memory response = Suave.doHTTPRequest(request);
        JSONParserLib.Item memory item = string(response).parse();
        JSONParserLib.Item[] memory messages = item.at('"data"').children();

        string[] memory results = new string[](messages.length);
        for (uint i = 0; i < messages.length; i++) {
            results[i] = messages[i].at('"content"').at('"text"').at('"value"').value();
        }

        return results;
    }
}