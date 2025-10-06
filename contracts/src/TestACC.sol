// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title TestACC - Arcanum Chain Code (Test)
 * Soul-bound token: one per address, non-transferable.
 * OZ v4.x note: Ownable has NO constructor args; do NOT call Ownable() in the constructor.
 */
contract TestACC is ERC721, Ownable {
    uint256 public nextId = 1;
    mapping(address => uint256) public accId; // address -> tokenId

    constructor() ERC721("Arcanum Chain Code (Test)", "tACC") {
        // owner is msg.sender by default (Ownable v4.x)
    }

    function hasACC(address user) public view returns (bool) {
        return accId[user] != 0;
    }

    function mint() external returns (uint256 id) {
        require(!hasACC(msg.sender), "ACC: already minted");
        id = nextId++;
        accId[msg.sender] = id;
        _mint(msg.sender, id);
    }

    function revoke(address user) external onlyOwner {
        uint256 id = accId[user];
        require(id != 0, "ACC: none");
        delete accId[user];
        _burn(id);
    }

    // --- Soul-bound: disallow transfers/approvals ---
    function approve(address, uint256) public pure override { revert("ACC: non-transferable"); }
    function setApprovalForAll(address, bool) public pure override { revert("ACC: non-transferable"); }
    function transferFrom(address, address, uint256) public pure override { revert("ACC: non-transferable"); }
    function safeTransferFrom(address, address, uint256) public pure override { revert("ACC: non-transferable"); }
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override { revert("ACC: non-transferable"); }
}
