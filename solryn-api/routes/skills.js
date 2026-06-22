const express = require('express');
const fs = require('fs');
const router = express.Router();

const skillsData = JSON.parse(fs.readFileSync('./data/skills.json', 'utf8'));

// GET /api/skills — return all skills
router.get('/', (req, res) => {
  res.json(skillsData);
});

// GET /api/skills/base — return base skills only
router.get('/base', (req, res) => {
  res.json(skillsData.baseSkills);
});

// GET /api/skills/weapon — return weapon skills only
router.get('/weapon', (req, res) => {
  res.json(skillsData.weaponSkills);
});

// GET /api/skills/action-economy — return action economy skills only
router.get('/action-economy', (req, res) => {
  res.json(skillsData.actionEconomySkills);
});

// GET /api/skills/crafting — return crafting skills only
router.get('/crafting', (req, res) => {
  res.json(skillsData.craftingSkills);
});

// GET /api/skills/:id — return specific skill
router.get('/:id', (req, res) => {
  const allSkills = [
    ...skillsData.baseSkills,
    ...skillsData.weaponSkills,
    ...skillsData.actionEconomySkills,
    ...skillsData.craftingSkills
  ];
  const skill = allSkills.find(s => s.id === req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  res.json(skill);
});

module.exports = router;
