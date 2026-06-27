# Solryn VTT - Virtual Tabletop

A web-based virtual tabletop specifically designed for the Solryn tabletop RPG system, featuring auto-hit combat, real-time multiplayer, and integrated rules reference.

## Features

### Phase 1 (Current MVP)
- ✅ Guest room system with shareable 6-character codes
- ✅ Real-time multiplayer with WebSocket support
- ✅ Interactive Solryn character sheets with live editing
- ✅ Integrated dice roller (public and DM-hidden rolls)
- ✅ Complete Solryn rules reference with search
- ✅ Character creation wizard
- ✅ Roll history tracking
- ✅ Game notes (local storage)
- ✅ Mobile-responsive design

### Planned Features (Future Phases)
- User accounts and authentication
- Permanent character storage
- Campaign management
- Custom monster creation
- Custom character sheet builder
- Community content sharing
- Battle maps and tokens
- Advanced automation

## Tech Stack

- **Backend:** Python with Flask
- **Real-time:** Flask-SocketIO (WebSockets)
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Storage:** In-memory (Phase 1), PostgreSQL (planned)

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
# Navigate to the project directory
cd solryn_vtt

# Install Python packages
pip install -r requirements.txt
```

### Step 2: Run the Application

```bash
# Start the Flask server
python app.py
```

The application will start on `http://localhost:5000`

### Step 3: Access the Application

1. Open your web browser
2. Navigate to `http://localhost:5000`
3. Create a new room or join an existing one

## Usage Guide

### Creating a Game Session

1. Click "Create New Game" on the home page
2. You'll be redirected to a room with a unique 6-character code
3. Share this code with your players

### Joining a Game

1. Enter the room code provided by your DM
2. Click "Join Game"
3. Enter your name and check "I'm the DM" if applicable
4. Click "Join Game" to enter the room

### Creating a Character

1. Join a room
2. Click "+ New Character" in the left sidebar
3. Fill out the character form:
   - Name, Race, Background
   - Seven attributes (STR, DEX, CON, INT, WIS, CHA, LCK)
   - Starting HP
4. Click "Create Character"

### Character Sheets

- Click on a character in the left sidebar to view/edit
- Update HP in real-time
- Add notes to track character state
- All players in the room see updates instantly

### Rolling Dice

1. Switch to the "Dice Roller" tab
2. Quick rolls: Click any die button (d4, d6, d8, d10, d12, d20, d100)
3. Custom rolls: Enter notation like "2d6+3" and click Roll
4. DM-only: Check "Hidden (DM only)" for private rolls
5. All rolls appear in the roll history with timestamp

### Rules Reference

1. Switch to the "Rules" tab
2. Browse by category: Attributes, Skills, Combat, Conditions, Monsters
3. Search for specific rules using the search bar
4. Players cannot see Monsters section (DM only)

### Game Notes

- Use the right sidebar to take notes during play
- Notes are saved locally per room
- Click "Save Notes" to persist changes

## Solryn Rules Summary

### Seven Core Attributes
- **Strength (STR)** - Physical power
- **Dexterity (DEX)** - Agility and reflexes
- **Constitution (CON)** - Health and stamina
- **Intelligence (INT)** - Reasoning and memory
- **Wisdom (WIS)** - Awareness and intuition
- **Charisma (CHA)** - Personality and leadership
- **Luck (LCK)** - Fortune and fate (unique to Solryn)

### Auto-Hit Combat System
- All attacks automatically hit
- Roll damage directly instead of attack rolls
- Defense handled through armor reduction
- Focus on tactical positioning and resource management

### Armor System
- Light armor: -2 damage reduction
- Medium armor: -4 damage reduction
- Heavy armor: -6 damage reduction

## File Structure

```
solryn_vtt/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── data/
│   ├── solryn_rules.json    # Game rules database (attributes, skills, conditions, combat)
│   ├── creatures.json       # Canonical bestiary — 335 creatures (served as the "Monsters" category)
│   ├── conversion_log.md    # Per-creature notes from the 5e SRD → Solryn conversion
│   ├── creatures_review.md  # Human-readable bestiary, grouped by Threat Tier
│   ├── creatures_review.pdf # PDF export of the bestiary review
│   └── dice_fix_review.md   # Review log for the dice-notation fix
├── static/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       ├── home.js       # Home page functionality
│       └── room.js       # Room page functionality
└── templates/
    ├── index.html        # Home page
    └── room.html         # Game room page
```

## Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Basic VTT functionality
- ✅ Real-time multiplayer
- ✅ Solryn rules integration

### Phase 2: Enhancement (Next)
- [ ] User authentication
- [ ] Database integration (PostgreSQL)
- [ ] Persistent character storage
- [ ] Campaign management
- [ ] Enhanced character sheets

### Phase 3: Customization
- [ ] Custom character sheet builder
- [ ] Custom monster creation
- [ ] Rule editor for DMs
- [ ] Export/import characters

### Phase 4: Advanced Features
- [ ] Battle maps with grid
- [ ] Token management
- [ ] Combat tracker
- [ ] Initiative automation
- [ ] Fog of war

### Phase 5: Community
- [ ] Share custom content
- [ ] Multiple game system support
- [ ] Public campaign listings
- [ ] Marketplace for assets

## Known Limitations (Phase 1)

- Data stored in memory (resets when server restarts)
- No user authentication
- No permanent character storage
- Single game system (Solryn only)
- No battle maps or visual aids
- Limited to text-based communication

## Troubleshooting

### Server won't start
- Check Python version: `python --version` (must be 3.8+)
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check if port 5000 is already in use

### Can't join room
- Verify room code is exactly 6 characters
- Ensure server is running
- Check browser console for errors (F12)

### Dice rolls not appearing
- Confirm you've joined the room (clicked "Join Game")
- Check browser console for WebSocket errors
- Try refreshing the page

### Character sheet not updating
- Ensure you have a stable internet connection
- Check if other players see the updates
- Try selecting the character again

## Contributing

This is currently a personal project for Solryn RPG. Future phases may open for contributions.

## License

Copyright 2024 - Matthew (Lazer Work Studios)

## Contact

For questions or feedback about Solryn VTT, please reach out through appropriate channels.

---

**Version:** 0.1.0 (MVP)  
**Last Updated:** December 2024
