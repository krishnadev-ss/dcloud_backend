// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SimpleContract {
    uint public myNumber;  // Public state variable

    event NumberUpdated(uint newValue);

    constructor() {
        myNumber = 0;  // Initialize the state variable
    }

    function setNumber(uint newValue) public {
        myNumber = newValue;
        emit NumberUpdated(newValue);
    }

    function getNumber() public view returns (uint) {
        return myNumber;
    }
}
