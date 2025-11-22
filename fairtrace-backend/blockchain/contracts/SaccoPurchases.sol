// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SaccoPurchases {
    address public owner;
    uint256 public listingCount;
    uint256 public purchaseCount;

    struct Listing {
        uint256 id;
        address sacco;
        string title;
        string description;
        uint256 quantity;
        string unit;
        uint256 pricePerUnit; // in wei or smallest unit used
        bool open;
        uint256 timestamp;
    }

    struct Purchase {
        uint256 id;
        uint256 listingId;
        address sacco;
        address farmer;
        uint256 quantity;
        uint256 totalPrice;
        uint256 timestamp;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Purchase) public purchases;

    event ListingCreated(uint256 indexed id, address indexed sacco, string title, uint256 quantity, uint256 pricePerUnit);
    event ListingClosed(uint256 indexed id);
    event PurchaseRecorded(uint256 indexed id, uint256 indexed listingId, address indexed sacco, address farmer, uint256 quantity, uint256 totalPrice);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        listingCount = 0;
        purchaseCount = 0;
    }

    function createListing(
        string calldata _title,
        string calldata _description,
        uint256 _pricePerUnit,
        uint256 _quantity,
        string calldata _unit
    ) external returns (uint256) {
        uint256 id = listingCount++;
        listings[id] = Listing({
            id: id,
            sacco: msg.sender,
            title: _title,
            description: _description,
            quantity: _quantity,
            unit: _unit,
            pricePerUnit: _pricePerUnit,
            open: true,
            timestamp: block.timestamp
        });
        emit ListingCreated(id, msg.sender, _title, _quantity, _pricePerUnit);
        return id;
    }

    function closeListing(uint256 _id) external {
        Listing storage l = listings[_id];
        require(l.sacco == msg.sender, "not owner of listing");
        l.open = false;
        emit ListingClosed(_id);
    }

    function recordPurchase(
        address _farmer,
        uint256 _listingId,
        uint256 _quantity,
        uint256 _totalPrice
    ) external returns (uint256) {
        Listing storage l = listings[_listingId];
        require(l.open, "listing not open");
        // Optionally check quantity <= l.quantity
        uint256 id = purchaseCount++;
        purchases[id] = Purchase({
            id: id,
            listingId: _listingId,
            sacco: msg.sender,
            farmer: _farmer,
            quantity: _quantity,
            totalPrice: _totalPrice,
            timestamp: block.timestamp
        });
        // Optionally decrement l.quantity
        emit PurchaseRecorded(id, _listingId, msg.sender, _farmer, _quantity, _totalPrice);
        return id;
    }

    // View helpers
    function getListing(uint256 _id) external view returns (Listing memory) {
        return listings[_id];
    }

    function getListingCount() external view returns (uint256) {
        return listingCount;
    }
}
