// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Arcanum Chain Code (ACC)
/// @notice Soul-bound, non-transferable ID for humans
contract ChainCode is ERC721URIStorage, Ownable {
    uint256 public nextId = 1;
    mapping(address => bool) public hasACC;

    constructor() ERC721("ArcanumChainCode", "ACC") {}

    function mintACC(address user) external onlyOwner {
        require(!hasACC[user], "ACC already exists");
        uint256 tokenId = nextId++;
        _mint(user, tokenId);
        hasACC[user] = true;
    }

    /// Soul-bound: allow only mints/burns (no transfers)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "ACC is soul-bound");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
