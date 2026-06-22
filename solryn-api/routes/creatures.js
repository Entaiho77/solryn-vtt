const express = require('express');
const fs = require('fs');
const router = express.Router();

const creaturesData = JSON.parse(fs.readFileSync('./data/creatures.json', 'utf8'));

// Middleware: Check for GM auth (placeholder — implement later with token auth)
const isGM = (req, res, next) => {
  const gmToken = req.headers['x-gm-token'];
  if (!gmToken || gmToken !== process.env.GM_TOKEN) {
    return res.status(403).json({ error: 'Access denied: GM credentials required' });
  }
  next();
};

// GET /api/creatures — return all creatures (GM-only)
router.get('/', isGM, (req, res) => {
  res.json(creaturesData.creatures);
});

// GET /api/creatures/:id — return specific creature (GM-only)
router.get('/:id', isGM, (req, res) => {
  const creature = creaturesData.creatures.find(c => c.id === req.params.id);
  if (!creature) return res.status(404).json({ error: 'Creature not found' });
  res.json(creature);
});

module.exports = router;
