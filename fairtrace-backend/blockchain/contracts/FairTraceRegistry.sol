// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FarmerRegistry {
    struct Farmer {
        uint256 farmerId;
        string fullName;
        string nationalIdHash; // 🔒 store a hash of sensitive data, not raw ID
        string farmLocation;   // maybe GPS string, or just "lat,long"
        address wallet;        // who registered
    }

    uint256 private nextFarmerId = 1;
    mapping(uint256 => Farmer) public farmers;

    event FarmerRegistered(
        uint256 indexed farmerId,
        string fullName,
        string farmLocation,
        address indexed wallet
    );

    function registerFarmer(
        string memory _fullName,
        string memory _nationalIdHash,
        string memory _farmLocation
    ) public returns (uint256) {
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

    function getFarmer(uint256 _farmerId) public view returns (Farmer memory) {
        return farmers[_farmerId];
    }
}
