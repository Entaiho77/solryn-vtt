// Room page functionality with Socket.IO
const roomCode = document.getElementById('roomCode').textContent;
let socket = null;
let currentUser = null;
let isDM = false;
let currentCharacter = null;
let characters = {};
let rules = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadRules();
});

// Setup all event listeners
function setupEventListeners() {
    // Join/Leave room
    document.getElementById('joinBtn').addEventListener('click', joinRoom);
    document.getElementById('leaveBtn').addEventListener('click', leaveRoom);
    
    // Copy room code
    document.getElementById('copyCodeBtn').addEventListener('click', copyRoomCode);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Character creation
    document.getElementById('createCharBtn').addEventListener('click', openCharacterModal);
    document.querySelector('.close').addEventListener('click', closeCharacterModal);
    document.getElementById('characterForm').addEventListener('submit', createCharacter);
    
    // Dice rolling
    document.querySelectorAll('.dice-btn').forEach(btn => {
        btn.addEventListener('click', () => rollDice(btn.dataset.dice));
    });
    document.getElementById('rollCustomBtn').addEventListener('click', rollCustomDice);
    document.getElementById('customDice').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') rollCustomDice();
    });
    
    // Rules browser
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => loadCategory(btn.dataset.category));
    });
    document.getElementById('searchBtn').addEventListener('click', searchRules);
    document.getElementById('rulesSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchRules();
    });
    
    // Notes
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
}

// WebSocket connection and events
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('player_joined', (data) => {
        addPlayerToList(data.username, data.is_dm);
        showNotification(`${data.username} joined the game`);
    });
    
    socket.on('player_left', (data) => {
        removePlayerFromList(data.username);
        showNotification(`${data.username} left the game`);
    });
    
    socket.on('room_state', (data) => {
        // Load existing characters and rolls
        if (data.characters) {
            data.characters.forEach(charId => loadCharacter(charId));
        }
        if (data.roll_history) {
            data.roll_history.forEach(roll => addRollToLog(roll));
        }
    });
    
    socket.on('character_created', (data) => {
        characters[data.character_id] = data.character;
        addCharacterToList(data.character_id, data.character);
    });
    
    socket.on('character_updated', (data) => {
        characters[data.character_id] = data.character;
        if (currentCharacter && currentCharacter.id === data.character_id) {
            displayCharacterSheet(data.character);
        }
    });
    
    socket.on('dice_rolled', (data) => {
        addRollToLog(data);
    });
    
    socket.on('error', (data) => {
        alert(data.message);
    });
}

// Join room
function joinRoom() {
    const username = document.getElementById('usernameInput').value.trim();
    isDM = document.getElementById('dmToggle').checked;
    
    if (!username) {
        alert('Please enter your name');
        return;
    }
    
    currentUser = username;
    
    // Initialize socket connection
    initializeSocket();
    
    // Join the room
    socket.emit('join', {
        room: roomCode,
        username: username,
        is_dm: isDM
    });
    
    // Update UI
    document.getElementById('usernameInput').disabled = true;
    document.getElementById('dmToggle').disabled = true;
    document.getElementById('joinBtn').style.display = 'none';
    document.getElementById('leaveBtn').style.display = 'inline-block';
    document.getElementById('createCharBtn').style.display = 'inline-block';
    
    // Show DM-only features
    if (isDM) {
        document.getElementById('hiddenRollToggle').style.display = 'flex';
        document.getElementById('monstersBtn').style.display = 'inline-block';
    }
}

// Leave room
function leaveRoom() {
    if (socket) {
        socket.emit('leave', {
            room: roomCode,
            username: currentUser
        });
        socket.disconnect();
    }
    
    // Reset UI
    document.getElementById('usernameInput').disabled = false;
    document.getElementById('dmToggle').disabled = false;
    document.getElementById('joinBtn').style.display = 'inline-block';
    document.getElementById('leaveBtn').style.display = 'none';
    document.getElementById('createCharBtn').style.display = 'none';
    document.getElementById('hiddenRollToggle').style.display = 'none';
    
    currentUser = null;
}

// Copy room code to clipboard
function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        showNotification('Room code copied!');
    });
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Player list management
function addPlayerToList(username, isPlayerDM) {
    const playerList = document.getElementById('playerList');
    
    // Remove empty state
    const emptyState = playerList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    // Add player
    const li = document.createElement('li');
    li.textContent = username + (isPlayerDM ? ' 🎲 DM' : '');
    li.dataset.username = username;
    if (isPlayerDM) li.classList.add('dm');
    playerList.appendChild(li);
}

function removePlayerFromList(username) {
    const playerList = document.getElementById('playerList');
    const player = playerList.querySelector(`[data-username="${username}"]`);
    if (player) player.remove();
    
    // Add empty state if no players
    if (playerList.children.length === 0) {
        playerList.innerHTML = '<li class="empty-state">No players yet</li>';
    }
}

// Character management
let baseAttributes = {}; // Store base rolled attributes before racial bonuses
let appliedRacialBonuses = {}; // Track applied racial bonuses

function openCharacterModal() {
    document.getElementById('characterModal').style.display = 'block';
}

function closeCharacterModal() {
    document.getElementById('characterModal').style.display = 'none';
    // Reset racial bonus tracking
    baseAttributes = {};
    appliedRacialBonuses = {};
}

// Roll 2d4 for a single attribute
function rollSingleAttribute(inputId) {
    console.log('rollSingleAttribute called with:', inputId);
    const die1 = Math.floor(Math.random() * 4) + 1;
    const die2 = Math.floor(Math.random() * 4) + 1;
    const total = die1 + die2;
    
    console.log(`Rolling ${inputId}: ${die1} + ${die2} = ${total}`);
    
    // Store base value before any racial bonuses
    const attr = inputId.replace('attr', '');
    baseAttributes[attr] = total;
    
    const element = document.getElementById(inputId);
    if (!element) {
        console.error('Element not found:', inputId);
        return;
    }
    
    element.value = total;
    console.log(`Set ${inputId} to ${total}`);
}

// Roll 2d4 for all attributes
let isRollingAll = false; // Prevent multiple simultaneous rolls
window.rollAllAttributes = function() {
    if (isRollingAll) {
        console.log('Already rolling, please wait...');
        return;
    }
    
    isRollingAll = true;
    console.log('rollAllAttributes called');
    
    const attributes = ['attrStr', 'attrNim', 'attrEnd', 'attrWis', 'attrInt', 'attrArc', 'attrLck'];
    
    attributes.forEach(attr => {
        try {
            console.log('Rolling attribute:', attr);
            rollSingleAttribute(attr);
        } catch (error) {
            console.error('Error rolling', attr, ':', error);
        }
    });
    
    // Update HP after all rolls
    updateHP();
    
    // Apply racial bonuses if race is selected
    const race = document.getElementById('charRace');
    if (race && race.value) {
        console.log('Applying racial bonuses for:', race.value);
        applyRacialBonuses();
    }
    
    isRollingAll = false;
    console.log('All attributes rolled successfully');
};

// Update racial bonus display when race is selected
window.updateRacialBonuses = function() {
    const race = document.getElementById('charRace').value;
    const bonusSection = document.getElementById('racialBonusSection');
    const bonusText = document.getElementById('racialBonusText');
    const humanChoices = document.getElementById('humanChoices');
    const elfChoice = document.getElementById('elfChoice');
    
    // Hide all choice sections first
    humanChoices.style.display = 'none';
    elfChoice.style.display = 'none';
    
    if (!race) {
        bonusSection.style.display = 'none';
        return;
    }
    
    bonusSection.style.display = 'block';
    
    const racialInfo = {
        'Human': {
            text: 'Versatile: +1 to two attributes of your choice<br>Quick Learner: -1 week on skill training downtime<br><strong>Weakness:</strong> Disadvantage on saves vs disease',
            showChoices: 'human'
        },
        'Elf': {
            text: '+1 NIM (automatic), +1 to WIS or ARC (your choice)<br>Nature Smiths: +2 to crafting with wood/bone/plants<br>Bonus Spells: Learn 3 additional spells<br><strong>Weakness:</strong> Vulnerable to poison',
            showChoices: 'elf'
        },
        'Dwarf': {
            text: '+1 STR, +1 END (automatic)<br>Stonecraft: +2 to checks with stone/minerals<br>Darkvision: See in darkness up to 60 feet<br>Poison Resistance: Advantage on saves vs poison<br><strong>Weakness:</strong> Cannot be magically healed',
            showChoices: null
        },
        'Gnome': {
            text: '+1 INT, +1 LCK (automatic)<br>Small Size: Move through Medium+ creature spaces<br>Tinkerer: +2 to checks with mechanisms/devices<br>Immune to Disoriented condition<br>Lucky: Reroll any 1 on damage dice<br><strong>Weakness:</strong> Small size limits carrying capacity',
            showChoices: null
        }
    };
    
    if (racialInfo[race]) {
        bonusText.innerHTML = racialInfo[race].text;
        if (racialInfo[race].showChoices === 'human') {
            humanChoices.style.display = 'block';
            setupHumanChoices();
        } else if (racialInfo[race].showChoices === 'elf') {
            elfChoice.style.display = 'block';
            setupElfChoice();
        } else {
            // Auto-apply for Dwarf and Gnome immediately
            applyRacialBonuses();
        }
    }
};

// Setup Human choice listeners
function setupHumanChoices() {
    const checkboxes = document.querySelectorAll('.human-choice');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const checked = document.querySelectorAll('.human-choice:checked');
            if (checked.length > 2) {
                this.checked = false;
                alert('You can only choose 2 attributes');
            } else {
                applyRacialBonuses();
            }
        });
    });
}

// Setup Elf choice listener
function setupElfChoice() {
    const radios = document.querySelectorAll('input[name="elfChoice"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            applyRacialBonuses();
        });
    });
}

// Apply racial bonuses to attributes
function applyRacialBonuses() {
    const race = document.getElementById('charRace').value;
    if (!race) return;
    
    // Reset all attributes to base values first
    appliedRacialBonuses = {};
    Object.keys(baseAttributes).forEach(attr => {
        document.getElementById('attr' + attr).value = baseAttributes[attr];
    });
    
   // Apply racial bonuses based on race
if (race === 'Human') {
    const checked = document.querySelectorAll('.human-choice:checked');
    console.log('Human - found checked boxes:', checked.length);
    checked.forEach(cb => {
        const attr = cb.value;
        console.log('Applying +1 to:', attr);
        // Convert STR -> Str, ARC -> Arc, etc. to match input IDs
        const attrFormatted = attr.charAt(0) + attr.slice(1).toLowerCase();
        applyBonus(attrFormatted, 1);
    });
}

// Helper to apply a bonus to an attribute
function applyBonus(attr, bonus) {
    const inputId = 'attr' + attr;
    const element = document.getElementById(inputId);
    
    if (!element) {
        console.error('applyBonus: Element not found:', inputId, 'for attribute:', attr);
        return;
    }
    
    const current = parseInt(element.value) || 0;
    element.value = current + bonus;
    appliedRacialBonuses[attr] = bonus;
    console.log(`Applied +${bonus} to ${attr}, new value: ${element.value}`);
}

// Get racial traits text for character sheet
function getRacialTraits(race) {
    const traits = {
        'Human': 'Versatile (+1 to two chosen attributes) • Quick Learner (3 weeks skill training) • Disadvantage on saves vs disease',
        'Elf': '+1 NIM, +1 WIS or ARC • Nature Smiths (+2 wood/bone/plant crafting) • +3 Bonus Spells • Vulnerable to poison',
        'Dwarf': '+1 STR, +1 END • Stonecraft (+2 stone checks) • Darkvision 60ft • Poison Resistance • Cannot be magically healed',
        'Gnome': '+1 INT, +1 LCK • Small Size • Tinkerer (+2 mechanisms) • Immune to Disoriented • Lucky (reroll 1s on damage)'
    };
    return traits[race] || '';
}

// Calculate Solryn attribute modifier
function getModifier(score) {
    if (score <= 3) return 0;
    if (score <= 5) return 1;
    if (score <= 8) return 2;
    return 0; // Should never happen with 2d4
}

// Update HP when Endurance changes
function updateHP() {
    const endurance = parseInt(document.getElementById('attrEnd').value) || 5;
    const endMod = getModifier(endurance);
    const hp = endurance + endMod;
    document.getElementById('charHp').value = hp;
}

function createCharacter(e) {
    e.preventDefault();
    
    const race = document.getElementById('charRace').value;
    
    // Validate race-specific choices
    if (race === 'Human') {
        const checked = document.querySelectorAll('.human-choice:checked');
        if (checked.length !== 2) {
            alert('Please choose exactly 2 attributes for Human racial bonus');
            return;
        }
    } else if (race === 'Elf') {
        const choice = document.querySelector('input[name="elfChoice"]:checked');
        if (!choice) {
            alert('Please choose WIS or ARC for Elf racial bonus');
            return;
        }
    }
    
    const attributes = {
        STR: parseInt(document.getElementById('attrStr').value),
        NIM: parseInt(document.getElementById('attrNim').value),
        END: parseInt(document.getElementById('attrEnd').value),
        WIS: parseInt(document.getElementById('attrWis').value),
        INT: parseInt(document.getElementById('attrInt').value),
        ARC: parseInt(document.getElementById('attrArc').value),
        LCK: parseInt(document.getElementById('attrLck').value)
    };
    
    const character = {
        name: document.getElementById('charName').value,
        race: race,
        racialTraits: getRacialTraits(race),
        background: document.getElementById('charBackground').value,
        attributes: attributes,
        hp: {
            current: parseInt(document.getElementById('charHp').value),
            max: parseInt(document.getElementById('charHp').value)
        },
        dr: 0, // Will be calculated with armor
        skills: {
            base: {},
            weapon: {},
            crafting: {}
        },
        notes: '',
        owner: currentUser
    };
    
    socket.emit('create_character', {
        room: roomCode,
        character: character
    });
    
    closeCharacterModal();
    document.getElementById('characterForm').reset();
    updateHP(); // Reset HP display
    
    // Clear racial bonus tracking
    baseAttributes = {};
    appliedRacialBonuses = {};
    document.getElementById('racialBonusSection').style.display = 'none';
}

async function loadCharacter(characterId) {
    try {
        const response = await fetch(`/api/character/${characterId}`);
        const character = await response.json();
        characters[characterId] = character;
        addCharacterToList(characterId, character);
    } catch (error) {
        console.error('Error loading character:', error);
    }
}

function addCharacterToList(characterId, character) {
    const characterList = document.getElementById('characterList');
    
    // Remove empty state
    const emptyState = characterList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    // Add character card
    const card = document.createElement('div');
    card.className = 'character-card-mini';
    card.dataset.characterId = characterId;
    card.innerHTML = `
        <strong>${character.name}</strong><br>
        <small>${character.race || 'Unknown'} - HP: ${character.hp.current}/${character.hp.max}</small>
    `;
    card.addEventListener('click', () => selectCharacter(characterId));
    characterList.appendChild(card);
}

function selectCharacter(characterId) {
    currentCharacter = characters[characterId];
    
    // Update active state
    document.querySelectorAll('.character-card-mini').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-character-id="${characterId}"]`).classList.add('active');
    
    // Display character sheet
    displayCharacterSheet(currentCharacter);
    
    // Switch to character tab
    switchTab('character');
}

function displayCharacterSheet(character) {
    const sheet = document.getElementById('characterSheet');
    
    // Calculate modifiers using Solryn rules
    const modifiers = {};
    for (const [key, value] of Object.entries(character.attributes)) {
        if (value <= 3) modifiers[key] = 0;
        else if (value <= 5) modifiers[key] = 1;
        else if (value <= 8) modifiers[key] = 2;
        else modifiers[key] = 0;
    }
    
    // Calculate derived stats
    const baseDR = modifiers.NIM + modifiers.END;
    const movement = 10 + ((modifiers.STR + modifiers.END) * 5);
    const spellSaveDC = 10 + modifiers.ARC + (character.level || 1);
    const maxArcanaPoints = modifiers.ARC * 2;
    const maxLuckPoints = modifiers.LCK;
    
    // Initialize character data if missing
    if (!character.skills) character.skills = { base: {}, weapon: {}, crafting: {} };
    if (!character.equipment) character.equipment = {};
    if (!character.spells) character.spells = [];
    if (!character.arcanaPoints === undefined) character.arcanaPoints = maxArcanaPoints;
    if (!character.luckPoints === undefined) character.luckPoints = maxLuckPoints;
    if (!character.deathSaves) character.deathSaves = { successes: 0, failures: 0 };
    
    sheet.innerHTML = `
        <div class="parchment-sheet">
            <div class="parchment-header">
                <h2 class="parchment-title">${character.name}</h2>
                <div class="parchment-subtitle">${character.race || 'Unknown Race'} • Level ${character.level || 1}</div>
            </div>
            
            ${character.racialTraits ? `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border: 2px solid #c9a14a; border-radius: 6px;">
                <div style="font-family: 'Space Mono', monospace; font-size: 0.75rem; font-weight: 700; color: #856404; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em;">
                    Racial Traits • ${character.race}
                </div>
                <div style="font-size: 0.9rem; color: #5a3825; line-height: 1.5;">
                    ${character.racialTraits}
                </div>
            </div>
            ` : ''}
            
            <div class="parchment-attributes">
                <h3 class="parchment-section-title">Core Attributes</h3>
                <div class="parchment-attributes-grid">
                    ${Object.entries(character.attributes).map(([key, value]) => `
                        <div class="parchment-attribute-box">
                            <div class="parchment-attr-abbr">${key}</div>
                            <div class="parchment-attr-score">${value}</div>
                            <div class="parchment-attr-modifier">+${modifiers[key]}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Luck Points & Death Saves Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="padding: 1rem; background: white; border: 2px solid #b89968; border-radius: 6px;">
                    <div class="parchment-stat-label">Luck Rerolls Available</div>
                    <div style="display: flex; gap: 0.5rem; margin: 0.75rem 0;">
                        ${Array(4).fill(0).map((_, i) => `
                            <div class="luck-marker ${i < (character.luckPoints || 0) ? 'filled' : ''}" 
                                 onclick="toggleLuckPoint(${i})" 
                                 style="width: 30px; height: 30px; border: 3px solid #c9a14a; border-radius: 50%; cursor: pointer; background: ${i < (character.luckPoints || 0) ? '#c9a14a' : 'white'};"></div>
                        `).join('')}
                    </div>
                    <div style="font-size: 0.75rem; color: #5a3825; font-style: italic;">
                        Max = Luck Modifier (${maxLuckPoints}) • Recovered on Long Rest
                    </div>
                </div>
                
                <div style="padding: 1rem; background: white; border: 2px solid #b89968; border-radius: 6px;">
                    <div class="parchment-stat-label">Death Saves</div>
                    <div style="margin-top: 0.5rem;">
                        <div style="margin-bottom: 0.75rem;">
                            <div style="font-size: 0.7rem; font-weight: 700; color: #5a3825; margin-bottom: 0.25rem;">SUCCESSES</div>
                            <div style="display: flex; gap: 0.5rem;">
                                ${Array(3).fill(0).map((_, i) => `
                                    <div class="death-marker success ${i < (character.deathSaves?.successes || 0) ? 'filled' : ''}" 
                                         onclick="toggleDeathSave('success', ${i})"
                                         style="width: 30px; height: 30px; border: 3px solid #4a6741; border-radius: 50%; cursor: pointer; background: ${i < (character.deathSaves?.successes || 0) ? '#4a6741' : 'white'};"></div>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; font-weight: 700; color: #5a3825; margin-bottom: 0.25rem;">FAILURES</div>
                            <div style="display: flex; gap: 0.5rem;">
                                ${Array(3).fill(0).map((_, i) => `
                                    <div class="death-marker failure ${i < (character.deathSaves?.failures || 0) ? 'filled' : ''}" 
                                         onclick="toggleDeathSave('failure', ${i})"
                                         style="width: 30px; height: 30px; border: 3px solid #8b2e1f; border-radius: 50%; cursor: pointer; background: ${i < (character.deathSaves?.failures || 0) ? '#8b2e1f' : 'white'};"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="parchment-stats-row">
                <div class="parchment-stat-card">
                    <div class="parchment-stat-label">Hit Points</div>
                    <div class="parchment-hp-display">
                        <input type="number" class="parchment-hp-input" value="${character.hp.current}" 
                               onchange="updateCharacterHP(event.target.value, ${character.hp.max})" 
                               style="width: 60px; text-align: center;">
                        <span class="parchment-hp-separator">/</span>
                        <span class="parchment-hp-max">${character.hp.max}</span>
                    </div>
                    <div class="parchment-stat-formula">END ${character.attributes.END} + ${modifiers.END}</div>
                </div>
                
                <div class="parchment-stat-card">
                    <div class="parchment-stat-label">Damage Reduction</div>
                    <div class="parchment-stat-value">${baseDR}</div>
                    <div class="parchment-dr-breakdown">
                        <span>NIM +${modifiers.NIM}</span>
                        <span>END +${modifiers.END}</span>
                    </div>
                    <div class="parchment-stat-formula">+ Armor & Shield</div>
                </div>
                
                <div class="parchment-stat-card">
                    <div class="parchment-stat-label">Initiative</div>
                    <div class="parchment-stat-value">+${modifiers.NIM}</div>
                    <div class="parchment-stat-formula">NIM Modifier</div>
                </div>
                
                <div class="parchment-stat-card">
                    <div class="parchment-stat-label">Movement</div>
                    <div class="parchment-stat-value">${movement} ft</div>
                    <div class="parchment-stat-formula">10 + ((STR+END) × 5)</div>
                </div>
            </div>
            
            <!-- Skills Section -->
            ${renderSkillsSection(character, modifiers)}
            
            <!-- Magic & Spells Section -->
            ${modifiers.ARC > 0 ? renderMagicSection(character, modifiers, spellSaveDC, maxArcanaPoints) : ''}
            
            <!-- Equipment Section -->
            ${renderEquipmentSection(character)}
            
            <!-- Action Buttons -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <button class="action-btn" onclick="handleShortRest()">Short Rest</button>
                <button class="action-btn" onclick="handleLongRest()">Long Rest</button>
                <button class="action-btn" onclick="handleLevelUp()">Level Up</button>
            </div>
            
            <div class="parchment-notes-section">
                <h3 class="parchment-section-title">Character Notes</h3>
                <textarea class="parchment-notes" id="characterNotes" rows="6" 
                          onchange="updateCharacterNotes()" 
                          placeholder="Background, goals, and other notes...">${character.notes || ''}</textarea>
            </div>
        </div>
    `;
}

// Render skills section
function renderSkillsSection(character, modifiers) {
    const baseSkills = ['Athletics', 'Acrobatics', 'Stealth', 'Perception', 'Insight', 'Survival', 
                        'Investigation', 'Arcana', 'Medicine', 'Persuasion', 'Intimidation', 'Deception'];
    
    return `
        <div style="background: white; border: 2px solid #b89968; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 class="parchment-section-title">Skills</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <div style="font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 700; color: #c9a14a; margin-bottom: 0.75rem;">
                        BASE SKILLS <span style="font-family: 'Space Mono', monospace; font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #c9a14a; color: white; border-radius: 12px; margin-left: 0.5rem;">0/9</span>
                    </div>
                    ${baseSkills.slice(0, 6).map(skill => renderSkillItem(skill, character, modifiers)).join('')}
                </div>
                <div>
                    <div style="font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 700; color: #c9a14a; margin-bottom: 0.75rem;">
                        WEAPON SKILLS <span style="font-family: 'Space Mono', monospace; font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #c9a14a; color: white; border-radius: 12px; margin-left: 0.5rem;">0/9</span>
                    </div>
                    <div style="font-size: 0.9rem; color: #5a3825; font-style: italic; margin-bottom: 0.5rem;">Custom weapon skills - add your own</div>
                    <div style="font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 700; color: #c9a14a; margin-top: 1.5rem; margin-bottom: 0.75rem;">
                        CRAFTING SKILLS <span style="font-family: 'Space Mono', monospace; font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #c9a14a; color: white; border-radius: 12px; margin-left: 0.5rem;">0/3</span>
                    </div>
                    <div style="font-size: 0.9rem; color: #5a3825; font-style: italic;">Custom crafting skills - add your own</div>
                </div>
            </div>
        </div>
    `;
}

function renderSkillItem(skillName, character, modifiers) {
    const skillLevel = character.skills?.base?.[skillName] || 0;
    const bonus = Math.floor(skillLevel / 3);
    
    return `
        <div style="display: flex; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e8dcc4;">
            <div style="flex: 1; font-size: 0.95rem; color: #2d1810;">${skillName}</div>
            <div style="display: flex; gap: 0.25rem; margin-left: 1rem;">
                ${Array(3).fill(0).map((_, i) => `
                    <div class="tier-dot ${i < Math.min(skillLevel, 3) ? 'filled' : ''}" 
                         style="width: 12px; height: 12px; border: 2px solid #b89968; border-radius: 50%; background: ${i < Math.min(skillLevel, 3) ? '#c9a14a' : 'white'};"></div>
                `).join('')}
            </div>
            <div style="font-family: 'Space Mono', monospace; font-weight: 700; font-size: 0.9rem; color: #8b2e1f; min-width: 40px; text-align: right; margin-left: 0.5rem;">
                ${bonus > 0 ? `+${bonus}` : '—'}
            </div>
        </div>
    `;
}

function renderMagicSection(character, modifiers, spellSaveDC, maxArcanaPoints) {
    const currentAP = character.arcanaPoints || maxArcanaPoints;
    const spellsKnown = modifiers.ARC * 2;
    
    return `
        <div style="background: linear-gradient(135deg, #3d5a6b 0%, #2d4555 100%); color: white; border: 2px solid #3d5a6b; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 700; color: #c9a14a; margin-bottom: 1rem;">Magic & Spells</h3>
            
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="font-family: 'Space Mono', monospace; font-size: 0.8rem; color: rgba(255,255,255,0.8);">ARCANA POINTS</div>
                <div style="display: flex; gap: 0.5rem;">
                    ${Array(6).fill(0).map((_, i) => `
                        <div class="ap-dot ${i < currentAP ? 'filled' : ''}" 
                             onclick="toggleArcanaPoint(${i})"
                             style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.5); border-radius: 50%; cursor: pointer; background: ${i < currentAP ? '#c9a14a' : 'transparent'};"></div>
                    `).join('')}
                </div>
                <div style="margin-left: auto; font-family: 'Space Mono', monospace; font-size: 1.2rem;">
                    ${currentAP} / ${maxArcanaPoints}
                </div>
            </div>
            
            <div style="font-family: 'Space Mono', monospace; font-size: 0.8rem; color: rgba(255,255,255,0.8); margin-bottom: 0.75rem;">
                PREPARED SPELLS (${character.spells?.length || 0}/${spellsKnown}) • SPELL SAVE DC: ${spellSaveDC} (10 + ARC Mod + Level)
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                ${(character.spells || []).map(spell => `
                    <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.75rem;">
                        <div style="font-weight: 700; margin-bottom: 0.25rem;">${spell.name || '_______________'}</div>
                        <div style="font-size: 0.85rem; opacity: 0.8;">${spell.details || '_______________'}</div>
                    </div>
                `).join('')}
                ${Array(Math.max(0, spellsKnown - (character.spells?.length || 0))).fill(0).map(() => `
                    <div style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 4px; padding: 0.75rem;">
                        <div style="font-weight: 700; margin-bottom: 0.25rem;">_______________</div>
                        <div style="font-size: 0.85rem; opacity: 0.6;">_______________</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderEquipmentSection(character) {
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
            <div style="background: white; border: 2px solid #b89968; border-radius: 8px; padding: 1.5rem;">
                <h3 class="parchment-section-title">Equipment</h3>
                
                ${renderEquipmentSlot('Primary Weapon', character.equipment?.primaryWeapon, '1d_ + _ damage (_______)')}
                ${renderEquipmentSlot('Secondary Weapon', character.equipment?.secondaryWeapon, '1d_ + _ damage (_______)')}
                ${renderEquipmentSlot('Armor', character.equipment?.armor, 'DR _ • _______ Armor')}
                ${renderEquipmentSlot('Shield', character.equipment?.shield, 'DR _ • _______ Shield')}
            </div>
            
            <div style="background: white; border: 2px solid #b89968; border-radius: 8px; padding: 1.5rem;">
                <h3 class="parchment-section-title">Inventory</h3>
                
                ${Array(4).fill(0).map((_, i) => `
                    <div style="padding: 0.75rem; background: #f4e8d0; border: 2px dashed #b89968; border-radius: 4px; margin-bottom: 0.75rem; min-height: 50px;">
                        <div style="font-size: 1rem; color: #2d1810;">• ___________________</div>
                        <div style="font-size: 0.85rem; color: #5a3825;">___________________</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderEquipmentSlot(label, item, placeholder) {
    return `
        <div style="padding: 0.75rem; background: #f4e8d0; border: 2px dashed #b89968; border-radius: 4px; margin-bottom: 0.75rem; min-height: 60px;">
            <div style="font-family: 'Space Mono', monospace; font-size: 0.7rem; text-transform: uppercase; color: #5a3825; margin-bottom: 0.25rem; font-weight: 700;">
                ${label}
            </div>
            <div style="font-size: 1rem; color: #2d1810; font-weight: 600;">
                ${item?.name || '_________________'}
            </div>
            <div style="font-size: 0.85rem; color: #5a3825; margin-top: 0.25rem;">
                ${item?.stats || placeholder}
            </div>
        </div>
    `;
}

async function updateCharacter(updates) {
    if (!currentCharacter) return;
    
    const updatedCharacter = { ...currentCharacter, ...updates };
    
    try {
        await fetch(`/api/character/${currentCharacter.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedCharacter)
        });
    } catch (error) {
        console.error('Error updating character:', error);
    }
}

function updateCharacterHP(current, max) {
    const newCurrent = parseInt(event.target.value);
    updateCharacter({
        hp: { current: newCurrent, max: max }
    });
}

function updateCharacterNotes() {
    const notes = document.getElementById('characterNotes').value;
    updateCharacter({ notes: notes });
}

// Toggle luck point
window.toggleLuckPoint = function(index) {
    if (!currentCharacter) return;
    
    const modifiers = {};
    for (const [key, value] of Object.entries(currentCharacter.attributes)) {
        if (value <= 3) modifiers[key] = 0;
        else if (value <= 5) modifiers[key] = 1;
        else if (value <= 8) modifiers[key] = 2;
        else modifiers[key] = 0;
    }
    
    const maxLuck = modifiers.LCK;
    const currentLuck = currentCharacter.luckPoints || maxLuck;
    
    // Toggle logic
    let newLuck;
    if (index < currentLuck) {
        newLuck = index;
    } else {
        newLuck = index + 1;
    }
    
    newLuck = Math.min(newLuck, maxLuck);
    
    updateCharacter({ luckPoints: newLuck });
    setTimeout(() => displayCharacterSheet(currentCharacter), 100);
};

// Toggle death save
window.toggleDeathSave = function(type, index) {
    if (!currentCharacter) return;
    
    const deathSaves = currentCharacter.deathSaves || { successes: 0, failures: 0 };
    const current = deathSaves[type === 'success' ? 'successes' : 'failures'];
    
    let newValue;
    if (index < current) {
        newValue = index;
    } else {
        newValue = index + 1;
    }
    
    newValue = Math.min(newValue, 3);
    
    if (type === 'success') {
        deathSaves.successes = newValue;
    } else {
        deathSaves.failures = newValue;
    }
    
    updateCharacter({ deathSaves: deathSaves });
    setTimeout(() => displayCharacterSheet(currentCharacter), 100);
    
    if (deathSaves.successes >= 3) {
        showNotification('Stabilized! You are unconscious but stable.');
    }
    if (deathSaves.failures >= 3) {
        showNotification('Character has died!');
    }
};

// Toggle arcana point
window.toggleArcanaPoint = function(index) {
    if (!currentCharacter) return;
    
    const modifiers = {};
    for (const [key, value] of Object.entries(currentCharacter.attributes)) {
        if (value <= 3) modifiers[key] = 0;
        else if (value <= 5) modifiers[key] = 1;
        else if (value <= 8) modifiers[key] = 2;
        else modifiers[key] = 0;
    }
    
    const maxAP = modifiers.ARC * 2;
    const currentAP = currentCharacter.arcanaPoints !== undefined ? currentCharacter.arcanaPoints : maxAP;
    
    let newAP;
    if (index < currentAP) {
        newAP = index;
    } else {
        newAP = index + 1;
    }
    
    newAP = Math.min(newAP, maxAP);
    
    updateCharacter({ arcanaPoints: newAP });
    setTimeout(() => displayCharacterSheet(currentCharacter), 100);
};

// Rest handlers
window.handleShortRest = function() {
    if (!currentCharacter) return;
    
    const modifiers = {};
    for (const [key, value] of Object.entries(currentCharacter.attributes)) {
        if (value <= 3) modifiers[key] = 0;
        else if (value <= 5) modifiers[key] = 1;
        else if (value <= 8) modifiers[key] = 2;
        else modifiers[key] = 0;
    }
    
    const maxAP = modifiers.ARC * 2;
    const halfAP = Math.floor(maxAP / 2);
    
    if (confirm('Take a short rest? Recover half Arcana Points.')) {
        currentCharacter.arcanaPoints = halfAP;
        updateCharacter({ arcanaPoints: halfAP });
        showNotification(`Short rest complete! Recovered ${halfAP} Arcana Points.`);
        setTimeout(() => displayCharacterSheet(currentCharacter), 100);
    }
};

window.handleLongRest = function() {
    if (!currentCharacter) return;
    
    const modifiers = {};
    for (const [key, value] of Object.entries(currentCharacter.attributes)) {
        if (value <= 3) modifiers[key] = 0;
        else if (value <= 5) modifiers[key] = 1;
        else if (value <= 8) modifiers[key] = 2;
        else modifiers[key] = 0;
    }
    
    const maxAP = modifiers.ARC * 2;
    const maxLuck = modifiers.LCK;
    const maxHP = currentCharacter.hp.max;
    
    const inTown = confirm('Are you resting in town? (OK = Town, Cancel = Wilderness)');
    
    if (inTown) {
        currentCharacter.hp = { current: maxHP, max: maxHP };
        currentCharacter.arcanaPoints = maxAP;
        currentCharacter.luckPoints = maxLuck;
        currentCharacter.deathSaves = { successes: 0, failures: 0 };
        
        updateCharacter({ 
            hp: { current: maxHP, max: maxHP },
            arcanaPoints: maxAP,
            luckPoints: maxLuck,
            deathSaves: { successes: 0, failures: 0 }
        });
        showNotification('Long rest in town: Full HP, AP, and Luck recovered!');
    } else {
        const halfHP = Math.floor(maxHP / 2);
        
        currentCharacter.hp = { current: halfHP, max: maxHP };
        currentCharacter.arcanaPoints = maxAP;
        currentCharacter.luckPoints = maxLuck;
        currentCharacter.deathSaves = { successes: 0, failures: 0 };
        
        updateCharacter({ 
            hp: { current: halfHP, max: maxHP },
            arcanaPoints: maxAP,
            luckPoints: maxLuck,
            deathSaves: { successes: 0, failures: 0 }
        });
        showNotification('Long rest in wilderness: Half HP, full AP and Luck recovered!');
    }
    
    setTimeout(() => displayCharacterSheet(currentCharacter), 100);
};

window.handleLevelUp = function() {
    if (!currentCharacter) return;
    alert('Level up feature coming soon! Roll 1d4 for each attribute, gain 2 skill points.');
};

// Dice rolling
function rollDice(notation) {
    if (!socket || !currentUser) {
        alert('Please join the room first');
        return;
    }
    
    const hidden = document.getElementById('hiddenRoll')?.checked || false;
    
    socket.emit('roll_dice', {
        room: roomCode,
        dice: notation,
        character: currentCharacter?.name || 'Unknown',
        roller: currentUser,
        hidden: hidden
    });
}

function rollCustomDice() {
    const notation = document.getElementById('customDice').value.trim();
    
    if (!notation) {
        alert('Please enter a dice notation (e.g., 2d6+3)');
        return;
    }
    
    rollDice(notation);
    document.getElementById('customDice').value = '';
}

function addRollToLog(rollData) {
    const rollLog = document.getElementById('rollLog');
    
    // Remove empty state
    const emptyState = rollLog.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    // Create roll entry
    const entry = document.createElement('div');
    entry.className = 'roll-entry';
    if (rollData.hidden) entry.classList.add('hidden-roll');
    
    const timestamp = new Date(rollData.timestamp).toLocaleTimeString();
    
    entry.innerHTML = `
        <div class="roll-header">
            <span><strong>${rollData.roller}</strong> (${rollData.character})</span>
            <span>${timestamp}${rollData.hidden ? ' 🔒' : ''}</span>
        </div>
        <div class="roll-result">${rollData.result.total}</div>
        <div class="roll-details">
            ${rollData.dice}: [${rollData.result.rolls.join(', ')}]
            ${rollData.result.modifier ? ` ${rollData.result.modifier >= 0 ? '+' : ''}${rollData.result.modifier}` : ''}
        </div>
    `;
    
    // Add to top of log
    rollLog.insertBefore(entry, rollLog.firstChild);
    
    // Limit to 50 entries
    while (rollLog.children.length > 50) {
        rollLog.removeChild(rollLog.lastChild);
    }
}

// Rules browser
async function loadRules() {
    try {
        const response = await fetch('/api/rules');
        rules = await response.json();
    } catch (error) {
        console.error('Error loading rules:', error);
    }
}

function loadCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Display rules
    const content = document.getElementById('rulesContent');
    const items = rules[category] || [];
    
    if (items.length === 0) {
        content.innerHTML = '<div class="empty-state">No rules found in this category</div>';
        return;
    }
    
    content.innerHTML = items.map(item => formatRuleItem(item, category)).join('');
}

function formatRuleItem(item, category) {
    let html = `<div class="rule-item">`;
    
    if (category === 'attributes') {
        html += `
            <h4>${item.name} (${item.abbreviation})</h4>
            <p>${item.description}</p>
        `;
    } else if (category === 'skills') {
        html += `
            <h4>${item.name} (${item.attribute})</h4>
            <p>${item.description}</p>
        `;
    } else if (category === 'conditions') {
        html += `
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="rule-details">
                <strong>Effects:</strong>
                <ul>
                    ${item.effects.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        `;
    } else if (category === 'combat_rules') {
        html += `
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="rule-details">${item.details}</div>
        `;
    } else if (category === 'monsters') {
        html += `
            <h4>${item.name}</h4>
            <p><strong>Type:</strong> ${item.type} | <strong>Challenge:</strong> ${item.challenge}</p>
            <p><strong>HP:</strong> ${item.hp} | <strong>Armor:</strong> ${item.armor}</p>
            <div class="rule-details">
                <strong>Attributes:</strong><br>
                ${Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                <br><br>
                <strong>Attacks:</strong>
                <ul>
                    ${item.attacks.map(a => `<li><strong>${a.name}:</strong> ${a.damage}${a.range ? ` (Range: ${a.range})` : ''}</li>`).join('')}
                </ul>
                ${item.abilities ? `
                    <strong>Abilities:</strong>
                    <ul>
                        ${item.abilities.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

async function searchRules() {
    const query = document.getElementById('rulesSearch').value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    try {
        const response = await fetch(`/api/rules/search?q=${encodeURIComponent(query)}&is_dm=${isDM}`);
        const results = await response.json();
        
        const content = document.getElementById('rulesContent');
        
        if (results.length === 0) {
            content.innerHTML = '<div class="empty-state">No results found</div>';
            return;
        }
        
        content.innerHTML = `
            <h3>Search Results for "${query}"</h3>
            ${results.map(r => formatRuleItem(r.item, r.category)).join('')}
        `;
    } catch (error) {
        console.error('Error searching rules:', error);
    }
}

// Notes
function saveNotes() {
    const notes = document.getElementById('gameNotes').value;
    localStorage.setItem(`solryn_notes_${roomCode}`, notes);
    showNotification('Notes saved!');
}

// Load notes on page load
window.addEventListener('load', () => {
    const savedNotes = localStorage.getItem(`solryn_notes_${roomCode}`);
    if (savedNotes) {
        document.getElementById('gameNotes').value = savedNotes;
    }
});

// Notifications
function showNotification(message) {
    // Simple notification - can be enhanced later
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-primary);
        color: var(--color-bg);
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('characterModal');
    if (event.target === modal) {
        closeCharacterModal();
    }
}
