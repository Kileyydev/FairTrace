// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FairTraceTransport {
    address public admin;

    struct Movement {
        string pid;              // product ID
        address transporter;     // transporter wallet
        uint256 acceptedAt;      // timestamp
        uint256 deliveredAt;     // timestamp
        bool accepted;           // accepted status
        bool delivered;          // delivered status
    }

    mapping(string => Movement) public movements;

    event TransportAccepted(
        string pid,
        address transporter,
        uint256 timestamp
    );

    event TransportDelivered(
        string pid,
        address transporter,
        uint256 timestamp
    );

    constructor() {
        admin = msg.sender;
    }

    /// Transporter accepts a delivery
    function acceptTransport(string calldata pid) external {
        Movement storage m = movements[pid];
        require(!m.accepted, "Already accepted");

        m.pid = pid;
        m.transporter = msg.sender;
        m.accepted = true;
        m.acceptedAt = block.timestamp;

        emit TransportAccepted(pid, msg.sender, block.timestamp);
    }

    /// Transporter marks delivery complete
    function completeTransport(string calldata pid) external {
        Movement storage m = movements[pid];

        require(m.accepted, "Not accepted yet");
        require(!m.delivered, "Already delivered");
        require(m.transporter == msg.sender, "Not your delivery");

        m.delivered = true;
        m.deliveredAt = block.timestamp;

        emit TransportDelivered(pid, msg.sender, block.timestamp);
    }

    /// Fetch movement
    function getMovement(string calldata pid)
        external
        view
        returns (Movement memory)
    {
        return movements[pid];
    }
}
