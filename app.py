from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import secrets
import os
import requests
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage (will be replaced with database later)
rooms = {}
characters = {}

# Solryn API (solryn-api/) - same idea as fetching an external SRD API,
# but pointed at our own local Express service for game data.
SOLRYN_API_URL = os.environ.get('SOLRYN_API_URL', 'http://localhost:3000')
SOLRYN_GM_TOKEN = os.environ.get('GM_TOKEN', 'your-secret-gm-token-here')

def fetch_from_solryn_api(path, headers=None):
    """GET a path from the Solryn API. Returns None on any failure."""
    try:
        response = requests.get(f'{SOLRYN_API_URL}{path}', headers=headers, timeout=3)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return None

def load_solryn_rules():
    """Load Solryn rules from the local JSON file (fallback / static sections)"""
    rules_path = os.path.join('data', 'solryn_rules.json')
    if os.path.exists(rules_path):
        with open(rules_path, 'r') as f:
            return json.load(f)
    return {}

def build_rules(is_dm=False):
    """
    Build the rules dict served to the VTT. Attributes, conditions, and
    combat rules aren't exposed by the Solryn API, so those sections still
    come from the local file. Skills and Monsters are sourced live from
    the Solryn API (solryn-api/), falling back to the local file if the
    API isn't running.
    """
    rules = load_solryn_rules()

    skills_data = fetch_from_solryn_api('/api/skills')
    if skills_data:
        merged_skills = []
        for category, label in (
            ('baseSkills', 'Base'),
            ('weaponSkills', 'Weapon'),
            ('craftingSkills', 'Crafting'),
        ):
            for skill in skills_data.get(category, []):
                merged_skills.append({
                    'name': skill['name'],
                    'attribute': label,
                    'description': f'{label} skill'
                })
        rules['skills'] = merged_skills

    if is_dm:
        creatures = fetch_from_solryn_api(
            '/api/creatures', headers={'x-gm-token': SOLRYN_GM_TOKEN}
        )
        if creatures is not None:
            rules['monsters'] = [
                {
                    'name': c['name'],
                    'type': c['type'],
                    'challenge': c['threatLevel'],
                    'hp': c['hp'],
                    'armor': c['dr'],
                    'attributes': {},
                    'attacks': [{'name': 'Attack', 'damage': c['damage']}] if c.get('damage') else [],
                    'abilities': c.get('special', [])
                }
                for c in creatures
            ]
    else:
        rules.pop('monsters', None)

    return rules

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/create-room', methods=['POST'])
def create_room():
    """Create a new game room"""
    data = request.json
    room_code = generate_room_code()
    
    rooms[room_code] = {
        'code': room_code,
        'dm': None,
        'players': [],
        'characters': [],
        'created_at': datetime.now().isoformat(),
        'game_system': 'solryn',
        'roll_history': []
    }
    
    return jsonify({'room_code': room_code})

@app.route('/room/<room_code>')
def room(room_code):
    """Game room page"""
    if room_code not in rooms:
        return "Room not found", 404
    return render_template('room.html', room_code=room_code)

@app.route('/api/character/<character_id>', methods=['GET', 'PUT'])
def character_api(character_id):
    """Get or update character data"""
    if request.method == 'GET':
        if character_id in characters:
            return jsonify(characters[character_id])
        return jsonify({'error': 'Character not found'}), 404
    
    elif request.method == 'PUT':
        data = request.json
        characters[character_id] = data
        
        # Broadcast update to room
        room_code = data.get('room_code')
        if room_code:
            socketio.emit('character_updated', {
                'character_id': character_id,
                'character': data
            }, room=room_code)
        
        return jsonify({'success': True})

@app.route('/api/rules')
def get_rules():
    """Get Solryn rules (skills & monsters proxied live from the Solryn API)"""
    # Monsters are always fetched here, same as the prior static-file
    # behavior; visibility to players is still enforced client-side
    # (Monsters tab) and server-side in /api/rules/search below.
    rules = build_rules(is_dm=True)
    return jsonify(rules)

@app.route('/api/rules/search')
def search_rules():
    """Search rules by keyword"""
    query = request.args.get('q', '').lower()
    is_dm = request.args.get('is_dm', '').lower() in ('1', 'true')
    rules = build_rules(is_dm=is_dm)

    results = []
    for category, items in rules.items():
        if not isinstance(items, list):
            continue  # Skip non-list sections (e.g. character_creation)
        if category == 'monsters' and not is_dm:
            continue  # Hide monsters from players

        for item in items:
            if query in item.get('name', '').lower() or query in item.get('description', '').lower():
                results.append({
                    'category': category,
                    'item': item
                })

    return jsonify(results)

# WebSocket events for real-time functionality
@socketio.on('join')
def on_join(data):
    """Player joins a room"""
    room_code = data['room']
    username = data['username']
    is_dm = data.get('is_dm', False)
    
    if room_code not in rooms:
        emit('error', {'message': 'Room not found'})
        return
    
    join_room(room_code)
    
    player_data = {
        'username': username,
        'is_dm': is_dm,
        'sid': request.sid
    }
    
    if is_dm:
        rooms[room_code]['dm'] = player_data
    else:
        rooms[room_code]['players'].append(player_data)
    
    emit('player_joined', {
        'username': username,
        'is_dm': is_dm,
        'players': rooms[room_code]['players'],
        'dm': rooms[room_code]['dm']
    }, room=room_code)
    
    # Send room state to the new player
    emit('room_state', {
        'characters': rooms[room_code]['characters'],
        'roll_history': rooms[room_code]['roll_history'][-20:]  # Last 20 rolls
    })

@socketio.on('leave')
def on_leave(data):
    """Player leaves a room"""
    room_code = data['room']
    username = data['username']
    
    if room_code in rooms:
        leave_room(room_code)
        
        # Remove player from room
        rooms[room_code]['players'] = [
            p for p in rooms[room_code]['players'] 
            if p['sid'] != request.sid
        ]
        
        if rooms[room_code]['dm'] and rooms[room_code]['dm']['sid'] == request.sid:
            rooms[room_code]['dm'] = None
        
        emit('player_left', {
            'username': username
        }, room=room_code)

@socketio.on('roll_dice')
def on_roll_dice(data):
    """Handle dice roll"""
    room_code = data['room']
    dice_notation = data['dice']  # e.g., "2d6+3"
    character_name = data.get('character', 'Unknown')
    is_hidden = data.get('hidden', False)
    roller_name = data.get('roller', 'Unknown')
    
    # Parse and roll dice
    result = roll_dice(dice_notation)
    
    roll_data = {
        'dice': dice_notation,
        'result': result,
        'character': character_name,
        'roller': roller_name,
        'hidden': is_hidden,
        'timestamp': datetime.now().isoformat()
    }
    
    # Add to history
    if room_code in rooms:
        rooms[room_code]['roll_history'].append(roll_data)
    
    # Emit to appropriate audience
    if is_hidden:
        # Only send to DM
        if rooms[room_code]['dm']:
            emit('dice_rolled', roll_data, room=rooms[room_code]['dm']['sid'])
    else:
        # Send to everyone in room
        emit('dice_rolled', roll_data, room=room_code)

def roll_dice(notation):
    """Parse and execute dice notation (e.g., 2d6+3)"""
    import re
    import random
    
    # Parse notation: XdY+Z or XdY-Z or XdY
    match = re.match(r'(\d+)d(\d+)([\+\-]\d+)?', notation.lower())
    if not match:
        return {'error': 'Invalid dice notation'}
    
    num_dice = int(match.group(1))
    die_size = int(match.group(2))
    modifier = int(match.group(3) or 0)
    
    # Roll dice
    rolls = [random.randint(1, die_size) for _ in range(num_dice)]
    total = sum(rolls) + modifier
    
    return {
        'rolls': rolls,
        'modifier': modifier,
        'total': total,
        'notation': notation
    }

@socketio.on('create_character')
def on_create_character(data):
    """Create a new character in the room"""
    room_code = data['room']
    character_data = data['character']
    
    character_id = secrets.token_hex(8)
    character_data['id'] = character_id
    character_data['room_code'] = room_code
    
    characters[character_id] = character_data
    
    if room_code in rooms:
        rooms[room_code]['characters'].append(character_id)
    
    emit('character_created', {
        'character_id': character_id,
        'character': character_data
    }, room=room_code)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
