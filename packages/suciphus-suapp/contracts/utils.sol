// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Suave} from "suave-std/suavelib/Suave.sol";

abstract contract WithUtils {
    /** Convenience function to hash a string. */
    function id(string memory strId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(strId));
    }

    function bytesToString(
        bytes memory data
    ) internal pure returns (string memory) {
        uint256 length = data.length;
        bytes memory chars = new bytes(length);

        for (uint i = 0; i < length; i++) {
            chars[i] = data[i];
        }

        return string(chars);
    }

    function addressToString(
        address _addr
    ) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase characters are between 65 ('A') and 90 ('Z')
            if (bStr[i] >= 0x41 && bStr[i] <= 0x5A) {
                // Convert uppercase to lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    /** Reads a DataId to see if it has been set (not zero). */
    function isValueSet(
        Suave.DataId recordId
    ) internal pure returns (bool isSet) {
        assembly {
            isSet := iszero(iszero(recordId))
        }
    }
}
