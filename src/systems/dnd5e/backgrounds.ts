import type { BackgroundDefinition } from '../../engine/schema';

// The 12 SRD 2014 backgrounds. 2014 structure: fixed skill proficiencies, tool/language grants,
// starting equipment, and a narrative Feature (text only — no combat mechanic). No ability score
// increases and no feats (those are 2024 rules). Skill ids match systems/dnd5e/skills.ts.

export const backgrounds: BackgroundDefinition[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description: 'You have spent your life in service to a temple, learning its rites and doctrines.',
    skillProficiencies: ['insight', 'religion'],
    languages: 2,
    equipment: ['Holy symbol', 'Prayer book or prayer wheel', '5 sticks of incense', 'Vestments', 'Common clothes', '15 gp'],
    feature: {
      name: 'Shelter of the Faithful',
      description: 'You and your companions can expect free healing and care at a temple of your faith, and you can call on priests of your faith for assistance (though you must provide any material components for spells).',
    },
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'You are an experienced criminal with a history of breaking the law and a network of other lawbreakers.',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiencies: ["Thieves' tools", 'One type of gaming set'],
    equipment: ['Crowbar', 'Dark common clothes with a hood', '15 gp'],
    feature: {
      name: 'Criminal Contact',
      description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals, and you know how to get messages to and from your contact even over great distances.',
    },
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    description: 'You thrive in front of an audience, knowing how to entrance, entertain, and inspire them.',
    skillProficiencies: ['acrobatics', 'performance'],
    toolProficiencies: ['Disguise kit', 'One type of musical instrument'],
    equipment: ['A musical instrument', 'The favor of an admirer', 'A costume', '15 gp'],
    feature: {
      name: 'By Popular Demand',
      description: 'You can always find a place to perform, usually in an inn or tavern. In return you receive free lodging and food (modest or comfortable), and your performances make you something of a local figure.',
    },
  },
  {
    id: 'folk-hero',
    name: 'Folk Hero',
    description: 'You come from a humble social rank, but you are destined for much more — the common people see you as their champion.',
    skillProficiencies: ['animal-handling', 'survival'],
    toolProficiencies: ["One type of artisan's tools", 'Land vehicles'],
    equipment: ["A set of artisan's tools", 'A shovel', 'An iron pot', 'Common clothes', '10 gp'],
    feature: {
      name: 'Rustic Hospitality',
      description: 'Since you come from the ranks of the common folk, you fit in among them with ease. Commoners will shelter and hide you from the law or anyone searching for you (though they will not risk their lives for you).',
    },
  },
  {
    id: 'guild-artisan',
    name: 'Guild Artisan',
    description: 'You are a member of an artisan’s guild, skilled in a particular field and closely associated with other artisans.',
    skillProficiencies: ['insight', 'persuasion'],
    toolProficiencies: ["One type of artisan's tools"],
    languages: 1,
    equipment: ["A set of artisan's tools", 'A letter of introduction from your guild', "Traveler's clothes", '15 gp'],
    feature: {
      name: 'Guild Membership',
      description: 'Your guild will provide you lodging and food if necessary and pay for your funeral. Fellow guild members will support you, and you can rely on the guild’s political influence to secure an audience with local officials.',
    },
  },
  {
    id: 'hermit',
    name: 'Hermit',
    description: 'You lived in seclusion for a formative part of your life, seeking spiritual enlightenment or fleeing society.',
    skillProficiencies: ['medicine', 'religion'],
    toolProficiencies: ['Herbalism kit'],
    languages: 1,
    equipment: ['A scroll case stuffed full of notes', 'A winter blanket', 'Common clothes', 'A herbalism kit', '5 gp'],
    feature: {
      name: 'Discovery',
      description: 'Your seclusion gave you access to a unique and powerful discovery — a great truth about the cosmos, a fact long forgotten, or a secret about a powerful person or organization that only you know.',
    },
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'You understand wealth, power, and privilege, carrying a hereditary title and the trappings of nobility.',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['One type of gaming set'],
    languages: 1,
    equipment: ['A set of fine clothes', 'A signet ring', 'A scroll of pedigree', '25 gp'],
    feature: {
      name: 'Position of Privilege',
      description: 'People are inclined to think the best of you. You are welcome in high society, and common folk make every effort to accommodate you. You can secure an audience with a local noble if you need to.',
    },
  },
  {
    id: 'outlander',
    name: 'Outlander',
    description: 'You grew up in the wilds, far from civilization and the comforts of town and technology.',
    skillProficiencies: ['athletics', 'survival'],
    toolProficiencies: ['One type of musical instrument'],
    languages: 1,
    equipment: ['A staff', 'A hunting trap', 'A trophy from an animal you killed', "Traveler's clothes", '10 gp'],
    feature: {
      name: 'Wanderer',
      description: 'You have an excellent memory for maps and geography, and can always recall the general layout of terrain, settlements, and features around you. You can find food and fresh water for yourself and up to five others each day if the land offers it.',
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'You spent years learning the lore of the multiverse, studying manuscripts and debating with other scholars.',
    skillProficiencies: ['arcana', 'history'],
    languages: 2,
    equipment: ['A bottle of black ink', 'A quill', 'A small knife', 'A letter from a dead colleague posing an unanswered question', 'Common clothes', '10 gp'],
    feature: {
      name: 'Researcher',
      description: 'When you attempt to learn or recall a piece of lore, if you do not know it you often know where and from whom you can obtain it — usually a library, scriptorium, university, or a sage or other creature.',
    },
  },
  {
    id: 'sailor',
    name: 'Sailor',
    description: 'You sailed on a seagoing vessel for years, weathering mighty storms and monsters of the deep.',
    skillProficiencies: ['athletics', 'perception'],
    toolProficiencies: ["Navigator's tools", 'Water vehicles'],
    equipment: ['A belaying pin (club)', '50 feet of silk rope', 'A lucky charm', 'Common clothes', '10 gp'],
    feature: {
      name: "Ship's Passage",
      description: 'When you need to, you can secure free passage on a sailing ship for yourself and your companions — you might sail on a ship you served on, or another that you have good relations with (working to pay for the passage).',
    },
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'War has been your life for as long as you care to remember — you trained, saw combat, and rose through the ranks.',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['One type of gaming set', 'Land vehicles'],
    equipment: ['An insignia of rank', 'A trophy taken from a fallen enemy', 'A set of bone dice or deck of cards', 'Common clothes', '10 gp'],
    feature: {
      name: 'Military Rank',
      description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former organization still recognize your authority, defer to you if lower in rank, and you can invoke your rank to exert influence and gain access to military encampments and fortresses.',
    },
  },
  {
    id: 'urchin',
    name: 'Urchin',
    description: 'You grew up on the streets alone, orphaned and poor, with only your wits to keep you alive.',
    skillProficiencies: ['sleight-of-hand', 'stealth'],
    toolProficiencies: ['Disguise kit', "Thieves' tools"],
    equipment: ['A small knife', 'A map of the city you grew up in', 'A pet mouse', 'A token to remember your parents by', 'Common clothes', '10 gp'],
    feature: {
      name: 'City Secrets',
      description: 'You know the secret patterns and flow of cities and can find passages through the urban sprawl. When not in combat, you can lead companions through a city at twice the normal travel pace between two locations you know.',
    },
  },
];
