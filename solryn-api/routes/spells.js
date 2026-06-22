const express = require('express');
const fs = require('fs');
const router = express.Router();

const spellsData = JSON.parse(fs.readFileSync('./data/spells.json', 'utf8'));

// GET /api/spells — return all spells
router.get('/', (req, res) => {
  res.json(spellsData.spells);
});

// GET /api/spells/modifications — return spell modifications
router.get('/modifications', (req, res) => {
  res.json(spellsData.modifications);
});

// GET /api/spells/type/:type — return spells by type
router.get('/type/:type', (req, res) => {
  const spells = spellsData.spells.filter(s => s.type === req.params.type);
  res.json(spells);
});

// GET /api/spells/:id — return specific spell
router.get('/:id', (req, res) => {
  const spell = spellsData.spells.find(s => s.id === req.params.id);
  if (!spell) return res.status(404).json({ error: 'Spell not found' });
  res.json(spell);
});

module.exports = router;
