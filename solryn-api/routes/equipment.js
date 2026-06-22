const express = require('express');
const fs = require('fs');
const router = express.Router();

const equipmentData = JSON.parse(fs.readFileSync('./data/equipment.json', 'utf8'));

// GET /api/equipment — return all equipment
router.get('/', (req, res) => {
  res.json(equipmentData);
});

// GET /api/equipment/armor — return armor only
router.get('/armor', (req, res) => {
  res.json(equipmentData.armor);
});

// GET /api/equipment/shields — return shields only
router.get('/shields', (req, res) => {
  res.json(equipmentData.shields);
});

// GET /api/equipment/weapons — return weapons only
router.get('/weapons', (req, res) => {
  res.json(equipmentData.weapons);
});

// GET /api/equipment/healing-potions — return healing potions
router.get('/healing-potions', (req, res) => {
  res.json(equipmentData.healingPotions);
});

// GET /api/equipment/soul-cores — return soul cores
router.get('/soul-cores', (req, res) => {
  res.json(equipmentData.soulCores);
});

module.exports = router;
