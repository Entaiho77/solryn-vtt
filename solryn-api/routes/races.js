const express = require('express');
const fs = require('fs');
const router = express.Router();

const racesData = JSON.parse(fs.readFileSync('./data/races.json', 'utf8'));

// GET /api/races — return all races
router.get('/', (req, res) => {
  res.json(racesData.races);
});

// GET /api/races/:id — return specific race
router.get('/:id', (req, res) => {
  const race = racesData.races.find(r => r.id === req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });
  res.json(race);
});

module.exports = router;
