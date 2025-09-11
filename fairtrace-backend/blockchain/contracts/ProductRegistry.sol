// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductRegistry {
    address public owner;

    struct Entry {
        address farmer;
        string pid;
        bytes32 recordHash;
        uint256 timestamp;
    }

    mapping(string => Entry) public entries;

    event ProductAnchored(address indexed farmer, string pid, bytes32 recordHash, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function anchorProduct(address farmer, string memory pid, bytes32 recordHash) public onlyOwner returns (bool) {
        require(entries[pid].timestamp == 0, "already anchored");
        entries[pid] = Entry(farmer, pid, recordHash, block.timestamp);
        emit ProductAnchored(farmer, pid, recordHash, block.timestamp);
        return true;
    }

    function getEntry(string memory pid) public view returns (address, string memory, bytes32, uint256) {
        Entry memory e = entries[pid];
        return (e.farmer, e.pid, e.recordHash, e.timestamp);
    }
}
