// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ProductRegistry {
    struct ProductRecord {
        string pid;           // unique product ID
        string title;         // product title
        string farmerEmail;   // farmer's email (can be linked to FarmerRegistry if needed)
        uint256 timestamp;    // registration time
        string metadataURI;   // optional pointer to off-chain metadata (IPFS/DB)
        string location;      // current location for traceability
    }

    address public owner;
    mapping(string => ProductRecord) private records; // pid => record
    string[] private allProductIds; // list of all product IDs

    // ----------------- Events -----------------
    event ProductRegistered(
        string pid,
        string title,
        string farmerEmail,
        uint256 timestamp,
        string metadataURI
    );

    event ProductLocationUpdated(
        string pid,
        string newLocation,
        uint256 timestamp
    );

    // ----------------- Constructor -----------------
    constructor() {
        owner = msg.sender;
    }

    // ----------------- Core Logic -----------------

    /// @notice Register a new product (admin/owner only)
    function registerProduct(
        string calldata pid,
        string calldata title,
        string calldata farmerEmail,
        string calldata metadataURI
    ) external {
        require(msg.sender == owner, "Only owner can register");
        require(bytes(pid).length > 0, "PID required");
        require(bytes(records[pid].pid).length == 0, "PID already exists");

        records[pid] = ProductRecord({
            pid: pid,
            title: title,
            farmerEmail: farmerEmail,
            timestamp: block.timestamp,
            metadataURI: metadataURI,
            location: "" // default empty
        });

        allProductIds.push(pid);

        emit ProductRegistered(pid, title, farmerEmail, block.timestamp, metadataURI);
    }

    /// @notice Get a product by its ID
    function getProduct(string calldata pid) external view returns (ProductRecord memory) {
        require(bytes(records[pid].pid).length > 0, "Product not found");
        return records[pid];
    }

    /// @notice Get all registered products
    function getAllProducts() external view returns (ProductRecord[] memory) {
        ProductRecord[] memory all = new ProductRecord[](allProductIds.length);
        for (uint256 i = 0; i < allProductIds.length; i++) {
            all[i] = records[allProductIds[i]];
        }
        return all;
    }

    /// @notice Update product location (traceability)
    function updateProductLocation(
        string calldata pid,
        string calldata newLocation
    ) external {
        require(bytes(records[pid].pid).length > 0, "Product not found");
        require(msg.sender == owner, "Only owner can update");

        records[pid].location = newLocation;

        emit ProductLocationUpdated(pid, newLocation, block.timestamp);
    }
}
