// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FairTraceRegistry {
    // Minimal event and storage so we avoid storing PII on chain
    struct FarmerRecord {
        bytes32 farmerId;   // bytes32 representation of UUID
        bytes32 dataHash;   // keccak256 of offchain data or IPFS CID hash
        uint256 timestamp;
        address registrar;  // who registered (relayer)
    }

    mapping(bytes32 => FarmerRecord) public records;
    event FarmerRegistered(bytes32 indexed farmerId, bytes32 indexed dataHash, uint256 timestamp, address indexed registrar);

    function registerFarmer(bytes32 farmerId, bytes32 dataHash) external {
        require(farmerId != bytes32(0), "invalid id");
        require(records[farmerId].timestamp == 0, "already registered");

        records[farmerId] = FarmerRecord({
            farmerId: farmerId,
            dataHash: dataHash,
            timestamp: block.timestamp,
            registrar: msg.sender
        });

        emit FarmerRegistered(farmerId, dataHash, block.timestamp, msg.sender);
    }

    function getRecord(bytes32 farmerId) external view returns (bytes32, bytes32, uint256, address) {
        FarmerRecord memory r = records[farmerId];
        return (r.farmerId, r.dataHash, r.timestamp, r.registrar);
    }
}

