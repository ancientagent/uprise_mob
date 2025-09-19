# Home Scene Registry - Design Specification

## Screen Overview
**Purpose:** Streamlined onboarding where users establish their home uprise through ZIP code and genre selection.

## Visual Layout

### Screen Header
**Title:** "Join Your Home Scene"

### Main Form Area

#### Section 1: ZIP Code Input
```
┌─────────────────────────────────┐
│  Zipcode of Residence           │
│  ┌────────────────────┐         │
│  │ [_____]            │         │
│  └────────────────────┘         │
│                                  │
│  □ Verify with GPS              │
│  (to enable voting)             │
└─────────────────────────────────┘
```
- Numeric keyboard activation
- 5-digit validation
- GPS verification checkbox
- Simple voting enablement note

#### Section 2: Genre Selection
```
┌─────────────────────────────────┐
│  Primary genre of interest      │
│  or affiliation                 │
│  ┌────────────────────┐         │
│  │ [Type to search...]│         │
│  └────────────────────┘         │
│  (you can add more later)       │
│                                  │
│  ┌────────────────────┐         │
│  │ Hip Hop            │ ← Dropdown appears
│  │ Hardcore Punk     │    on first letter
│  │ House             │         │
│  └────────────────────┘         │
└─────────────────────────────────┘
```
- Autocomplete activates on first letter typed
- Scrollable dropdown with all matching genres
- Direct validation if complete genre name typed
- Helper text about adding more genres later

### Bottom Display Area

#### Home Scene Preview Box
```
┌─────────────────────────────────┐
│     Your Home Scene:            │
│                                  │
│  [City, State] [Genre]          │
│                                  │
│  [    Confirm & Join    ]       │
└─────────────────────────────────┘
```

**Progressive Display States:**

1. **Initial state (empty fields):**
   - Shows: "Your Home Scene:" with blank space below

2. **After ZIP entry (genre still empty):**
   - Shows: "Your Home Scene:"
   - "Buda, TX _____"
   - City/state portion fills in, genre space remains blank

3. **After both ZIP and genre complete:**
   - Shows: "Your Home Scene:"
   - "Buda, TX Thrash Punk"
   - Full scene name complete, Confirm button enables

## User Flow Scenarios

### Scenario A: Active Uprise
1. User enters ZIP → City/state appears in display box
2. User types genre → Autocomplete helps selection
3. Home Scene name displays in preview box
4. User taps "Confirm & Join"
5. → Navigates directly to community feed

### Scenario B: Inactive Uprise (<15 songs)
1. User completes form and confirms
2. Modal appears:

```
┌─────────────────────────────────┐
│  🚀 Oh, You're THAT Early?     │
│                                  │
│  Not only did you find us...    │
│  you're literally leading the   │
│  Buda TX Thrash Punk revolution!│
│                                  │
│  Your scene needs 7 more songs  │
│  to go live. Time to recruit    │
│  your fellow rebels:            │
│                                  │
│  [Share] [SMS] [Facebook]       │
│                                  │
│  [Random Quote Generator Below] │
│  "Every empire falls. We're     │
│   just the soundtrack."         │
│                                  │
│  🎯 Pioneer Bonus: +50 AP       │
│                                  │
│  ─────── OR ───────             │
│                                  │
│  [Change Genre] [Find Nearest]  │
└─────────────────────────────────┘
```

**Dynamic Quote Generator Examples:**
- Snarky: "First one here gets to pick the playlist forever."
- Inspirational: "The revolution will not be televised, but it will be locally sourced." 
- Historical: "Be the change you wish to see in the world." - Gandhi
- Playful: "You vs. the corporate music machine. My money's on you."
- Revolutionary: "They control the airwaves. We're building our own."
- Community: "It takes a village to raise a scene."

**Activity Points (AP) System:**
- Pioneer Bonus: +50 AP for being first 10 members
- Recruiter Bonus: +10 AP per successful invite
- Scene Activator: +100 AP if your invites trigger launch
- Early Adopter Badge: Permanent profile distinction

**Options:**
- **Share buttons**: Invite contacts with attached quote
- **Change Genre**: Refreshes genre field with only active genres in Buda
- **Find Nearest**: Shows nearest city with active Thrash Punk scene

### Scenario C: User Changes to Active Genre
- Genre field clears and updates to show only active local genres
- User selects from filtered list
- Preview updates to new Home Scene
- Confirms to join active community

### Scenario D: User Chooses Nearest Active
- System calculates nearest city with user's original genre active
- Shows: "Join Austin, TX Thrash Punk Uprise (12 miles away)?"
- User confirms to join nearest active scene

## Technical Implementation

### Backend Logic

**On ZIP entry:**
```javascript
// Validate ZIP and get location data
const location = await getLocationFromZip(zipCode);
// Returns: { city: "Buda", state: "TX", county: "Hays" }

// Update bottom preview box with city/state
updateHomeScenePreview(location.city, location.state, null);
// Shows: "Buda, TX" in preview box
```

**On genre selection:**
```javascript
// Check if uprise meets threshold
const upriseStatus = await checkUpriseStatus(city, state, genre);
// Returns: { active: boolean, songCount: number, needed: number }

// Update preview box
updateHomeScenePreview(city, state, genre);
```

**GPS Verification:**
- Store coordinates if checkbox selected
- Flag account as voting-enabled
- Can be done later through settings if skipped

### Data Flow
1. ZIP validation → Database lookup → City/State display
2. Genre selection → Autocomplete filter → Validation
3. Both complete → Preview generation → Enable confirm button
4. Confirm → Check uprise status → Route to appropriate flow

## Edge Cases

### Invalid ZIP
- Field highlights red
- Error message: "Please enter valid 5-digit ZIP"
- City/state display remains empty

### No Active Genres in City
- Message: "No active scenes in Buda yet. Try nearby Austin?"
- Suggest nearest cities with any active scenes
- Option to be pioneer for new scene

### Rural ZIP Codes
- Group into regional scenes
- Example: "Central Texas Country Uprise"
- Display region name instead of specific town

### Genre Not Found
- If user types genre not in database
- Message: "Genre not found. Try a similar genre or contact support"
- Suggest closest matching genres

## UI/UX Requirements

### Input Field Behavior
- ZIP field: Numeric only, auto-advance after 5 digits
- Genre field: Case-insensitive search, minimum 1 character for dropdown
- Both fields: Clear button (X) when populated

### Visual Feedback
- Loading spinner while validating ZIP
- Checkmark appears when valid ZIP entered
- Genre dropdown highlights matching text
- Smooth transitions for all state changes

### Accessibility
- Large touch targets (minimum 48dp)
- High contrast text (WCAG AA compliant)
- Screen reader labels for all inputs
- Keyboard navigation support
- Clear error messaging with haptic feedback

### Responsive Design
- Mobile-first approach
- Scales appropriately for tablets
- Landscape orientation support
- Minimum viewport: 320px width

## Administrative Features (Super Admin)

### Activity Points Management
- Configure pioneer bonuses (default: 50 AP)
- Set recruiter rewards (default: 10 AP per successful invite)
- Adjust scene activation bonuses
- Create special event multipliers
- View AP analytics by scene
- Manual AP adjustments for special circumstances

### Quote Database Management
- Add/edit/remove quotes from rotation
- Categorize quotes (snarky, inspirational, historical, etc.)
- Set quote weighting/frequency
- Track quote performance (share rates)
- Upload bulk quotes via CSV
- Flag inappropriate quotes

### Scene Activation Controls
- Adjust song threshold requirements by region
- Override automatic activation
- Set custom messages for specific scenes
- Monitor pioneer conversion rates
- Track invitation success metrics