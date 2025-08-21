// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract VehiclePassportiNFT is ERC721Enumerable, AccessControl {
    // --- Roles ---
    bytes32 public constant DEALER_ROLE = keccak256("DEALER_ROLE");
    bytes32 public constant SERVICE_CENTER_ROLE = keccak256("SERVICE_CENTER_ROLE");

    // --- Business Rules ---
    uint256 public constant SERVICE_INTERVAL_MILEAGE = 10_000;
    uint256 public constant SERVICE_INTERVAL_TIME = 365 days;

    // --- State ---
    uint256 private _tokenCounter;
    mapping(uint256 => uint256) public listingPrice; // wei; 0 = not listed

    struct ServiceRecord {
        string details;
        uint256 timestamp;
        string dataHash; // off-chain pointer (IPFS/Arweave/etc)
    }

    struct VehicleData {
        string vin;
        string make;
        string model;
        uint256 year;
        uint256 purchasePrice;
        uint256 purchaseDate;
        uint256 currentMileage;
        uint256 lastServiceMileage;
        uint256 lastServiceDate;
        string imageURI; // image/ipfs url provided by dealer at mint
    }

    mapping(uint256 => VehicleData) private _vehicleData;
    mapping(uint256 => ServiceRecord[]) public serviceHistory;

    // --- Events ---
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string vin);
    event ServiceRecordAdded(uint256 indexed tokenId, uint256 newMileage, string serviceDetails, string dataHash);
    event Listed(uint256 indexed tokenId, uint256 price);
    event Delisted(uint256 indexed tokenId);
    event Purchased(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event ImageUpdated(uint256 indexed tokenId, string newImageURI);

    // --- Constructor ---
    constructor() ERC721("Vehicle Passport iNFT", "VPASS") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DEALER_ROLE, msg.sender);
        _grantRole(SERVICE_CENTER_ROLE, msg.sender);
    }

    // --- Minting ---
    function mintVehicle(
        address _owner,
        string memory _vin,
        string memory _make,
        string memory _model,
        uint256 _year,
        uint256 _purchasePrice,
        uint256 _initialMileage,
        string memory _imageURI
    ) public onlyRole(DEALER_ROLE) returns (uint256) {
        uint256 newTokenId = _tokenCounter;
        _safeMint(_owner, newTokenId);

        _vehicleData[newTokenId] = VehicleData({
            vin: _vin,
            make: _make,
            model: _model,
            year: _year,
            purchasePrice: _purchasePrice,
            purchaseDate: block.timestamp,
            currentMileage: _initialMileage,
            lastServiceMileage: _initialMileage,
            lastServiceDate: block.timestamp,
            imageURI: _imageURI
        });

        _tokenCounter++;
        emit NFTMinted(newTokenId, _owner, _vin);
        return newTokenId;
    }

    // --- Service / Maintenance ---
    function addServiceRecord(
        uint256 _tokenId,
        uint256 _newMileage,
        string memory _serviceDetails,
        string memory _dataHash
    ) public onlyRole(SERVICE_CENTER_ROLE) {
        ownerOf(_tokenId);

        require(bytes(_serviceDetails).length > 0, "VehiclePassportiNFT: details required");
        require(_newMileage >= _vehicleData[_tokenId].currentMileage, "VehiclePassportiNFT: mileage cannot decrease");

        _vehicleData[_tokenId].currentMileage = _newMileage;
        _vehicleData[_tokenId].lastServiceMileage = _newMileage;
        _vehicleData[_tokenId].lastServiceDate = block.timestamp;

        serviceHistory[_tokenId].push(ServiceRecord({
            details: _serviceDetails,
            timestamp: block.timestamp,
            dataHash: _dataHash
        }));

        emit ServiceRecordAdded(_tokenId, _newMileage, _serviceDetails, _dataHash);
    }

    function getMaintenanceStatus(uint256 _tokenId) public view returns (string memory) {
        ownerOf(_tokenId);
        VehicleData memory v = _vehicleData[_tokenId];

        bool mileageDue = v.currentMileage >= v.lastServiceMileage + SERVICE_INTERVAL_MILEAGE;
        bool timeDue = block.timestamp >= v.lastServiceDate + SERVICE_INTERVAL_TIME;

        return (mileageDue || timeDue) ? "Service Due" : "OK";
    }

    function calculateTrustScore(uint256 _tokenId) public view returns (uint8) {
        ownerOf(_tokenId);

        VehicleData memory v = _vehicleData[_tokenId];
        uint256 historyLen = serviceHistory[_tokenId].length;

        uint8 score = 100;

        if (block.timestamp > v.lastServiceDate + (SERVICE_INTERVAL_TIME * 2)) {
            score -= 25;
        }
        if (v.currentMileage > v.lastServiceMileage + (SERVICE_INTERVAL_MILEAGE * 2)) {
            score -= 20;
        }
        if (historyLen > 5) {
            unchecked { score += 10; }
        }
        if (score > 100) score = 100;
        return score;
    }

    // --- Read helpers ---
    function getVehicleDetails(uint256 _tokenId) external view returns (VehicleData memory) {
        ownerOf(_tokenId);
        return _vehicleData[_tokenId];
    }

    function getServiceHistoryCount(uint256 _tokenId) external view returns (uint256) {
        ownerOf(_tokenId);
        return serviceHistory[_tokenId].length;
    }

    function getServiceRecord(uint256 _tokenId, uint256 index) external view returns (ServiceRecord memory) {
        ownerOf(_tokenId);
        require(index < serviceHistory[_tokenId].length, "VehiclePassportiNFT: index out of bounds");
        return serviceHistory[_tokenId][index];
    }

    // --- Minimal marketplace ---
    function listNFT(uint256 _tokenId, uint256 _price) external {
        require(ownerOf(_tokenId) == msg.sender, "VehiclePassportiNFT: not owner");
        require(_price > 0, "VehiclePassportiNFT: price must be > 0");
        listingPrice[_tokenId] = _price;
        emit Listed(_tokenId, _price);
    }

    function delistNFT(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "VehiclePassportiNFT: not owner");
        require(listingPrice[_tokenId] > 0, "VehiclePassportiNFT: not listed");
        listingPrice[_tokenId] = 0;
        emit Delisted(_tokenId);
    }

    function buyNFT(uint256 _tokenId) external payable {
        uint256 price = listingPrice[_tokenId];
        address seller = ownerOf(_tokenId);

        require(price > 0, "VehiclePassportiNFT: not for sale");
        require(msg.value >= price, "VehiclePassportiNFT: insufficient payment");
        require(seller != msg.sender, "VehiclePassportiNFT: cannot buy your own NFT");

        listingPrice[_tokenId] = 0;

        (bool sent, ) = payable(seller).call{value: price}("");
        require(sent, "VehiclePassportiNFT: payment failed");

        _safeTransfer(seller, msg.sender, _tokenId, "");

        if (msg.value > price) {
            (bool refundOk, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundOk, "VehiclePassportiNFT: refund failed");
        }

        emit Purchased(_tokenId, seller, msg.sender, price);
    }

    // --- Metadata ---
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "VehiclePassportiNFT: token does not exist");
        VehicleData memory v = _vehicleData[tokenId];

        bytes memory json = abi.encodePacked(
            '{',
                '"name":"Vehicle Passport #', Strings.toString(tokenId), '",',
                '"description":"Dynamic NFT passport for vehicles.",',
                '"image":"', v.imageURI, '",',
            '}'
        );

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }

    // --- Admin helpers ---
    function grantDealer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DEALER_ROLE, account);
    }

    function grantServiceCenter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SERVICE_CENTER_ROLE, account);
    }

    // --- Interface support ---
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
