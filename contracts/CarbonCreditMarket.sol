// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditMarket is Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    IERC721 public carbonCreditToken;
    mapping(uint256 => Listing) public listings;
    
    event CreditListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event CreditSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);

    constructor(address _carbonCreditToken) Ownable(msg.sender) {
        carbonCreditToken = IERC721(_carbonCreditToken);
    }

    function listCredit(uint256 tokenId, uint256 price) external {
        require(carbonCreditToken.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(carbonCreditToken.getApproved(tokenId) == address(this), "Market not approved");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true
        });
        
        emit CreditListed(tokenId, msg.sender, price);
    }

    function buyCredit(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.value == listing.price, "Incorrect price");
        
        address seller = listing.seller;
        delete listings[tokenId];
        
        carbonCreditToken.transferFrom(seller, msg.sender, tokenId);
        
        (bool sent, ) = payable(seller).call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        
        emit CreditSold(tokenId, seller, msg.sender, msg.value);
    }

    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        delete listings[tokenId];
        emit ListingCanceled(tokenId, msg.sender);
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        listings[tokenId].price = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }
}