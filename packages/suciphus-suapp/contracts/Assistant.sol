// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "suave-std/suavelib/Suave.sol";
import "solady/src/utils/JSONParserLib.sol";
import "forge-std/console.sol";
import "forge-std/Vm.sol";

contract Assistant {
    using JSONParserLib for *;

    string private apiKey;
    string private assistantId;
    mapping(string => address) public threadIds;
    address private owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier verifyThreadOwner(string memory threadId, address player) {
        if (bytes(threadId).length != 0) {
            // Check if threadId is not empty
            require(
                threadIds[threadId] == player,
                "Thread ID not found for player address"
            );
        }
        _;
    }

    constructor(
        string memory _apiKey,
        string memory _assistantId,
        address _owner
    ) {
        apiKey = _apiKey;
        assistantId = _assistantId;
        owner = _owner;
    }

    function createThreadAndRun(
        address player,
        string memory message
    ) public onlyOwner returns (string memory) {
        Suave.HttpRequest memory request;
        request.method = "POST";
        request.url = "https://api.openai.com/v1/threads/runs";
        request.headers = new string[](3);
        request.headers[0] = string.concat("Authorization: Bearer ", apiKey);
        request.headers[1] = "Content-Type: application/json";
        request.headers[2] = "OpenAI-Beta: assistants=v2";
        request.body = abi.encodePacked(
            '{"assistant_id": "',
            assistantId,
            '", "thread": {"messages": [{"role": "user", "content": "',
            message,
            '"}]}}'
        );

        bytes memory response = Suave.doHTTPRequest(request);

        JSONParserLib.Item memory item = string(response).parse();
        string memory runId = item.at('"id"').value();
        string memory threadId = item.at('"thread_id"').value();

        threadIds[threadId] = player;
        saveThread(player, threadId);

        return runId;
    }

    function createMessageAndRun(
        address player,
        string memory threadId,
        string memory message
    ) public onlyOwner returns (string memory, string memory) {
        // if (bytes(threadId).length == 0) {
        string memory runId = createThreadAndRun(player, message);
        return (runId, threadId);
        // } else {
        //     Suave.HttpRequest memory request;
        //     request.method = "POST";
        //     request.url = string.concat(
        //         "https://api.openai.com/v1/threads/",
        //         threadId,
        //         "/messages"
        //     );
        //     request.headers = new string[](3);
        //     request.headers[0] = string.concat(
        //         "Authorization: Bearer ",
        //         apiKey
        //     );
        //     request.headers[1] = "Content-Type: application/json";
        //     request.headers[2] = "OpenAI-Beta: assistants=v2";
        //     request.body = abi.encodePacked(
        //         '{"role": "user", "content": "',
        //         message,
        //         '"}'
        //     );

        //     bytes memory response = Suave.doHTTPRequest(request);
        //     // @todo check response
        //     string memory runId = createRun(player, threadId);
        //     return (runId, threadId);
        // }
    }

    function createRun(
        address player,
        string memory threadId
    ) public onlyOwner returns (string memory) {
        Suave.HttpRequest memory request;
        request.method = "POST";
        request.url = string.concat(
            "https://api.openai.com/v1/threads/",
            threadId,
            "/runs"
        );
        request.headers = new string[](3);
        request.headers[0] = string.concat("Authorization: Bearer ", apiKey);
        request.headers[1] = "Content-Type: application/json";
        request.headers[2] = "OpenAI-Beta: assistants=v2";
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
        address player,
        string memory threadId,
        string memory runId,
        string memory limit
    ) public onlyOwner returns (string[] memory) {
        Suave.HttpRequest memory request;
        request.method = "GET";

        string memory queryParams = string.concat(
            bytes(limit).length > 0 || bytes(runId).length > 0 ? "?" : "",
            bytes(limit).length > 0 ? string.concat("limit=", limit) : "",
            bytes(limit).length > 0 && bytes(runId).length > 0 ? "&" : "",
            bytes(runId).length > 0 ? string.concat("runId=", runId) : ""
        );

        request.url = string.concat(
            "https://api.openai.com/v1/threads/",
            threadId,
            "/messages",
            queryParams
        );

        request.headers = new string[](3);
        request.headers[0] = "Content-Type: application/json";
        request.headers[1] = string.concat("Authorization: Bearer ", apiKey);
        request.headers[2] = "OpenAI-Beta: assistants=v2";

        bytes memory response = Suave.doHTTPRequest(request);
        JSONParserLib.Item memory item = string(response).parse();
        JSONParserLib.Item[] memory messages = item.at('"data"').children();

        string[] memory results = new string[](messages.length);

        for (uint i = 0; i < messages.length; i++) {
            results[i] = messages[i]
                .at('"content"')
                .at(0)
                .at('"text"')
                .at('"value"')
                .value();
        }

        return results;
    }

    function getMessages(
        address player,
        string memory threadId
    ) public onlyOwner returns (string[] memory) {
        return getMessages(player, threadId, "", "");
    }

    function getLastMessage(
        address player,
        string memory threadId
    ) public onlyOwner returns (string memory) {
        return getMessages(player, threadId, "", "1")[0];
    }

    function saveThread(
        address player,
        string memory threadId
    ) public onlyOwner {
        Suave.HttpRequest memory request;
        request.method = "POST";
        // @todo: change to production url
        request.url = "http://localhost:3000/api/thread";
        request.headers = new string[](1);
        request.headers[0] = "Content-Type: application/json";
        request.body = abi.encodePacked(
            '{"player":"',
            toString(player),
            '","thread_id":',
            threadId,
            "}"
        );

        Suave.doHTTPRequest(request);
    }

    function toString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";

        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }

        return string(str);
    }
}
