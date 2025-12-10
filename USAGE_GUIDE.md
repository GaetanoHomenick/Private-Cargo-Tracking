# Usage Guide: Private Cargo Tracking

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Roles](#user-roles)
3. [Creating Shipments](#creating-shipments)
4. [Tracking Cargo](#tracking-cargo)
5. [Managing Permissions](#managing-permissions)
6. [Common Workflows](#common-workflows)
7. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- **MetaMask Browser Extension**: Install from [metamask.io](https://metamask.io/)
- **Sepolia Test ETH**: Request from [sepoliafaucet.com](https://sepoliafaucet.com/)
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **Internet Connection**: For blockchain transactions

### Initial Setup

#### 1. Install MetaMask
```
Visit: https://metamask.io/
Download and install the extension
Create or import wallet
```

#### 2. Add Sepolia Network
```
Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Currency: ETH
Block Explorer: https://sepolia.etherscan.io
```

#### 3. Request Test ETH
```
Visit: https://sepoliafaucet.com
Enter your wallet address
Claim ~0.5 ETH
Wait for confirmation (usually instant)
```

#### 4. Connect to Application
```
Open: https://privacy-cargo-tracking-fhe.vercel.app/
Click "Connect Wallet"
Approve MetaMask request
Dashboard appears with your address
```

## User Roles

### Role 1: Shipper
**Responsibilities**:
- Create cargo shipments
- Assign receivers
- Grant tracking permissions
- Monitor delivery progress
- Revoke access if needed

**Permissions**:
- Always: View own cargo details
- Always: Track location history
- Always: Update status and location
- Delegated: Grant 3rd party access

**Use Case**: Company shipping products to customers

### Role 2: Receiver
**Responsibilities**:
- Accept incoming shipments
- Confirm receipt
- Provide delivery feedback
- Grant logistics provider access
- Request tracking updates

**Permissions**:
- Always: View own cargo details
- Always: Track location history
- Delegated: Shipper-granted permissions

**Use Case**: Company receiving supplies

### Role 3: Logistics Provider
**Responsibilities**:
- Update location during transit
- Change status as cargo moves
- Provide delivery confirmations
- Handle route optimization

**Permissions**:
- Time-limited: View cargo details
- Time-limited: Update locations
- Time-limited: Report status
- Cannot: Grant permissions to others

**Use Case**: Delivery company handling shipments

### Role 4: Compliance Officer
**Responsibilities**:
- Audit shipment records
- Verify regulatory compliance
- Approve exceptional handling
- Report on operations

**Permissions**:
- Shipper/Receiver-granted: View only
- Cannot: Modify any data
- Can: Generate audit reports

**Use Case**: Regulatory or internal compliance

## Creating Shipments

### Single Cargo Creation

#### Step 1: Access Dashboard
```
1. Open application
2. Click "Create New Cargo"
3. You become the shipper
```

#### Step 2: Enter Cargo Details
```
Field               | Example        | Purpose
--------------------|----------------|-------------------
Weight (kg)         | 2500           | Package size/category
Category            | 1 (Electronics) | Type of goods
Value (USD cents)   | 50000          | $500.00 worth
Priority            | 7              | Urgency (0-10)
Receiver Address    | 0x...          | Destination party
```

#### Step 3: Confirm Transaction
```
1. Review entered details
2. Click "Create Cargo"
3. MetaMask opens
4. Verify transaction details
5. Approve and sign
6. Wait for confirmation
```

#### Step 4: Receive Confirmation
```
✓ Cargo created successfully
✓ Cargo ID: #1234
✓ Status: Pending Shipment
✓ Created at: 2025-12-10 14:30 UTC
```

### Batch Cargo Creation

#### For Multiple Shipments
```
1. Click "Batch Create"
2. Enter CSV format:
   Weight, Category, Value, Priority, ReceiverAddress
   2500, 1, 50000, 7, 0x...
   1500, 2, 25000, 5, 0x...
   ...
3. Maximum: 50 items per batch
4. Review and submit
5. Single transaction processes all
```

#### Benefits
- Reduce transaction count
- Save on gas fees
- Faster processing
- Bulk shipper operations

## Tracking Cargo

### View Shipment Details

#### From Dashboard
```
1. Your Shipments → Outgoing (Shipper)
2. Your Shipments → Incoming (Receiver)
3. Select cargo from list
4. Details panel shows:
   - Shipper address
   - Receiver address
   - Creation date
   - Current status
   - Location history count
```

#### Authorized Parties
```
As authorized user:
1. Notifications → Shared With Me
2. Click cargo shared with you
3. View only authorized data:
   - View permission: See cargo specs
   - Track permission: See locations
   - Update permission: Add locations
```

### Track Location History

#### View All Updates
```
1. Select cargo
2. Click "Location History"
3. See all updates:
   Date/Time | Updater | Status | Coordinates
   ----------|---------|--------|-------------
   14:30 UTC | Shipper | Pending | Origin
   15:45 UTC | Provider| Transit | Checkpoint 1
   17:20 UTC | Provider| Transit | Checkpoint 2
```

#### Real-Time Status Updates
```
System monitors:
- Location changes
- Status updates
- Authorization changes
- New tracking events

You receive:
- Email notifications
- Dashboard alerts
- Event logs
- Timestamp records
```

### Query Specific Information

#### Get Cargo Info
```
Returns:
- Shipper address
- Receiver address
- Creation timestamp
- Number of location updates
```

#### Check Latest Location
```
Returns:
- Most recent timestamp
- Updater address
- (Coordinates encrypted, visible only if authorized)
```

#### Verify Authorization Status
```
Check for specific user:
- Can View? Yes/No
- Can Track? Yes/No
- Can Update? Yes/No
- Expires: Date/Time
- Is Expired? Yes/No
```

## Managing Permissions

### Grant Access to Third Party

#### Step 1: Identify Authorization Need
```
Who needs access?
- Logistics provider: View + Track + Update
- Insurance company: View + Track only
- Compliance officer: View only
- Warehouse: Update only
```

#### Step 2: Set Permissions
```
Cargo ID: #1234
Target Address: 0x...
Permissions:
  □ View cargo specifications
  □ Track location history
  □ Update status/location
Expiration: 7 days from now
```

#### Step 3: Grant Authorization
```
1. Click "Grant Authorization"
2. Confirm permissions
3. MetaMask opens
4. Approve transaction
5. Third party receives access
6. Event emitted: AuthorizationGranted
```

#### Step 4: Verify Authorization
```
System confirms:
✓ Permission granted
✓ Effective until: 2025-12-17 14:30 UTC
✓ Can notify authorized party
```

### Revoke Access

#### Immediate Revocation
```
1. Select cargo
2. Click "Manage Permissions"
3. Find authorized user
4. Click "Revoke"
5. Confirm revocation
6. MetaMask: Approve
7. Access immediately removed
```

#### Timeline-Based Expiration
```
Automatic expiration:
- No action needed
- Permission expires at scheduled time
- System removes access automatically
- User receives notification
```

### Common Authorization Scenarios

#### Scenario 1: Logistics Provider During Transit
```
Grant:
- View: Yes (see cargo value for insurance)
- Track: Yes (update location)
- Update: Yes (change status)
- Duration: 7 days (or until delivery)
```

#### Scenario 2: Insurance Company for Claim
```
Grant:
- View: Yes (assess value)
- Track: Yes (verify route)
- Update: No (cannot modify)
- Duration: 30 days (claim period)
```

#### Scenario 3: Customs Compliance
```
Grant:
- View: Yes (verify contents)
- Track: Yes (check crossing times)
- Update: No (read-only audit)
- Duration: 2 hours (inspection window)
```

#### Scenario 4: End Receiver Tracking
```
Grant:
- View: Limited (basic info only)
- Track: Yes (see location)
- Update: No (read-only)
- Duration: Until delivery + 30 days
```

## Common Workflows

### Workflow 1: Simple Domestic Shipment

**Timeline**: Create → Ship → Deliver → Complete

```
Step 1: Shipper Creates Cargo
├─ Enter weight, category, value
├─ Specify receiver address
├─ Review authorization (shipper has full access)
└─ Submit transaction

Step 2: Receiver Confirms Receipt
├─ Notifications alert receiver
├─ Receiver sees incoming shipment
├─ Can track in real-time
└─ Updates status to "Received"

Step 3: Payment & Closure
├─ Both parties confirm delivery
├─ Payment processing (off-chain)
├─ Audit record immutable
└─ Shipment complete
```

### Workflow 2: Third-Party Logistics

**Timeline**: Create → Grant Access → Track → Update → Revoke

```
Step 1: Shipper Creates with Logistics Provider Access
├─ Create cargo
├─ Grant provider: View + Track + Update
├─ Set 10-day expiration
└─ Provider receives notification

Step 2: Logistics Provider Updates en Route
├─ Receives package at warehouse
├─ Updates status to "In Transit"
├─ Records location coordinates
└─ Both parties see updates

Step 3: Delivery and Access Revocation
├─ Package delivered
├─ Provider updates final status
├─ Shipper revokes provider access
└─ Provider loses permission
```

### Workflow 3: Multi-Party Compliance Audit

**Timeline**: Create → Audit → Verify → Report

```
Step 1: Initial Shipment
├─ Shipper creates cargo
├─ Receiver accepts
└─ Standard logistics flow

Step 2: Compliance Request
├─ Compliance officer requests access
├─ Shipper grants: View only
├─ 24-hour limited access
└─ Officer can audit without modifying

Step 3: Audit Verification
├─ Officer views specifications
├─ Traces location history
├─ Verifies regulatory compliance
└─ Generates immutable report

Step 4: Access Expiration
├─ 24-hour window closes
├─ Access automatically revoked
├─ Audit record preserved on blockchain
└─ Both parties have proof
```

### Workflow 4: Batch Shipments with Template

**Timeline**: Batch Create → Distribute → Track → Complete

```
Step 1: Bulk Shipment Creation
├─ Prepare CSV with 50 items
├─ All to same/different receivers
├─ Single batch transaction
└─ Generate 50 cargo IDs at once

Step 2: Assign Logistics
├─ Grant provider access to all 50
├─ Single authorization per provider
├─ Cover all cargo in batch
└─ Reduces permission overhead

Step 3: Tracking Updates
├─ Provider updates locations by batch
├─ System triggers events
├─ All shippers/receivers notified
└─ Real-time synchronization

Step 4: Delivery Confirmation
├─ Each cargo tracked individually
├─ Status updates as delivered
├─ Revoke access per cargo
└─ Batch completion report
```

## Best Practices

### Security Best Practices

#### 1. Permission Minimization
```
✓ Grant only necessary permissions
✓ Use time limits (not infinite)
✓ Revoke immediately when not needed
✗ Don't grant "Update" if not required
✗ Don't use unlimited expiration
```

#### 2. Regular Audits
```
✓ Review active permissions monthly
✓ Check expired authorizations
✓ Remove dormant accesses
✓ Audit location update sources
```

#### 3. Address Verification
```
✓ Double-check receiver address
✓ Verify third-party addresses
✓ Use address books
✗ Don't copy-paste untrusted addresses
```

#### 4. Expiration Strategy
```
✓ Set 7-day limit for logistics
✓ 24-hour for inspection/audit
✓ 30-day for disputes/claims
✓ Immediate revoke if compromised
```

### Operational Best Practices

#### 1. Documentation
```
✓ Record shipment reasons
✓ Document authorization grants
✓ Keep audit trail of access
✓ Save transaction hashes
```

#### 2. Testing
```
✓ Test with small shipments first
✓ Verify permissions work as expected
✓ Confirm location updates
✓ Check notification delivery
```

#### 3. Error Handling
```
If transaction fails:
1. Check account balance
2. Verify address correctness
3. Check network status
4. Retry with adjusted gas

If permissions denied:
1. Verify authorization exists
2. Check expiration time
3. Confirm not revoked
4. Contact shipper for re-grant
```

#### 4. Scalability
```
For large operations:
✓ Use batch operations
✓ Schedule updates off-peak
✓ Monitor gas prices
✓ Plan permission strategy
```

### Data Privacy Best Practices

#### 1. Confidential Information
```
Protected by default:
✓ Cargo weight (encrypted)
✓ Cargo value (encrypted)
✓ Cargo category (encrypted)
✓ Location coordinates (encrypted)

Visible by default:
✗ Shipper address (public)
✗ Receiver address (public)
✗ Update timestamps (public)
```

#### 2. Selective Disclosure
```
Share minimum information:
✓ Weight: Only if necessary
✓ Value: Only for insurance
✓ Location: Only for logistics
✓ Category: Only if relevant
```

#### 3. Audit Trails
```
Maintain records of:
✓ Authorization grants
✓ Location updates
✓ Status changes
✓ Permission revocations
```

## Troubleshooting

### Common Issues

#### Transaction Fails
```
Check:
1. Account has sufficient ETH
2. Network is Sepolia
3. Address format correct
4. Gas limit adequate

Solution:
- Get more test ETH
- Switch to Sepolia
- Verify addresses
- Increase gas limit
```

#### Cannot View Cargo
```
Check:
1. You are authorized party
2. Authorization not expired
3. Cargo exists (correct ID)
4. You created/received it

Solution:
- Request permission grant
- Check expiration time
- Verify cargo ID
- Contact shipper
```

#### Permission Not Working
```
Check:
1. Authorization time limit valid
2. Correct permission granted
3. Not revoked
4. Correct action for permission

Solution:
- Verify expiration
- Check permission type
- Ask for new grant
- Contact shipper
```

## Support

- **Documentation**: See PROJECT_OVERVIEW.md
- **Technical Help**: See DEVELOPER_GUIDE.md
- **API Reference**: See API_REFERENCE.md
- **Community**: https://www.zama.ai/community
- **Issues**: GitHub Issues page

---

**Last Updated**: December 2025
**Version**: 1.0.0
