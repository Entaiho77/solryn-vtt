const express = require('express');
const fs = require('fs');
const router = express.Router();

const referenceData = JSON.parse(fs.readFileSync('./data/reference.json', 'utf8'));

// GET /api/reference — return all reference tables
router.get('/', (req, res) => {
  res.json(referenceData);
});

// GET /api/reference/:table — return specific reference table
router.get('/:table', (req, res) => {
  const table = referenceData[req.params.table];
  if (!table) return res.status(404).json({ error: 'Reference table not found' });
  res.json(table);
});

module.exports = router;
