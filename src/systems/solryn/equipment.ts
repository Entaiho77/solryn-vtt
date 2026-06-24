import type { EquipmentDefinition } from '../../engine/schema';

/**
 * Armor feeds the DR formula (`dr`) and the Speed formula (`speedPenalty`).
 * Weapons reference a weaponSkillId so the gear step can filter them to the player's
 * chosen weapon skills. Representative content, flagged provisional.
 */
export const equipment: EquipmentDefinition = {
  armor: [
    { id: 'padded', name: 'Padded Armor', weight: 'light', dr: 2, speedPenalty: 0, provisional: true },
    { id: 'leather', name: 'Leather Armor', weight: 'light', dr: 2, speedPenalty: 0, provisional: true },
    { id: 'hide', name: 'Hide Armor', weight: 'medium', dr: 4, speedPenalty: 5, provisional: true },
    { id: 'chainmail', name: 'Chainmail', weight: 'medium', dr: 4, speedPenalty: 5, provisional: true },
    { id: 'scale', name: 'Scale Mail', weight: 'heavy', dr: 6, speedPenalty: 10, provisional: true },
    { id: 'plate', name: 'Plate Armor', weight: 'heavy', dr: 6, speedPenalty: 10, provisional: true },
  ],
  weapons: [
    { id: 'longsword', name: 'Longsword', weaponSkillId: 'swords', damageDice: '1d6', provisional: true },
    { id: 'shortsword', name: 'Shortsword', weaponSkillId: 'swords', damageDice: '1d6', provisional: true },
    { id: 'greatsword', name: 'Greatsword', weaponSkillId: 'two-handed', damageDice: '1d10', twoHanded: true, provisional: true },
    { id: 'maul', name: 'Maul', weaponSkillId: 'two-handed', damageDice: '2d6', twoHanded: true, provisional: true },
    { id: 'battleaxe', name: 'Battleaxe', weaponSkillId: 'axes', damageDice: '1d8', provisional: true },
    { id: 'handaxe', name: 'Handaxe', weaponSkillId: 'axes', damageDice: '1d6', provisional: true },
    { id: 'warhammer', name: 'Warhammer', weaponSkillId: 'maces', damageDice: '1d8', provisional: true },
    { id: 'mace', name: 'Mace', weaponSkillId: 'maces', damageDice: '1d6', provisional: true },
    { id: 'dagger', name: 'Dagger', weaponSkillId: 'daggers', damageDice: '1d4', range: '20/60', provisional: true },
    { id: 'spear', name: 'Spear', weaponSkillId: 'spears', damageDice: '1d8', provisional: true },
    { id: 'halberd', name: 'Halberd', weaponSkillId: 'polearms', damageDice: '1d10', twoHanded: true, provisional: true },
    { id: 'shortbow', name: 'Shortbow', weaponSkillId: 'bows', damageDice: '1d6', range: '80/320', provisional: true },
    { id: 'longbow', name: 'Longbow', weaponSkillId: 'bows', damageDice: '1d8', range: '150/600', provisional: true },
    { id: 'light-crossbow', name: 'Light Crossbow', weaponSkillId: 'crossbows', damageDice: '1d8', range: '80/320', provisional: true },
    { id: 'javelin', name: 'Javelin', weaponSkillId: 'thrown', damageDice: '1d6', range: '30/120', provisional: true },
    { id: 'quarterstaff', name: 'Quarterstaff', weaponSkillId: 'staves', damageDice: '1d6', provisional: true },
  ],
  startingKit: [
    { name: "Adventurer's toolset" },
    { name: 'Backpack' },
    { name: 'Rope (50 ft)' },
    { name: 'Rations', quantity: 5 },
    { name: 'Bedroll' },
    { name: 'Lantern' },
    { name: 'Healing potion', quantity: 3 },
  ],
};
