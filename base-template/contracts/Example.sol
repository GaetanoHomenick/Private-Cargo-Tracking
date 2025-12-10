// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Example Contract
 * @notice Replace this with your FHEVM example implementation
 * @dev Demonstrates basic FHEVM concepts with encrypted data
 * @chapter basic
 */
contract Example is SepoliaConfig {
    // State variables
    euint32 public encryptedValue;
    address public owner;

    // Events
    event ValueUpdated(address indexed updater, uint256 timestamp);

    /**
     * @notice Initialize the contract with an encrypted value
     * @param _initialValue The initial plaintext value to encrypt
     */
    constructor(uint32 _initialValue) {
        owner = msg.sender;
        encryptedValue = FHE.asEuint32(_initialValue);
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, owner);
    }

    /**
     * @notice Update the encrypted value
     * @param _newValue New plaintext value to encrypt and store
     * @dev Only the owner can update the value
     */
    function updateValue(uint32 _newValue) external {
        require(msg.sender == owner, "Only owner can update");

        encryptedValue = FHE.asEuint32(_newValue);
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, owner);

        emit ValueUpdated(msg.sender, block.timestamp);
    }

    /**
     * @notice Grant access to view the encrypted value
     * @param _user Address to grant access to
     * @dev Only the owner can grant access
     */
    function grantAccess(address _user) external {
        require(msg.sender == owner, "Only owner can grant access");
        FHE.allow(encryptedValue, _user);
    }

    /**
     * @notice Get the encrypted value (requires prior access grant)
     * @return The encrypted value
     */
    function getValue() external view returns (euint32) {
        return encryptedValue;
    }
}
