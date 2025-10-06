// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TestACC.sol";

contract DeployTestACC is Script {
    function run() external returns (TestACC acc) {
        bytes32 pkBytes = vm.envBytes32("PRIVATE_KEY");
        address deployer = vm.addr(uint256(pkBytes));

        vm.startBroadcast(uint256(pkBytes));
        acc = new TestACC(deployer);
        vm.stopBroadcast();

        console2.log("TestACC deployed at:", address(acc));
        console2.log("Owner:", deployer);
    }
}
