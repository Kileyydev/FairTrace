// contracts/Delivery.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeliveryContract {
    struct Delivery {
        uint id;
        address transporter;
        string status; // "pending", "accepted", "delivered"
    }

    mapping(uint => Delivery) public deliveries;
    uint public nextDeliveryId;

    event DeliveryCreated(uint id);
    event DeliveryAccepted(uint id, address transporter);
    event DeliveryCompleted(uint id, address transporter);

    // Admin adds a delivery request
    function createDelivery() external returns (uint) {
        uint deliveryId = nextDeliveryId;
        deliveries[deliveryId] = Delivery(deliveryId, address(0), "pending");
        nextDeliveryId++;
        emit DeliveryCreated(deliveryId);
        return deliveryId;
    }

    // Transporter accepts delivery
    function acceptDelivery(uint deliveryId) external {
        require(deliveries[deliveryId].transporter == address(0), "Already assigned");
        deliveries[deliveryId].transporter = msg.sender;
        deliveries[deliveryId].status = "accepted";
        emit DeliveryAccepted(deliveryId, msg.sender);
    }

    // Transporter marks as delivered
    function completeDelivery(uint deliveryId) external {
        require(deliveries[deliveryId].transporter == msg.sender, "Not your delivery");
        deliveries[deliveryId].status = "delivered";
        emit DeliveryCompleted(deliveryId, msg.sender);
    }

    // View delivery
    function getDelivery(uint deliveryId) external view returns (Delivery memory) {
        return deliveries[deliveryId];
    }
}
