// AUTO-GENERATED — do not edit by hand.
// Produced by scripts/genDnd5eClasses.ts from data/srd-classes-5e.json + data/srd-levels-5e.json
// (5e-bits/5e-database). Accurate 1–20 tables (prof bonus, features, ASI levels, counters).
// No spell slots emitted yet — the casting subsystem regenerates those. Regenerate with:
// npm run gen:classes5e
import type { ClassDefinition } from '../../engine/schema';

export const generatedClasses: ClassDefinition[] = [
  {
    "id": "barbarian",
    "name": "Barbarian",
    "hitDie": "d12",
    "primaryAbilities": [
      "STR"
    ],
    "savingThrows": [
      "STR",
      "CON"
    ],
    "proficiencies": {
      "armor": [
        "light",
        "medium",
        "shields"
      ],
      "weapons": [
        "simple",
        "martial"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "animal-handling",
        "athletics",
        "intimidation",
        "nature",
        "perception",
        "survival"
      ]
    },
    "startingEquipment": [
      "Explorer's Pack",
      "4× Javelin"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Rage",
          "Unarmored Defense"
        ],
        "counters": {
          "rage_count": 2,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Reckless Attack",
          "Danger Sense"
        ],
        "counters": {
          "rage_count": 2,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Primal Path"
        ],
        "counters": {
          "rage_count": 3,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "rage_count": 3,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Extra Attack",
          "Fast Movement"
        ],
        "counters": {
          "rage_count": 3,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Path feature"
        ],
        "counters": {
          "rage_count": 4,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Feral Instinct"
        ],
        "counters": {
          "rage_count": 4,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "rage_count": 4,
          "rage_damage_bonus": 2
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [
          "Brutal Critical (1 die)"
        ],
        "counters": {
          "rage_count": 4,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 1
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Path feature"
        ],
        "counters": {
          "rage_count": 4,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 1
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Relentless Rage"
        ],
        "counters": {
          "rage_count": 4,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 1
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "rage_count": 5,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 1
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [
          "Brutal Critical (2 dice)"
        ],
        "counters": {
          "rage_count": 5,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 2
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Path feature"
        ],
        "counters": {
          "rage_count": 5,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 2
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Persistent Rage"
        ],
        "counters": {
          "rage_count": 5,
          "rage_damage_bonus": 3,
          "brutal_critical_dice": 2
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "rage_count": 5,
          "rage_damage_bonus": 4,
          "brutal_critical_dice": 2
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Brutal Critical (3 dice)"
        ],
        "counters": {
          "rage_count": 6,
          "rage_damage_bonus": 4,
          "brutal_critical_dice": 3
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Indomitable Might"
        ],
        "counters": {
          "rage_count": 6,
          "rage_damage_bonus": 4,
          "brutal_critical_dice": 3
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "rage_count": 6,
          "rage_damage_bonus": 4,
          "brutal_critical_dice": 3
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Primal Champion"
        ],
        "counters": {
          "rage_count": 9999,
          "rage_damage_bonus": 4,
          "brutal_critical_dice": 3
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "greataxe"
      ]
    },
    "unarmoredDefense": {
      "ability": "CON"
    }
  },
  {
    "id": "bard",
    "name": "Bard",
    "hitDie": "d8",
    "primaryAbilities": [
      "CHA"
    ],
    "savingThrows": [
      "DEX",
      "CHA"
    ],
    "proficiencies": {
      "armor": [
        "light"
      ],
      "weapons": [
        "simple",
        "longswords",
        "rapiers",
        "shortswords",
        "hand-crossbows"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 3,
      "from": [
        "acrobatics",
        "animal-handling",
        "arcana",
        "athletics",
        "deception",
        "history",
        "insight",
        "intimidation",
        "investigation",
        "medicine",
        "nature",
        "perception",
        "performance",
        "persuasion",
        "religion",
        "sleight-of-hand",
        "stealth",
        "survival"
      ]
    },
    "startingEquipment": [
      "Leather Armor",
      "Dagger"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Spellcasting: Bard",
          "Bardic Inspiration (d6)"
        ],
        "counters": {
          "bardic_inspiration_die": 6
        }
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Jack of All Trades",
          "Song of Rest (d6)"
        ],
        "counters": {
          "bardic_inspiration_die": 6,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Expertise",
          "Bard College"
        ],
        "counters": {
          "bardic_inspiration_die": 6,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "bardic_inspiration_die": 6,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Bardic Inspiration (d8)",
          "Font of Inspiration"
        ],
        "counters": {
          "bardic_inspiration_die": 8,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Countercharm",
          "Bard College feature"
        ],
        "counters": {
          "bardic_inspiration_die": 8,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "bardic_inspiration_die": 8,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "bardic_inspiration_die": 8,
          "song_of_rest_die": 6
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [
          "Song of Rest (d8)"
        ],
        "counters": {
          "bardic_inspiration_die": 8,
          "song_of_rest_die": 8
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Expertise",
          "Bardic Inspiration (d10)",
          "Magical Secrets"
        ],
        "counters": {
          "bardic_inspiration_die": 10,
          "song_of_rest_die": 8,
          "magical_secrets_max_5": 2
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "bardic_inspiration_die": 10,
          "song_of_rest_die": 8,
          "magical_secrets_max_5": 2
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "bardic_inspiration_die": 10,
          "song_of_rest_die": 8,
          "magical_secrets_max_5": 2
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [
          "Song of Rest (d10)"
        ],
        "counters": {
          "bardic_inspiration_die": 10,
          "song_of_rest_die": 10,
          "magical_secrets_max_5": 2
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Magical Secrets",
          "Bard College feature"
        ],
        "counters": {
          "bardic_inspiration_die": 10,
          "song_of_rest_die": 10,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Bardic Inspiration (d12)"
        ],
        "counters": {
          "bardic_inspiration_die": 12,
          "song_of_rest_die": 10,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "bardic_inspiration_die": 12,
          "song_of_rest_die": 10,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Song of Rest (d12)"
        ],
        "counters": {
          "bardic_inspiration_die": 12,
          "song_of_rest_die": 12,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Magical Secrets"
        ],
        "counters": {
          "bardic_inspiration_die": 12,
          "song_of_rest_die": 12,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2,
          "magical_secrets_max_9": 2
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "bardic_inspiration_die": 12,
          "song_of_rest_die": 12,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2,
          "magical_secrets_max_9": 2
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Superior Inspiration"
        ],
        "counters": {
          "bardic_inspiration_die": 12,
          "song_of_rest_die": 12,
          "magical_secrets_max_5": 2,
          "magical_secrets_max_7": 2,
          "magical_secrets_max_9": 2
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "dagger"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "CHA",
      "type": "known"
    }
  },
  {
    "id": "cleric",
    "name": "Cleric",
    "hitDie": "d8",
    "primaryAbilities": [
      "WIS"
    ],
    "savingThrows": [
      "WIS",
      "CHA"
    ],
    "proficiencies": {
      "armor": [
        "light",
        "medium",
        "shields"
      ],
      "weapons": [
        "simple"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "history",
        "insight",
        "medicine",
        "persuasion",
        "religion"
      ]
    },
    "startingEquipment": [
      "Shield"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Spellcasting: Cleric",
          "Divine Domain",
          "Domain Spells"
        ]
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Channel Divinity (1/rest)",
          "Channel Divinity: Turn Undead",
          "Divine Domain feature"
        ],
        "counters": {
          "channel_divinity_charges": 1
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Domain Spells"
        ],
        "counters": {
          "channel_divinity_charges": 1
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "channel_divinity_charges": 1
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Domain Spells",
          "Destroy Undead (CR 1/2 or below)"
        ],
        "counters": {
          "channel_divinity_charges": 1,
          "destroy_undead_cr": 0.5
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Channel Divinity (2/rest)",
          "Divine Domain feature"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 0.5
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Domain Spells"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 0.5
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement",
          "Destroy Undead (CR 1 or below)",
          "Divine Domain feature"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 1
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [
          "Domain Spells"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 1
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Divine Intervention"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 1
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Destroy Undead (CR 2 or below)"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 2
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 2
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 2
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Destroy Undead (CR 3 or below)"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 3
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 3
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 3
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Destroy Undead (CR 4 or below)",
          "Divine Domain feature"
        ],
        "counters": {
          "channel_divinity_charges": 2,
          "destroy_undead_cr": 4
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Channel Divinity (3/rest)"
        ],
        "counters": {
          "channel_divinity_charges": 3,
          "destroy_undead_cr": 4
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "channel_divinity_charges": 3,
          "destroy_undead_cr": 4
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Divine Intervention Improvement"
        ],
        "counters": {
          "channel_divinity_charges": 3,
          "destroy_undead_cr": 4
        }
      }
    ],
    "subclassLevel": 1,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "dagger"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "WIS",
      "type": "prepared"
    }
  },
  {
    "id": "druid",
    "name": "Druid",
    "hitDie": "d8",
    "primaryAbilities": [
      "WIS"
    ],
    "savingThrows": [
      "INT",
      "WIS"
    ],
    "proficiencies": {
      "armor": [
        "light",
        "medium",
        "shields"
      ],
      "weapons": [
        "clubs",
        "daggers",
        "javelins",
        "maces",
        "quarterstaffs",
        "sickles",
        "spears",
        "darts",
        "slings",
        "scimitars"
      ],
      "tools": [
        "herbalism-kit"
      ]
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "arcana",
        "animal-handling",
        "insight",
        "medicine",
        "nature",
        "perception",
        "religion",
        "survival"
      ]
    },
    "startingEquipment": [
      "Leather Armor",
      "Explorer's Pack"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Spellcasting: Druid",
          "Druidic"
        ]
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Wild Shape (CR 1/4 or below, no flying or swim speed)",
          "Druid Circle"
        ],
        "counters": {
          "wild_shape_max_cr": 0.25
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 0.25
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Wild Shape (CR 1/2 or below, no flying speed)",
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "wild_shape_max_cr": 0.5
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 0.5
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Druid Circle feature"
        ],
        "counters": {
          "wild_shape_max_cr": 0.5
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Wild Shape (CR 1 or below)",
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Druid Circle feature"
        ],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Druid Circle feature"
        ],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Timeless Body",
          "Beast Spells"
        ],
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "wild_shape_max_cr": 1
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Archdruid"
        ],
        "counters": {
          "wild_shape_max_cr": 1
        }
      }
    ],
    "subclassLevel": 2,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "dagger"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "WIS",
      "type": "prepared"
    }
  },
  {
    "id": "fighter",
    "name": "Fighter",
    "hitDie": "d10",
    "primaryAbilities": [
      "STR",
      "DEX"
    ],
    "savingThrows": [
      "STR",
      "CON"
    ],
    "proficiencies": {
      "armor": [
        "all",
        "shields"
      ],
      "weapons": [
        "simple",
        "martial"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "acrobatics",
        "animal-handling",
        "athletics",
        "history",
        "insight",
        "intimidation",
        "perception",
        "survival"
      ]
    },
    "startingEquipment": [],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Fighting Style",
          "Second Wind"
        ]
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Action Surge (1 use)"
        ],
        "counters": {
          "action_surges": 1
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Martial Archetype"
        ],
        "counters": {
          "action_surges": 1
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 1
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Extra Attack"
        ],
        "counters": {
          "action_surges": 1,
          "extra_attacks": 1
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 1,
          "extra_attacks": 1
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Martial Archetype feature"
        ],
        "counters": {
          "action_surges": 1,
          "extra_attacks": 1
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 1,
          "extra_attacks": 1
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [
          "Indomitable (1 use)"
        ],
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 1,
          "extra_attacks": 1
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Martial Archetype feature"
        ],
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 1,
          "extra_attacks": 1
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Extra Attack (2)"
        ],
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 1,
          "extra_attacks": 2
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 1,
          "extra_attacks": 2
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [
          "Indomitable (2 uses)"
        ],
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 2,
          "extra_attacks": 2
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 2,
          "extra_attacks": 2
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Martial Archetype feature"
        ],
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 2,
          "extra_attacks": 2
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 1,
          "indomitable_uses": 2,
          "extra_attacks": 2
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Action Surge (2 uses)",
          "Indomitable (3 uses)"
        ],
        "counters": {
          "action_surges": 2,
          "indomitable_uses": 3,
          "extra_attacks": 2
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Martial Archetype feature"
        ],
        "counters": {
          "action_surges": 2,
          "indomitable_uses": 3,
          "extra_attacks": 2
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "action_surges": 2,
          "indomitable_uses": 3,
          "extra_attacks": 2
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Extra Attack (3)"
        ],
        "counters": {
          "action_surges": 2,
          "indomitable_uses": 3,
          "extra_attacks": 3
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "longsword"
      ],
      "armorId": "chain-mail"
    }
  },
  {
    "id": "monk",
    "name": "Monk",
    "hitDie": "d8",
    "primaryAbilities": [
      "DEX",
      "WIS"
    ],
    "savingThrows": [
      "STR",
      "DEX"
    ],
    "proficiencies": {
      "armor": [],
      "weapons": [
        "simple",
        "shortswords"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "acrobatics",
        "athletics",
        "history",
        "insight",
        "religion",
        "stealth"
      ]
    },
    "startingEquipment": [
      "10× Dart"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Unarmored Defense",
          "Martial Arts"
        ],
        "counters": {
          "martial_arts": "1d4"
        }
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Ki",
          "Flurry of Blows",
          "Patient Defense",
          "Step of the Wind",
          "Unarmored Movement"
        ],
        "counters": {
          "martial_arts": "1d4",
          "ki_points": 2,
          "unarmored_movement": 10
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Monastic Tradition",
          "Deflect Missiles"
        ],
        "counters": {
          "martial_arts": "1d4",
          "ki_points": 3,
          "unarmored_movement": 10
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement",
          "Slow Fall"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "martial_arts": "1d4",
          "ki_points": 4,
          "unarmored_movement": 10
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Extra Attack",
          "Stunning Strike"
        ],
        "counters": {
          "martial_arts": "1d6",
          "ki_points": 5,
          "unarmored_movement": 10
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Ki Empowered Strikes",
          "Monastic Tradition feature"
        ],
        "counters": {
          "martial_arts": "1d6",
          "ki_points": 6,
          "unarmored_movement": 15
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Evasion",
          "Stillness of Mind"
        ],
        "counters": {
          "martial_arts": "1d6",
          "ki_points": 7,
          "unarmored_movement": 15
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "martial_arts": "1d6",
          "ki_points": 8,
          "unarmored_movement": 15
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [
          "Unarmored Movement"
        ],
        "counters": {
          "martial_arts": "1d6",
          "ki_points": 9,
          "unarmored_movement": 15
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Purity of Body"
        ],
        "counters": {
          "martial_arts": "1d6",
          "ki_points": 10,
          "unarmored_movement": 20
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Monastic Tradition feature"
        ],
        "counters": {
          "martial_arts": "1d8",
          "ki_points": 11,
          "unarmored_movement": 20
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "martial_arts": "1d8",
          "ki_points": 12,
          "unarmored_movement": 20
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [
          "Tongue of the Sun and Moon"
        ],
        "counters": {
          "martial_arts": "1d8",
          "ki_points": 13,
          "unarmored_movement": 20
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Diamond Soul"
        ],
        "counters": {
          "martial_arts": "1d8",
          "ki_points": 14,
          "unarmored_movement": 25
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Timeless Body"
        ],
        "counters": {
          "martial_arts": "1d8",
          "ki_points": 15,
          "unarmored_movement": 25
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "martial_arts": "1d8",
          "ki_points": 16,
          "unarmored_movement": 25
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Monastic Tradition feature"
        ],
        "counters": {
          "martial_arts": "1d10",
          "ki_points": 17,
          "unarmored_movement": 25
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Empty Body"
        ],
        "counters": {
          "martial_arts": "1d10",
          "ki_points": 18,
          "unarmored_movement": 30
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "martial_arts": "1d10",
          "ki_points": 19,
          "unarmored_movement": 30
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Perfect Self"
        ],
        "counters": {
          "martial_arts": "1d10",
          "ki_points": 20,
          "unarmored_movement": 30
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "quarterstaff"
      ]
    },
    "unarmoredDefense": {
      "ability": "WIS"
    }
  },
  {
    "id": "paladin",
    "name": "Paladin",
    "hitDie": "d10",
    "primaryAbilities": [
      "STR",
      "CHA"
    ],
    "savingThrows": [
      "WIS",
      "CHA"
    ],
    "proficiencies": {
      "armor": [
        "all",
        "shields"
      ],
      "weapons": [
        "simple",
        "martial"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "athletics",
        "insight",
        "intimidation",
        "medicine",
        "persuasion",
        "religion"
      ]
    },
    "startingEquipment": [
      "Chain Mail"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Divine Sense",
          "Lay on Hands"
        ]
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Fighting Style",
          "Spellcasting: Paladin",
          "Divine Smite"
        ]
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Divine Health",
          "Sacred Oath",
          "Oath Spells",
          "Channel Divinity"
        ]
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Extra Attack"
        ]
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Aura of Protection"
        ],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Sacred Oath feature"
        ],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Aura of Courage"
        ],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Improved Divine Smite"
        ],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Cleansing Touch"
        ],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Sacred Oath feature"
        ],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [],
        "counters": {
          "aura_range": 10
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Aura improvements"
        ],
        "counters": {
          "aura_range": 30
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "aura_range": 30
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Sacred Oath feature"
        ],
        "counters": {
          "aura_range": 30
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "longsword"
      ],
      "armorId": "chain-mail"
    },
    "spellcasting": {
      "ability": "CHA",
      "type": "prepared"
    }
  },
  {
    "id": "ranger",
    "name": "Ranger",
    "hitDie": "d10",
    "primaryAbilities": [
      "DEX",
      "WIS"
    ],
    "savingThrows": [
      "STR",
      "DEX"
    ],
    "proficiencies": {
      "armor": [
        "light",
        "medium",
        "shields"
      ],
      "weapons": [
        "simple",
        "martial"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 3,
      "from": [
        "animal-handling",
        "athletics",
        "insight",
        "investigation",
        "nature",
        "perception",
        "stealth",
        "survival"
      ]
    },
    "startingEquipment": [
      "Longbow",
      "20× Arrow"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Favored Enemy (1 type)",
          "Natural Explorer (1 terrain type)"
        ],
        "counters": {
          "favored_enemies": 1,
          "favored_terrain": 1
        }
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Fighting Style",
          "Spellcasting: Ranger"
        ],
        "counters": {
          "favored_enemies": 1,
          "favored_terrain": 1
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Ranger Archetype",
          "Primeval Awareness"
        ],
        "counters": {
          "favored_enemies": 1,
          "favored_terrain": 1
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "favored_enemies": 1,
          "favored_terrain": 1
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Extra Attack"
        ],
        "counters": {
          "favored_enemies": 1,
          "favored_terrain": 1
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Favored Enemy (2 types)",
          "Natural Explorer (2 terrain types)"
        ],
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 2
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Ranger Archetype feature"
        ],
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 2
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement",
          "Land's Stride"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 2
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 2
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Natural Explorer (3 terrain types)",
          "Hide in Plain Sight"
        ],
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 3
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Ranger Archetype feature"
        ],
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 3
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 3
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "favored_enemies": 2,
          "favored_terrain": 3
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Favored Enemy (3 enemies)",
          "Vanish"
        ],
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Ranger Archetype feature"
        ],
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [],
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Feral Senses"
        ],
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Foe Slayer"
        ],
        "counters": {
          "favored_enemies": 3,
          "favored_terrain": 3
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "shortsword",
        "shortbow"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "WIS",
      "type": "known"
    }
  },
  {
    "id": "rogue",
    "name": "Rogue",
    "hitDie": "d8",
    "primaryAbilities": [
      "DEX"
    ],
    "savingThrows": [
      "DEX",
      "INT"
    ],
    "proficiencies": {
      "armor": [
        "light"
      ],
      "weapons": [
        "simple",
        "longswords",
        "rapiers",
        "shortswords",
        "hand-crossbows"
      ],
      "tools": [
        "thieves-tools"
      ]
    },
    "skillChoices": {
      "choose": 4,
      "from": [
        "acrobatics",
        "athletics",
        "deception",
        "insight",
        "intimidation",
        "investigation",
        "perception",
        "performance",
        "persuasion",
        "sleight-of-hand",
        "stealth"
      ]
    },
    "startingEquipment": [
      "Leather Armor",
      "2× Dagger",
      "Thieves' Tools"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Expertise",
          "Sneak Attack",
          "Thieves' Cant"
        ],
        "counters": {
          "sneak_attack": "1d6"
        }
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Cunning Action"
        ],
        "counters": {
          "sneak_attack": "1d6"
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Roguish Archetype"
        ],
        "counters": {
          "sneak_attack": "2d6"
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sneak_attack": "2d6"
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [
          "Uncanny Dodge"
        ],
        "counters": {
          "sneak_attack": "3d6"
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Expertise"
        ],
        "counters": {
          "sneak_attack": "3d6"
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [
          "Evasion"
        ],
        "counters": {
          "sneak_attack": "4d6"
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sneak_attack": "4d6"
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [
          "Roguish Archetype feature"
        ],
        "counters": {
          "sneak_attack": "5d6"
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sneak_attack": "5d6"
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Reliable Talent"
        ],
        "counters": {
          "sneak_attack": "6d6"
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sneak_attack": "6d6"
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [
          "Roguish Archetype feature"
        ],
        "counters": {
          "sneak_attack": "7d6"
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Blindsense"
        ],
        "counters": {
          "sneak_attack": "7d6"
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Slippery Mind"
        ],
        "counters": {
          "sneak_attack": "8d6"
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sneak_attack": "8d6"
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Roguish Archetype feature"
        ],
        "counters": {
          "sneak_attack": "9d6"
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Elusive"
        ],
        "counters": {
          "sneak_attack": "9d6"
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sneak_attack": "10d6"
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Stroke of Luck"
        ],
        "counters": {
          "sneak_attack": "10d6"
        }
      }
    ],
    "subclassLevel": 3,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "rapier",
        "shortbow"
      ],
      "armorId": "leather-armor"
    }
  },
  {
    "id": "sorcerer",
    "name": "Sorcerer",
    "hitDie": "d6",
    "primaryAbilities": [
      "CHA"
    ],
    "savingThrows": [
      "CON",
      "CHA"
    ],
    "proficiencies": {
      "armor": [],
      "weapons": [
        "daggers",
        "darts",
        "slings",
        "quarterstaffs",
        "crossbows-light"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "arcana",
        "deception",
        "insight",
        "intimidation",
        "persuasion",
        "religion"
      ]
    },
    "startingEquipment": [
      "2× Dagger"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Spellcasting: Sorcerer",
          "Sorcerous Origin"
        ]
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Font of Magic",
          "Flexible Casting: Creating Spell Slots",
          "Flexible Casting: Converting Spell Slot"
        ],
        "counters": {
          "sorcery_points": 2
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Metamagic"
        ],
        "counters": {
          "sorcery_points": 3,
          "metamagic_known": 2
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sorcery_points": 4,
          "metamagic_known": 2
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "sorcery_points": 5,
          "metamagic_known": 2
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Sorcerous Origin feature"
        ],
        "counters": {
          "sorcery_points": 6,
          "metamagic_known": 2
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "sorcery_points": 7,
          "metamagic_known": 2
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sorcery_points": 8,
          "metamagic_known": 2
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "sorcery_points": 9,
          "metamagic_known": 2
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Metamagic"
        ],
        "counters": {
          "sorcery_points": 10,
          "metamagic_known": 3
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "sorcery_points": 11,
          "metamagic_known": 3
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sorcery_points": 12,
          "metamagic_known": 3
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "sorcery_points": 13,
          "metamagic_known": 3
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Sorcerous Origin feature"
        ],
        "counters": {
          "sorcery_points": 14,
          "metamagic_known": 3
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "sorcery_points": 15,
          "metamagic_known": 3
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sorcery_points": 16,
          "metamagic_known": 4
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Metamagic"
        ],
        "counters": {
          "sorcery_points": 17,
          "metamagic_known": 4
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Sorcerous Origin feature"
        ],
        "counters": {
          "sorcery_points": 18,
          "metamagic_known": 4
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "sorcery_points": 19,
          "metamagic_known": 4
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Sorcerous Restoration"
        ],
        "counters": {
          "sorcery_points": 20,
          "metamagic_known": 4
        }
      }
    ],
    "subclassLevel": 1,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "dagger"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "CHA",
      "type": "known"
    }
  },
  {
    "id": "warlock",
    "name": "Warlock",
    "hitDie": "d8",
    "primaryAbilities": [
      "CHA"
    ],
    "savingThrows": [
      "WIS",
      "CHA"
    ],
    "proficiencies": {
      "armor": [
        "light"
      ],
      "weapons": [
        "simple"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "arcana",
        "deception",
        "history",
        "intimidation",
        "investigation",
        "nature",
        "religion"
      ]
    },
    "startingEquipment": [
      "2× Dagger",
      "Leather Armor"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Otherworldly Patron",
          "Pact Magic"
        ]
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Eldritch Invocations"
        ],
        "counters": {
          "invocations_known": 2
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [
          "Pact Boon"
        ],
        "counters": {
          "invocations_known": 2
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "invocations_known": 3
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "invocations_known": 3
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Otherworldly Patron feature"
        ],
        "counters": {
          "invocations_known": 4
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "invocations_known": 4
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "invocations_known": 4
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "invocations_known": 5
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Otherworldly Patron feature"
        ],
        "counters": {
          "invocations_known": 5
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [
          "Mystic Arcanum (6th level)"
        ],
        "counters": {
          "invocations_known": 5,
          "mystic_arcanum_level_6": 1
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "invocations_known": 6,
          "mystic_arcanum_level_6": 1
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [
          "Mystic Arcanum (7th level)"
        ],
        "counters": {
          "invocations_known": 6,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Otherworldly Patron feature"
        ],
        "counters": {
          "invocations_known": 6,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [
          "Mystic Arcanum (8th level)"
        ],
        "counters": {
          "invocations_known": 7,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1,
          "mystic_arcanum_level_8": 1
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "invocations_known": 7,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1,
          "mystic_arcanum_level_8": 1
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [
          "Mystic Arcanum (9th level)"
        ],
        "counters": {
          "invocations_known": 7,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1,
          "mystic_arcanum_level_8": 1,
          "mystic_arcanum_level_9": 1
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [],
        "counters": {
          "invocations_known": 8,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1,
          "mystic_arcanum_level_8": 1,
          "mystic_arcanum_level_9": 1
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "invocations_known": 8,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1,
          "mystic_arcanum_level_8": 1,
          "mystic_arcanum_level_9": 1
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Eldritch Master"
        ],
        "counters": {
          "invocations_known": 8,
          "mystic_arcanum_level_6": 1,
          "mystic_arcanum_level_7": 1,
          "mystic_arcanum_level_8": 1,
          "mystic_arcanum_level_9": 1
        }
      }
    ],
    "subclassLevel": 1,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "dagger"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "CHA",
      "type": "known"
    }
  },
  {
    "id": "wizard",
    "name": "Wizard",
    "hitDie": "d6",
    "primaryAbilities": [
      "INT"
    ],
    "savingThrows": [
      "INT",
      "WIS"
    ],
    "proficiencies": {
      "armor": [],
      "weapons": [
        "daggers",
        "darts",
        "slings",
        "quarterstaffs",
        "crossbows-light"
      ],
      "tools": []
    },
    "skillChoices": {
      "choose": 2,
      "from": [
        "arcana",
        "history",
        "insight",
        "investigation",
        "medicine",
        "religion"
      ]
    },
    "startingEquipment": [
      "Spellbook"
    ],
    "levels": [
      {
        "level": 1,
        "proficiencyBonus": 2,
        "features": [
          "Spellcasting: Wizard",
          "Arcane Recovery"
        ],
        "counters": {
          "arcane_recovery_levels": 1
        }
      },
      {
        "level": 2,
        "proficiencyBonus": 2,
        "features": [
          "Arcane Tradition"
        ],
        "counters": {
          "arcane_recovery_levels": 1
        }
      },
      {
        "level": 3,
        "proficiencyBonus": 2,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 2
        }
      },
      {
        "level": 4,
        "proficiencyBonus": 2,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "arcane_recovery_levels": 2
        }
      },
      {
        "level": 5,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 3
        }
      },
      {
        "level": 6,
        "proficiencyBonus": 3,
        "features": [
          "Arcane Tradition feature"
        ],
        "counters": {
          "arcane_recovery_levels": 3
        }
      },
      {
        "level": 7,
        "proficiencyBonus": 3,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 4
        }
      },
      {
        "level": 8,
        "proficiencyBonus": 3,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "arcane_recovery_levels": 4
        }
      },
      {
        "level": 9,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 5
        }
      },
      {
        "level": 10,
        "proficiencyBonus": 4,
        "features": [
          "Arcane Tradition feature"
        ],
        "counters": {
          "arcane_recovery_levels": 5
        }
      },
      {
        "level": 11,
        "proficiencyBonus": 4,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 6
        }
      },
      {
        "level": 12,
        "proficiencyBonus": 4,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "arcane_recovery_levels": 6
        }
      },
      {
        "level": 13,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 7
        }
      },
      {
        "level": 14,
        "proficiencyBonus": 5,
        "features": [
          "Arcane Tradition feature"
        ],
        "counters": {
          "arcane_recovery_levels": 7
        }
      },
      {
        "level": 15,
        "proficiencyBonus": 5,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 8
        }
      },
      {
        "level": 16,
        "proficiencyBonus": 5,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "arcane_recovery_levels": 8
        }
      },
      {
        "level": 17,
        "proficiencyBonus": 6,
        "features": [],
        "counters": {
          "arcane_recovery_levels": 9
        }
      },
      {
        "level": 18,
        "proficiencyBonus": 6,
        "features": [
          "Spell Mastery"
        ],
        "counters": {
          "arcane_recovery_levels": 9
        }
      },
      {
        "level": 19,
        "proficiencyBonus": 6,
        "features": [
          "Ability Score Improvement"
        ],
        "abilityScoreImprovement": true,
        "counters": {
          "arcane_recovery_levels": 10
        }
      },
      {
        "level": 20,
        "proficiencyBonus": 6,
        "features": [
          "Signature Spell"
        ],
        "counters": {
          "arcane_recovery_levels": 10
        }
      }
    ],
    "subclassLevel": 2,
    "subclasses": [],
    "starterKit": {
      "weaponIds": [
        "dagger"
      ],
      "armorId": "leather-armor"
    },
    "spellcasting": {
      "ability": "INT",
      "type": "prepared"
    }
  }
];
