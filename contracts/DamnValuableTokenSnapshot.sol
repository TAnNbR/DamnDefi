// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";


contract DamnValuableTokenSnapshot is ERC20Snapshot {
    uint256 private _lastSnapshotId;

    constructor(uint256 initialSupply) ERC20("DamnValuableToken", "DVT") {
        _mint(msg.sender, initialSupply);
    }
    
    // 获取当前的快照 ID
    function snapshot() public returns (uint256 lastSnapshotId) {
        lastSnapshotId = _snapshot();
        _lastSnapshotId = lastSnapshotId;
    }
    
    // 获取当前的快照 ID 处指定账户的余额
    function getBalanceAtLastSnapshot(address account) external view returns (uint256) {
        return balanceOfAt(account, _lastSnapshotId);
    }
    
    // 获取当前的快照 ID 处指定总代币数量
    function getTotalSupplyAtLastSnapshot() external view returns (uint256) {
        return totalSupplyAt(_lastSnapshotId);
    }
}