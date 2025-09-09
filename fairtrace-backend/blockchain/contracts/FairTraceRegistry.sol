// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FairTraceRegistry {
    address public admin;
    uint256 public registrationCount;

    event FarmerRegistered(
        bytes32 indexed farmerUid,
        string saccoMembershipId,
        string saccoLocation,
        uint256 timestamp,
        bytes32 registrationHash
    );

    event ProductIssued(
        bytes32 indexed pid,
        bytes32 indexed farmerUid,
        string qrRef,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerFarmer(
        bytes32 farmerUid,
        string calldata saccoMembershipId,
        string calldata saccoLocation,
        bytes32 registrationHash
    ) external returns (bool) {
        registrationCount += 1;
        emit FarmerRegistered(farmerUid, saccoMembershipId, saccoLocation, block.timestamp, registrationHash);
        return true;
    }

    function issueProduct(
        bytes32 pid,
        bytes32 farmerUid,
        string calldata qrRef
    ) external returns (bool) {
        emit ProductIssued(pid, farmerUid, qrRef, block.timestamp);
        return true;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
