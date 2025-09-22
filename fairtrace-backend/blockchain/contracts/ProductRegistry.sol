// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ProductRegistry {
    struct ProductRecord {
        string pid;
        string title;
        string farmerEmail;
        uint256 timestamp;
        string metadataURI; // optional pointer to off-chain metadata
    }

    address public owner;
    mapping(string => ProductRecord) public records; // pid => record
    event ProductRegistered(string pid, string title, string farmerEmail, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    // Registers a product. Only owner (backend) expected to call.
    function registerProduct(
        string calldata pid,
        string calldata title,
        string calldata farmerEmail,
        string calldata metadataURI
    ) external {
        require(bytes(pid).length > 0, "pid required");
        require(bytes(records[pid].pid).length == 0, "pid exists");
        records[pid] = ProductRecord(pid, title, farmerEmail, block.timestamp, metadataURI);
        emit ProductRegistered(pid, title, farmerEmail, block.timestamp);
    }

    function getProduct(string calldata pid) external view returns (ProductRecord memory) {
        return records[pid];
    }
}
