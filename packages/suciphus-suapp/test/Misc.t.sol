// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/utils.sol";

contract MiscTest is Test, WithUtils {
    Suave.DataId public recordId;

    /// @notice allows you to set a Suave.DataId using a uint.
    /// Not good for production, but useful for testing.
    function setId(uint newId) public {
        assembly {
            sstore(recordId.slot, newId)
        }
    }

    function testIsValueSet() public {
        bool isSet = isValueSet(recordId);
        assertTrue(
            !isSet,
            "isValueSet should return false for an unset recordId"
        );

        setId(0x42);
        isSet = isValueSet(recordId);
        assertTrue(isSet, "isValueSet should return true for a set recordId");

        setId(0);
    }
}
