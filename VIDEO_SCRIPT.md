# Video Demonstration Script: Private Cargo Tracking

## Project Overview

**Title**: Private Cargo Tracking - FHEVM Implementation
**Duration**: 1 minute (60 seconds)
**Format**: Screen recording with voice-over
**Target Audience**: Developers, evaluators, blockchain community

---

## Scene Breakdown

### SCENE 1: Title & Overview (0:00 - 0:08)

**Visual**: Title slide with animated logos
- "Private Cargo Tracking"
- "Privacy-Preserving Supply Chain Management"
- FHEVM badge, Ethereum badge, Smart Contract badge

**Visual Elements**:
- Fade in title
- Display badges (FHEVM Powered, Ethereum, Security Audited)
- Show project metrics on screen

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 2: Problem Statement (0:08 - 0:15)

**Visual**: Comparison animation
- Left side: "Traditional Logistics" with decrypt → process → encrypt flow (showing vulnerability)
- Right side: "FHEVM Approach" with encrypt → process → encrypt flow (showing security)
- Red X on traditional, green checkmark on FHEVM

**Animation**: Slide left traditional model left, FHEVM model right

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 3: Smart Contract Compilation (0:15 - 0:22)

**Visual**: Terminal/IDE screenshot
- Show: `npx hardhat compile`
- Display successful compilation output
- Show contract size: 367 lines
- Display: Contract verified badge

**Action Sequence**:
1. Show terminal command
2. Compilation progress
3. Success message: "Compiled successfully"
4. Display contract address: 0x1846d67...

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 4: Wallet Connection (0:22 - 0:28)

**Visual**: Browser screen showing application
- Show [https://privacy-cargo-tracking-fhe.vercel.app/](https://privacy-cargo-tracking-fhe.vercel.app/)
- MetaMask extension popup
- Wallet connection request
- Success: "Connected to Sepolia"

**Action Sequence**:
1. Application dashboard visible
2. Click "Connect Wallet"
3. MetaMask popup appears
4. Approve connection
5. Show connected status with address

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 5: Create Cargo (0:28 - 0:38)

**Visual**: Dashboard form
- Cargo creation form with fields:
  - Weight: 2500 kg
  - Category: Electronics
  - Value: $5000
  - Priority: 8/10
  - Receiver address filled

**Action Sequence**:
1. Show empty form
2. Fill in cargo details with animations
3. Click "Create Cargo"
4. MetaMask transaction window
5. Transaction hash appears
6. Success message: "Cargo #1 created"
7. Show cargo details in dashboard

**Visual Effects**:
- Input fields highlight as filled
- Green checkmarks appear
- Transaction confirmation badge

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 6: Update Location (0:38 - 0:46)

**Visual**: Cargo details screen
- Cargo information displayed (encrypted)
- Location update form
- Input fields:
  - Latitude: 40.7128
  - Longitude: -74.0060
  - Status: In Transit

**Action Sequence**:
1. Show cargo details
2. Click "Update Location"
3. Form appears
4. Fill coordinates
5. Select status dropdown
6. Click "Update"
7. MetaMask transaction
8. Success: Location updated
9. Show in location history

**Visual Elements**:
- Cargo ID prominent
- Shipper/Receiver addresses visible (hashed for privacy)
- Location count increments
- Timestamp recorded

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 7: Grant Permissions (0:46 - 0:54)

**Visual**: Authorization management screen
- "Manage Permissions" panel
- Authorization form visible:
  - Address: 0x...
  - View: ✓ enabled
  - Track: ✓ enabled
  - Update: ✗ disabled
  - Expiration: 7 days

**Action Sequence**:
1. Click "Grant Authorization"
2. Form opens
3. Enter third-party address
4. Toggle permissions (show selections)
5. Set expiration (7 days selected)
6. Click "Grant"
7. MetaMask approval
8. Success: "Authorization granted"
9. Show in authorizations list

**Visual Effects**:
- Toggle switches animated
- Date picker shows expiration
- Permission checkmarks light up
- Success notification appears

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 8: Verify Authorization (0:54 - 1:00)

**Visual**: Authorization status screen
- Display authorization details:
  - Authorized party address
  - Current permissions (View: ✓, Track: ✓, Update: ✗)
  - Expiration date
  - "Active" status badge (green)

**Action Sequence**:
1. Show authorization list
2. Click on specific authorization
3. Details panel opens
4. Display all permission levels
5. Show expiration countdown

**Visual Elements**:
- Permission matrix
- Status badges (Active/Expired/Pending)
- Color coding (green = active, red = expired)
- Countdown timer for expiration

**Audio**: [See SCRIPT_DIALOGUE.md]

---

### SCENE 9: Dashboard Overview & Closing (1:00)

**Visual**: Complete dashboard view
- Show:
  - Cargo count
  - Authorizations count
  - Recent activities
  - Quick stats
- Final title slide: "Private Cargo Tracking - Production Ready"

**Action Sequence**:
1. Pan across dashboard
2. Highlight key metrics
3. Show recent transaction history
4. Zoom out to see full interface
5. Fade to closing screen

**Final Slide Elements**:
- Project title
- Links:
  - Live Demo URL
  - Documentation URL
  - GitHub Repository
  - Etherscan Link
- Call to action: "Explore the documentation for more"

**Audio**: [See SCRIPT_DIALOGUE.md]

---

## Production Notes

### Technical Requirements
- **Screen Resolution**: 1080p (1920x1080) or higher
- **Frame Rate**: 60 fps
- **Codec**: H.264 or VP9
- **Audio**: 48kHz, stereo
- **Format**: MP4 or WebM

### Camera/Recording Settings
- Window size: Optimized for visibility (1280x720 or larger)
- Font size: Large enough for readable text (minimum 12pt)
- Cursor visibility: Enhanced (highlighted cursor preferred)

### Timing
- Total duration: Exactly 60 seconds
- Scene transitions: 0.3-0.5 seconds
- Form fills: Natural typing speed (0.5 seconds per field)
- Animations: Smooth 0.3-1 second transitions

### Audio
- Voice: Clear, professional narration
- Speed: Moderate pace (150 words per minute)
- Background: Minimal (optional subtle ambient sound)
- Music: Optional subtle background at low volume
- Sound effects: Transaction confirmation chimes (optional)

---

## Recommended Tools

**Screen Recording**:
- OBS Studio (Free, open-source)
- ScreenFlow (Mac)
- Camtasia (Professional)
- ShareX (Windows)

**Video Editing**:
- DaVinci Resolve (Free, professional)
- Adobe Premiere (Professional)
- Final Cut Pro (Mac, professional)
- OpenShot (Free, open-source)

**Audio**:
- Audacity (Free, for voice recording)
- Professional microphone recommended

---

## Preparation Checklist

Before recording:
- [ ] Clean desktop (no unnecessary windows)
- [ ] Application loaded and tested
- [ ] MetaMask connected to Sepolia
- [ ] Test ETH in wallet ready
- [ ] Receiver address prepared
- [ ] Third-party address prepared
- [ ] Terminal/IDE ready for commands
- [ ] Font sizes optimized
- [ ] Network connection stable
- [ ] Microphone tested
- [ ] Screen recording settings configured
- [ ] All demos tested end-to-end

---

## Demo Data Template

Use this test data for consistency:

**Cargo Details**:
- Weight: 2500 kg
- Category: 1 (Electronics)
- Value: 500000 (USD cents = $5,000)
- Priority: 8/10
- Receiver: [Prepared test address]

**Location Updates**:
- Latitude: 407128 (40.7128)
- Longitude: 740060 (-74.0060)
- Status: 1 (In Transit)

**Authorization**:
- Third party: [Prepared test address]
- View: Yes
- Track: Yes
- Update: No
- Duration: 7 days

---

## Expected Outcomes

After successfully recording all scenes, the video should demonstrate:

✅ Complete project setup and deployment verification
✅ Full user workflow (create → update → authorize → verify)
✅ FHEVM smart contract functionality
✅ MetaMask integration
✅ Real blockchain transactions
✅ Professional presentation quality
✅ Clear audio narration
✅ Production-ready appearance

---

**For dialogue and speaking points, see: SCRIPT_DIALOGUE.md**

---

*Script Version: 1.0*
*Last Updated: December 2025*
*Duration: 60 seconds*
*Status: Ready for recording*
