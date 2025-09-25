// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FarmerRegistry {
    struct Farmer {
        uint256 farmerId;
        string fullName;
        string nationalIdHash; // 🔒 store a hash of sensitive data, not raw ID
        string farmLocation;   // GPS coordinates or region
        address wallet;        // address of farmer (msg.sender who registered)
    }

    uint256 private nextFarmerId = 1;
    mapping(uint256 => Farmer) private farmers; // keep internal, expose via functions

    // ----------------- Events -----------------
    event FarmerRegistered(
        uint256 indexed farmerId,
        string fullName,
        string farmLocation,
        address indexed wallet
    );

    event FarmerLocationUpdated(
        uint256 indexed farmerId,
        string newLocation
    );

    // ----------------- Core Logic -----------------

    /// @notice Register a new farmer
    function registerFarmer(
        string memory _fullName,
        string memory _nationalIdHash,
        string memory _farmLocation
    ) external returns (uint256) {
        uint256 farmerId = nextFarmerId;

        farmers[farmerId] = Farmer({
            farmerId: farmerId,
            fullName: _fullName,
            nationalIdHash: _nationalIdHash,
            farmLocation: _farmLocation,
            wallet: msg.sender
        });

        emit FarmerRegistered(farmerId, _fullName, _farmLocation, msg.sender);

        nextFarmerId++;
        return farmerId;
    }

    /// @notice Get a single farmer by ID
    function getFarmer(uint256 _farmerId) external view returns (Farmer memory) {
        require(_farmerId > 0 && _farmerId < nextFarmerId, "Farmer does not exist");
        return farmers[_farmerId];
    }

    /// @notice Get all farmers (for frontend tables)
    function getAllFarmers() external view returns (Farmer[] memory) {
        Farmer[] memory all = new Farmer[](nextFarmerId - 1);
        for (uint256 i = 1; i < nextFarmerId; i++) {
            all[i - 1] = farmers[i];
        }
        return all;
    }

    /// @notice Update farm location of a farmer
    function updateFarmLocation(uint256 _farmerId, string memory _newLocation) external {
        require(_farmerId > 0 && _farmerId < nextFarmerId, "Farmer does not exist");
        Farmer storage f = farmers[_farmerId];
        require(f.wallet == msg.sender, "Not authorized"); // only the farmer can update

        f.farmLocation = _newLocation;
        emit FarmerLocationUpdated(_farmerId, _newLocation);
    }
}
