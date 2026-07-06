# Phase 1 — Attack structure carry-through review

- Emitted `attacks[]` on **423** runtime entries (provisional SRD+Eribor).
- Display-vs-structure mismatches: **0**.
- Hand-authored starters not carried through: **10** (flagged below; their attacks live in bestiary-source.json but are not emitted to runtime — decide whether to add them too).

Display = `stats.damage`; structure = emitted `attacks[]`. "match" = display is exactly reconstructable from structure.

## Emitted (423)

| Creature | Display damage | attacks[] | Status |
|---|---|---|---|
| Acid Fly | `Acid Bite 2d4 piercing` | Acid Bite 2d4 Piercing | match |
| Queen Acid Fly | `Acid Spit 4d6 acid / Ravenous Bite 3d8 piercing` | Acid Spit 4d6 Acid; Ravenous Bite 3d8 Piercing | match |
| Vulturis | `Beak 1d10+2 piercing / Talons 2d6 slashing` | Beak 1d10+2 Piercing; Talons 2d6 Slashing | match |
| Vulturis Bone Shaman | `Bone Staff 4d6 bludgeoning / Rotting Beak 1d8+1 piercing` | Bone Staff 4d6 Bludgeoning; Rotting Beak 1d8+1 Piercing | match |
| Vulturis Deathlord | `Beak 3d10 piercing / Talon Swipe 3d8 slashing` | Beak 3d10 Piercing; Talon Swipe 3d8 Slashing | match |
| Drakein Warrior | `Claw 1d8+1 slashing / Drakeblade 2d6 slashing` | Claw 1d8+1 Slashing; Drakeblade 2d6 Slashing | match |
| Drakein Warlord | `Drakefang Greatsword 5d10 slashing` | Drakefang Greatsword 5d10 Slashing | match |
| Drakein Fire Priest | `Drakeflame Staff 5d6+2 bludgeoning` | Drakeflame Staff 5d6+2 Bludgeoning | match |
| Hydra | `Bite 6d10 piercing` | Bite 6d10 Piercing | match |
| Hyena Gnoll | `Bite 2d8 piercing / Spear 2d6 piercing` | Bite 2d8 Piercing; Spear 2d6 Piercing | match |
| Hyena Gnoll Barbarian Warlord | `Strike 4d8+1 bludgeoning (scaled to TR band (source attack unparsed))` | Strike 4d8+1 Bludgeoning | match |
| Hyena Gnoll Shaman | `Bite 2d6 piercing / Quarterstaff 2d6 bludgeoning` | Bite 2d6 Piercing; Quarterstaff 2d6 Bludgeoning | match |
| Abyssal Maw | `Bite 3d12+2 piercing / Tentacle Slam 2d10+3 bludgeoning / Tail Swipe 1d10 bludgeoning` | Bite 3d12+2 Piercing; Tentacle Slam 2d10+3 Bludgeoning; Tail Swipe 1d10 Bludgeoning | match |
| Thorned Spider | `Bite 4d8+1 piercing` | Bite 4d8+1 Piercing | match |
| Shield Spider | `Bite 4d6 piercing` | Bite 4d6 Piercing | match |
| Phase Spider | `Bite 3d10+2 lightning` | Bite 3d10+2 Lightning | match |
| Skull Spider | `Bite 4d8+1 piercing` | Bite 4d8+1 Piercing | match |
| Arachnid Horror | `Bite 4d8+1 piercing` | Bite 4d8+1 Piercing | match |
| Bone Naga | `Bite 5d6 piercing / Tail 2d8+2 bludgeoning` | Bite 5d6 Piercing; Tail 2d8+2 Bludgeoning | match |
| Bloated Zombie | `Slam 2d8 bludgeoning` | Slam 2d8 Bludgeoning | match |
| Swift Zombie | `Claw 1d6 slashing / Bite 2d4 piercing / Slam 1d8 bludgeoning` | Claw 1d6 Slashing; Bite 2d4 Piercing; Slam 1d8 Bludgeoning | match |
| Spectral Knight | `Ethereal Sword 4d8+1 force` | Ethereal Sword 4d8+1 Force | match |
| Spectral Sorcerer | `Spectral Touch 5d6 necrotic / Necrotic Bolt 3d6 necrotic` | Spectral Touch 5d6 Necrotic; Necrotic Bolt 3d6 Necrotic | match |
| Shadow Specter | `Life Drain 3d6 necrotic / Shadow Bolt 2d6+1 necrotic` | Life Drain 3d6 Necrotic; Shadow Bolt 2d6+1 Necrotic | match |
| Ghost | `Withering Touch 4d6 necrotic` | Withering Touch 4d6 Necrotic | match |
| Soul-Bound Lich | `Paralyzing Touch 10d6 cold` | Paralyzing Touch 10d6 Cold | match |
| Aether Wraith | `Spectral Claw 10d6 necrotic` | Spectral Claw 10d6 Necrotic | match |
| Magical Ooze | `Pseudopod 4d8+1 acid` | Pseudopod 4d8+1 Acid | match |
| Brontosaurus | `Stomp 2d8+2 bludgeoning / Tail 2d8 bludgeoning` | Stomp 2d8+2 Bludgeoning; Tail 2d8 Bludgeoning | match |
| Velociraptor | `Bite 1d4 piercing / Claws 1d4 slashing` | Bite 1d4 Piercing; Claws 1d4 Slashing | match |
| Tyrannosaurus Rex | `Bite 3d12 piercing / Tail 2d8+1 bludgeoning` | Bite 3d12 Piercing; Tail 2d8+1 Bludgeoning | match |
| Triceratops | `Gore 2d8+1 piercing / Stomp 2d10 bludgeoning` | Gore 2d8+1 Piercing; Stomp 2d10 Bludgeoning | match |
| Pteranodon | `Beak 1d4 piercing / Talons 1d4 slashing` | Beak 1d4 Piercing; Talons 1d4 Slashing | match |
| Stone Golem | `Slam 6d8 bludgeoning` | Slam 6d8 Bludgeoning | match |
| Iron Golem | `Slam 7d8+2 bludgeoning` | Slam 7d8+2 Bludgeoning | match |
| Clay Golem | `Slam 5d10 bludgeoning` | Slam 5d10 Bludgeoning | match |
| Flesh Golem | `Slam 4d8+1 bludgeoning` | Slam 4d8+1 Bludgeoning | match |
| Glass Golem | `Slam 3d10+2 bludgeoning` | Slam 3d10+2 Bludgeoning | match |
| Wood Golem | `Slam 6d8 bludgeoning` | Slam 6d8 Bludgeoning | match |
| Ice Golem | `Slam 7d8+2 bludgeoning` | Slam 7d8+2 Bludgeoning | match |
| Fire Golem | `Slam 7d8+2 bludgeoning` | Slam 7d8+2 Bludgeoning | match |
| Lightning Golem | `Slam 7d8+2 bludgeoning` | Slam 7d8+2 Bludgeoning | match |
| Crystal Golem | `Slam 6d10 bludgeoning` | Slam 6d10 Bludgeoning | match |
| Shadow Golem | `Slam 4d8+1 bludgeoning / Shadowy Grasp 3d8+1 necrotic` | Slam 4d8+1 Bludgeoning; Shadowy Grasp 3d8+1 Necrotic | match |
| Sand Golem | `Slam 7d8+2 bludgeoning` | Slam 7d8+2 Bludgeoning | match |
| Earth Golem | `Slam 4d10 bludgeoning / Rock Throw 2d10+2 bludgeoning` | Slam 4d10 Bludgeoning; Rock Throw 2d10+2 Bludgeoning | match |
| Insectoids | `Claw Attack 1d6+2 bludgeoning` | Claw Attack 1d6+2 Bludgeoning | match |
| Rock Crab | `Claw Attack 2d8 bludgeoning` | Claw Attack 2d8 Bludgeoning | match |
| Giant Rock Crab | `Claw Attack 4d6 bludgeoning` | Claw Attack 4d6 Bludgeoning | match |
| Giant Praying Mantis | `Scythe Attack 2d8 slashing / Mandibles 1d6 piercing` | Scythe Attack 2d8 Slashing; Mandibles 1d6 Piercing | match |
| Frostbite Mantis | `Claws 2d8+1 slashing / Bite 2d10 piercing` | Claws 2d8+1 Slashing; Bite 2d10 Piercing | match |
| Magma Mantis | `Claws 2d8+1 slashing / Bite 2d10 piercing` | Claws 2d8+1 Slashing; Bite 2d10 Piercing | match |
| Venomous Swarm | `Bites 2d6+2 piercing` | Bites 2d6+2 Piercing | match |
| Burrowing Beetle | `Mandibles 1d10+3 piercing / Acidic Spit 1d8 acid` | Mandibles 1d10+3 Piercing; Acidic Spit 1d8 Acid | match |
| Fire Ant Colossus | `Mandible Crush 5d10 piercing` | Mandible Crush 5d10 Piercing | match |
| Summoned Fire Ants | `Bites 3d4+1 piercing` | Bites 3d4+1 Piercing | match |
| Necrotic Scarab | `Claw Attack 5d6+2 slashing` | Claw Attack 5d6+2 Slashing | match |
| Chimeric Insectoid | `Claw Attack 1d8+2 slashing / Stinger Attack 3d8 piercing` | Claw Attack 1d8+2 Slashing; Stinger Attack 3d8 Piercing | match |
| Lightning Bug Leviathan | `Bite 4d6 piercing / Tail Attack 3d8 bludgeoning` | Bite 4d6 Piercing; Tail Attack 3d8 Bludgeoning | match |
| Hive Mind Queen | `Sting 4d8 piercing / Claws 2d8 slashing` | Sting 4d8 Piercing; Claws 2d8 Slashing | match |
| Royal Swarm | `Bites 2d6 piercing / Venomous Sting 2d6 piercing` | Bites 2d6 Piercing; Venomous Sting 2d6 Piercing | match |
| Swamp Leech | `Bite 2d6+1 piercing / Constrict 1d8 bludgeoning` | Bite 2d6+1 Piercing; Constrict 1d8 Bludgeoning | match |
| Stinging Nettle Hornet | `Sting 2d6+2 piercing / Bite 1d8 piercing` | Sting 2d6+2 Piercing; Bite 1d8 Piercing | match |
| Carrion Beetle | `Rotting Bite 1d8+2 piercing / Claw 2d6 slashing` | Rotting Bite 1d8+2 Piercing; Claw 2d6 Slashing | match |
| Juvenile Carrion Beetles | `Bite 1d6 piercing / Claw 1d4 slashing` | Bite 1d6 Piercing; Claw 1d4 Slashing | match |
| Juvenile Carrion Beetle Swarm | `Bites 2d6+2 piercing` | Bites 2d6+2 Piercing | match |
| Crystal Moth | `Proboscis 3d6+1 piercing / Wing Buffet 2d8 bludgeoning` | Proboscis 3d6+1 Piercing; Wing Buffet 2d8 Bludgeoning | match |
| Sand Scorpion | `Claw 1d6+1 bludgeoning / Sting 3d8+1 piercing` | Claw 1d6+1 Bludgeoning; Sting 3d8+1 Piercing | match |
| Shadow Wasp | `Sting 2d6+2 piercing / Bite 1d8 piercing` | Sting 2d6+2 Piercing; Bite 1d8 Piercing | match |
| Rock Hopper | `Claws 2d8 slashing / Bite 2d6 piercing` | Claws 2d8 Slashing; Bite 2d6 Piercing | match |
| Emberfly | `Bite 2d8 piercing / Firebolt 2d6 fire` | Bite 2d8 Piercing; Firebolt 2d6 Fire | match |
| Acidic Silk Spinner | `Bite 4d6 piercing` | Bite 4d6 Piercing | match |
| Larval Swarm of Acidic Silk Spinners | `Bites 4d6 piercing` | Bites 4d6 Piercing | match |
| Pyrocricket | `Bite 1d8+1 piercing / Fiery Claws 2d6 slashing` | Bite 1d8+1 Piercing; Fiery Claws 2d6 Slashing | match |
| Bloodsucker Mosquito | `Bite 1d4 piercing / Proboscis 3d6 piercing` | Bite 1d4 Piercing; Proboscis 3d6 Piercing | match |
| Frost Beetle | `Mandibles 2d8+1 piercing / Icy Claws 3d6 slashing` | Mandibles 2d8+1 Piercing; Icy Claws 3d6 Slashing | match |
| Bladed Dragonfly | `Bite 2d6 piercing / Wing Slash 2d8 slashing` | Bite 2d6 Piercing; Wing Slash 2d8 Slashing | match |
| Ironclad Beetle | `Mandibles 1d10+2 piercing / Charge 2d8+2 bludgeoning` | Mandibles 1d10+2 Piercing; Charge 2d8+2 Bludgeoning | match |
| Glowing Firefly | `Bite 1d6 piercing / Light Flash 1d6+2 radiant` | Bite 1d6 Piercing; Light Flash 1d6+2 Radiant | match |
| Swarm of Glowing Fireflies | `Bites 3d6 piercing / Light Flash 1d6 radiant` | Bites 3d6 Piercing; Light Flash 1d6 Radiant | match |
| Horned Rhinoceros Beetle | `Horn 2d10 piercing / Mandibles 2d8 slashing` | Horn 2d10 Piercing; Mandibles 2d8 Slashing | match |
| Sonic Cicada | `Bite 1d6+1 piercing / Sonic Screech 2d6+1 thunder` | Bite 1d6+1 Piercing; Sonic Screech 2d6+1 Thunder | match |
| Wasteland Roach | `Bite 2d6 piercing / Claws 2d8 slashing` | Bite 2d6 Piercing; Claws 2d8 Slashing | match |
| Swamp Centipede | `Bite 3d8 piercing / Claws 2d8 slashing` | Bite 3d8 Piercing; Claws 2d8 Slashing | match |
| Void Dragon | `Bite 4d10+2 piercing / Claw 3d6+2 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+2 Slashing; Tail 1d8 Bludgeoning | match |
| Storm Dragon | `Bite 4d10+2 piercing / Claw 3d6+2 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+2 Slashing; Tail 1d8 Bludgeoning | match |
| Crystal Dragon | `Bite 4d10+2 piercing / Claw 3d6+1 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+1 Slashing; Tail 1d8 Bludgeoning | match |
| Sand Dragon | `Bite 4d10+2 piercing / Claw 3d6+2 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+2 Slashing; Tail 1d8 Bludgeoning | match |
| Shadow Dragon | `Bite 4d10+2 piercing / Claw 3d6+1 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+1 Slashing; Tail 1d8 Bludgeoning | match |
| Lava Dragon | `Bite 4d10+2 piercing / Claw 3d6+2 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+2 Slashing; Tail 1d8 Bludgeoning | match |
| Frost Dragon | `Bite 4d10+2 piercing / Claw 3d6+1 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+1 Slashing; Tail 1d8 Bludgeoning | match |
| Ghost Dragon | `Bite 4d10+2 piercing / Claw 3d6+1 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+1 Slashing; Tail 1d8 Bludgeoning | match |
| Forest Dragon | `Bite 4d10+2 piercing / Claw 3d6+1 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+1 Slashing; Tail 1d8 Bludgeoning | match |
| Dream Dragon | `Bite 4d10+2 piercing / Claw 3d6+1 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+1 Slashing; Tail 1d8 Bludgeoning | match |
| Iron Dragon | `Bite 4d10+2 piercing / Claw 3d6+2 slashing / Tail 1d8 bludgeoning` | Bite 4d10+2 Piercing; Claw 3d6+2 Slashing; Tail 1d8 Bludgeoning | match |
| Crystal Dragonfly Dragon | `Bite 4d8+1 piercing / Claw 4d6+1 slashing / Wing Slash 1d10+1 slashing` | Bite 4d8+1 Piercing; Claw 4d6+1 Slashing; Wing Slash 1d10+1 Slashing | match |
| Flutterdrake | `Bite 3d4+1 piercing` | Bite 3d4+1 Piercing | match |
| Aboleth | `Tentacle 8d6 bludgeoning` | Tentacle 8d6 Bludgeoning | match |
| Acolyte | `Club 1d4+2 bludgeoning` | Club 1d4+2 Bludgeoning | match |
| Adult Black Dragon | `Bite 3d10 piercing / Claw 5d6+1 slashing` | Bite 3d10 Piercing; Claw 5d6+1 Slashing | match |
| Adult Blue Dragon | `Bite 3d10 piercing / Claw 5d6+1 slashing` | Bite 3d10 Piercing; Claw 5d6+1 Slashing | match |
| Adult Brass Dragon | `Bite 2d10+2 piercing / Claw 6d6 slashing` | Bite 2d10+2 Piercing; Claw 6d6 Slashing | match |
| Adult Bronze Dragon | `Bite 2d10+2 piercing / Claw 6d6 slashing` | Bite 2d10+2 Piercing; Claw 6d6 Slashing | match |
| Adult Copper Dragon | `Bite 2d10+2 piercing / Claw 6d6 slashing` | Bite 2d10+2 Piercing; Claw 6d6 Slashing | match |
| Adult Gold Dragon | `Bite 3d10 piercing / Claw 7d6 slashing` | Bite 3d10 Piercing; Claw 7d6 Slashing | match |
| Adult Green Dragon | `Bite 3d10 piercing / Claw 5d6 slashing` | Bite 3d10 Piercing; Claw 5d6 Slashing | match |
| Adult Red Dragon | `Bite 3d10+2 piercing / Claw 6d6+1 slashing` | Bite 3d10+2 Piercing; Claw 6d6+1 Slashing | match |
| Adult Silver Dragon | `Bite 2d10+2 piercing / Claw 6d6 slashing` | Bite 2d10+2 Piercing; Claw 6d6 Slashing | match |
| Adult White Dragon | `Bite 3d10 piercing / Claw 5d6+1 slashing` | Bite 3d10 Piercing; Claw 5d6+1 Slashing | match |
| Air Elemental | `Slam 4d8+1 bludgeoning` | Slam 4d8+1 Bludgeoning | match |
| Ancient Black Dragon | `Bite 4d10 piercing / Claw 6d6 slashing` | Bite 4d10 Piercing; Claw 6d6 Slashing | match |
| Ancient Blue Dragon | `Bite 4d10 piercing / Claw 6d6 slashing` | Bite 4d10 Piercing; Claw 6d6 Slashing | match |
| Ancient Brass Dragon | `Bite 3d10 piercing / Claw 7d6 slashing` | Bite 3d10 Piercing; Claw 7d6 Slashing | match |
| Ancient Bronze Dragon | `Bite 3d10 piercing / Claw 7d6 slashing` | Bite 3d10 Piercing; Claw 7d6 Slashing | match |
| Ancient Copper Dragon | `Bite 3d10 piercing / Claw 7d6 slashing` | Bite 3d10 Piercing; Claw 7d6 Slashing | match |
| Ancient Gold Dragon | `Bite 3d10 piercing / Claw 7d6+1 slashing` | Bite 3d10 Piercing; Claw 7d6+1 Slashing | match |
| Ancient Green Dragon | `Bite 3d10 piercing / Claw 7d6 slashing` | Bite 3d10 Piercing; Claw 7d6 Slashing | match |
| Ancient Red Dragon | `Bite 4d10 piercing / Claw 6d6 slashing` | Bite 4d10 Piercing; Claw 6d6 Slashing | match |
| Ancient Silver Dragon | `Bite 3d10 piercing / Claw 7d6+1 slashing` | Bite 3d10 Piercing; Claw 7d6+1 Slashing | match |
| Ancient White Dragon | `Bite 4d10 piercing / Claw 6d6 slashing` | Bite 4d10 Piercing; Claw 6d6 Slashing | match |
| Androsphinx | `Claw 7d10+2 slashing` | Claw 7d10+2 Slashing | match |
| Animated Armor | `Slam 2d6+2 bludgeoning` | Slam 2d6+2 Bludgeoning | match |
| Ankheg | `Bite 2d6+2 slashing` | Bite 2d6+2 Slashing | match |
| Ape | `Fist 1d6+2 bludgeoning` | Fist 1d6+2 Bludgeoning | match |
| Archmage | `Dagger 13d4+1 piercing` | Dagger 13d4+1 Piercing | match |
| Assassin | `Shortsword 8d6 piercing` | Shortsword 8d6 Piercing | match |
| Awakened Shrub | `Rake 1d4+2 slashing` | Rake 1d4+2 Slashing | match |
| Awakened Tree | `Slam 2d6+2 bludgeoning` | Slam 2d6+2 Bludgeoning | match |
| Axe Beak | `Beak 1d8 slashing` | Beak 1d8 Slashing | match |
| Azer | `Warhammer 1d8+4 bludgeoning` | Warhammer 1d8+4 Bludgeoning | match |
| Baboon | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Badger | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Balor | `Longsword 5d8+1 slashing / Whip 5d6 slashing` | Longsword 5d8+1 Slashing; Whip 5d6 Slashing | match |
| Bandit | `Scimitar 1d4 slashing / Light Crossbow 1d4 piercing` | Scimitar 1d4 Slashing; Light Crossbow 1d4 Piercing | match |
| Bandit Captain | `Scimitar 1d6+1 slashing / Dagger 1d4+2 piercing` | Scimitar 1d6+1 Slashing; Dagger 1d4+2 Piercing | match |
| Barbed Devil | `Claw 1d6+1 piercing / Tail 1d6+3 piercing / Hurl Flame 1d6+3 fire` | Claw 1d6+1 Piercing; Tail 1d6+3 Piercing; Hurl Flame 1d6+3 Fire | match |
| Basilisk | `Bite 4d6 piercing` | Bite 4d6 Piercing | match |
| Bat | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Bearded Devil | `Beard 1d8+1 piercing / Glaive 1d10+2 slashing` | Beard 1d8+1 Piercing; Glaive 1d10+2 Slashing | match |
| Behir | `Bite 2d10+2 piercing / Constrict 4d10 bludgeoning` | Bite 2d10+2 Piercing; Constrict 4d10 Bludgeoning | match |
| Berserker | `Greataxe 1d12+2 slashing` | Greataxe 1d12+2 Slashing | match |
| Black Bear | `Bite 1d4 piercing / Claws 1d4 slashing` | Bite 1d4 Piercing; Claws 1d4 Slashing | match |
| Black Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Black Pudding | `Pseudopod 4d6 bludgeoning` | Pseudopod 4d6 Bludgeoning | match |
| Blink Dog | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Blood Hawk | `Beak 1d4+2 piercing` | Beak 1d4+2 Piercing | match |
| Blue Dragon Wyrmling | `Bite 2d10+2 piercing` | Bite 2d10+2 Piercing | match |
| Boar | `Tusk 1d6+2 slashing` | Tusk 1d6+2 Slashing | match |
| Bone Devil | `Claw 1d8+4 slashing / Sting 4d8 piercing` | Claw 1d8+4 Slashing; Sting 4d8 Piercing | match |
| Brass Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Bronze Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Brown Bear | `Bite 1d6 piercing / Claws 1d6+1 slashing` | Bite 1d6 Piercing; Claws 1d6+1 Slashing | match |
| Bugbear | `Morningstar 1d8 piercing / Javelin 1d6 piercing` | Morningstar 1d8 Piercing; Javelin 1d6 Piercing | match |
| Bulette | `Bite 3d12 piercing` | Bite 3d12 Piercing | match |
| Camel | `Bite 1d4+2 bludgeoning` | Bite 1d4+2 Bludgeoning | match |
| Cat | `Claws 1d6+2 slashing` | Claws 1d6+2 Slashing | match |
| Centaur | `Pike 1d4 piercing / Hooves 1d6 bludgeoning / Longbow 1d4 piercing` | Pike 1d4 Piercing; Hooves 1d6 Bludgeoning; Longbow 1d4 Piercing | match |
| Chain Devil | `Chain 8d6 slashing` | Chain 8d6 Slashing | match |
| Chimera | `Bite 1d6+3 piercing / Horns 1d12 bludgeoning / Claws 1d6+3 slashing` | Bite 1d6+3 Piercing; Horns 1d12 Bludgeoning; Claws 1d6+3 Slashing | match |
| Chuul | `Pincer 4d6 bludgeoning` | Pincer 4d6 Bludgeoning | match |
| Cloaker | `Bite 4d6+1 piercing / Tail 3d8 slashing` | Bite 4d6+1 Piercing; Tail 3d8 Slashing | match |
| Cloud Giant | `Morningstar 6d8 piercing` | Morningstar 6d8 Piercing | match |
| Cockatrice | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Commoner | `Club 1d4+2 bludgeoning` | Club 1d4+2 Bludgeoning | match |
| Constrictor Snake | `Bite 1d4 piercing / Constrict 1d4 bludgeoning` | Bite 1d4 Piercing; Constrict 1d4 Bludgeoning | match |
| Copper Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Couatl | `Bite 1d6+3 piercing / Constrict 1d6+3 bludgeoning` | Bite 1d6+3 Piercing; Constrict 1d6+3 Bludgeoning | match |
| Crab | `Claw 1d6+2 bludgeoning` | Claw 1d6+2 Bludgeoning | match |
| Crocodile | `Bite 1d10 piercing` | Bite 1d10 Piercing | match |
| Cult Fanatic | `Dagger 3d4+1 piercing` | Dagger 3d4+1 Piercing | match |
| Cultist | `Scimitar 1d6+2 slashing` | Scimitar 1d6+2 Slashing | match |
| Darkmantle | `Crush 1d6+2 bludgeoning` | Crush 1d6+2 Bludgeoning | match |
| Death Dog | `Bite 2d6+2 piercing` | Bite 2d6+2 Piercing | match |
| Deep Gnome (Svirfneblin) | `War Pick 1d4 piercing / Poisoned Dart 1d4 piercing` | War Pick 1d4 Piercing; Poisoned Dart 1d4 Piercing | match |
| Deer | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Deva | `Mace 8d6 bludgeoning` | Mace 8d6 Bludgeoning | match |
| Dire Wolf | `Bite 2d6+2 piercing` | Bite 2d6+2 Piercing | match |
| Djinni | `Scimitar 10d6 slashing` | Scimitar 10d6 Slashing | match |
| Doppelganger | `Slam 4d6 bludgeoning` | Slam 4d6 Bludgeoning | match |
| Draft Horse | `Hooves 1d4+2 bludgeoning` | Hooves 1d4+2 Bludgeoning | match |
| Dragon Turtle | `Bite 2d12+3 piercing / Claw 1d8+4 slashing / Tail 2d12+3 bludgeoning` | Bite 2d12+3 Piercing; Claw 1d8+4 Slashing; Tail 2d12+3 Bludgeoning | match |
| Dretch | `Bite 1d4 piercing / Claws 1d4 slashing` | Bite 1d4 Piercing; Claws 1d4 Slashing | match |
| Drider | `Bite 1d10+4 piercing / Longbow 2d8+1 piercing` | Bite 1d10+4 Piercing; Longbow 2d8+1 Piercing | match |
| Drow | `Shortsword 1d4 piercing / Hand Crossbow 1d4 piercing` | Shortsword 1d4 Piercing; Hand Crossbow 1d4 Piercing | match |
| Druid | `—` | (none) | match |
| Dryad | `Club 3d4+1 bludgeoning` | Club 3d4+1 Bludgeoning | match |
| Duergar | `War Pick 1d8 piercing / Javelin 1d6 piercing` | War Pick 1d8 Piercing; Javelin 1d6 Piercing | match |
| Dust Mephit | `Claws 1d4+2 slashing` | Claws 1d4+2 Slashing | match |
| Eagle | `Talons 1d4+2 slashing` | Talons 1d4+2 Slashing | match |
| Earth Elemental | `Slam 4d8+1 bludgeoning` | Slam 4d8+1 Bludgeoning | match |
| Efreeti | `Scimitar 5d6 slashing / Hurl Flame 4d6+2 fire` | Scimitar 5d6 Slashing; Hurl Flame 4d6+2 Fire | match |
| Elephant | `Gore 1d8+2 piercing / Stomp 1d10+1 bludgeoning` | Gore 1d8+2 Piercing; Stomp 1d10+1 Bludgeoning | match |
| Elk | `Ram 1d4 bludgeoning / Hooves 1d4 bludgeoning` | Ram 1d4 Bludgeoning; Hooves 1d4 Bludgeoning | match |
| Erinyes | `Longsword 3d8 poison / Longbow 5d8 piercing` | Longsword 3d8 Poison; Longbow 5d8 Piercing | match |
| Ettercap | `Bite 1d8+1 piercing / Claws 1d4+1 slashing` | Bite 1d8+1 Piercing; Claws 1d4+1 Slashing | match |
| Ettin | `Battleaxe 1d8+2 slashing / Morningstar 1d8+2 piercing` | Battleaxe 1d8+2 Slashing; Morningstar 1d8+2 Piercing | match |
| Fire Elemental | `Touch 5d6+2 fire` | Touch 5d6+2 Fire | match |
| Fire Giant | `Greatsword 8d6 slashing` | Greatsword 8d6 Slashing | match |
| Flying Snake | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Flying Sword | `Longsword 1d8 slashing` | Longsword 1d8 Slashing | match |
| Frog | `—` | (none) | match |
| Frost Giant | `Greataxe 4d12+1 slashing` | Greataxe 4d12+1 Slashing | match |
| Gargoyle | `Bite 1d6+1 piercing / Claws 1d6+1 slashing` | Bite 1d6+1 Piercing; Claws 1d6+1 Slashing | match |
| Gelatinous Cube | `Pseudopod 2d6+2 acid` | Pseudopod 2d6+2 Acid | match |
| Ghast | `Bite 1d8 piercing / Claws 1d6 slashing` | Bite 1d8 Piercing; Claws 1d6 Slashing | match |
| Ghoul | `Bite 1d6+1 piercing / Claws 1d4+1 slashing` | Bite 1d6+1 Piercing; Claws 1d4+1 Slashing | match |
| Giant Ape | `Fist 3d10+2 bludgeoning` | Fist 3d10+2 Bludgeoning | match |
| Giant Badger | `Bite 1d4 piercing / Claws 1d4 slashing` | Bite 1d4 Piercing; Claws 1d4 Slashing | match |
| Giant Bat | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Giant Boar | `Tusk 2d6+2 slashing` | Tusk 2d6+2 Slashing | match |
| Giant Centipede | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Giant Constrictor Snake | `Bite 1d6 piercing / Constrict 1d8 bludgeoning` | Bite 1d6 Piercing; Constrict 1d8 Bludgeoning | match |
| Giant Crab | `Claw 1d6+2 bludgeoning` | Claw 1d6+2 Bludgeoning | match |
| Giant Crocodile | `Bite 2d10+1 piercing / Tail 1d8+4 bludgeoning` | Bite 2d10+1 Piercing; Tail 1d8+4 Bludgeoning | match |
| Giant Eagle | `Beak 1d6 piercing / Talons 1d6+2 slashing` | Beak 1d6 Piercing; Talons 1d6+2 Slashing | match |
| Giant Elk | `Ram 1d4 bludgeoning / Hooves 1d8+1 bludgeoning` | Ram 1d4 Bludgeoning; Hooves 1d8+1 Bludgeoning | match |
| Giant Fire Beetle | `Bite 1d6+2 slashing` | Bite 1d6+2 Slashing | match |
| Giant Frog | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Giant Goat | `Ram 1d4+2 bludgeoning` | Ram 1d4+2 Bludgeoning | match |
| Giant Hyena | `Bite 2d6+2 piercing` | Bite 2d6+2 Piercing | match |
| Giant Lizard | `Bite 1d8 piercing` | Bite 1d8 Piercing | match |
| Giant Octopus | `Tentacles 2d6+2 bludgeoning` | Tentacles 2d6+2 Bludgeoning | match |
| Giant Owl | `Talons 1d6+2 slashing` | Talons 1d6+2 Slashing | match |
| Giant Poisonous Snake | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Giant Rat | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Giant Rat (Diseased) | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Giant Scorpion | `Claw 1d8+4 bludgeoning / Sting 1d8 piercing` | Claw 1d8+4 Bludgeoning; Sting 1d8 Piercing | match |
| Giant Sea Horse | `Ram 1d6+2 bludgeoning` | Ram 1d6+2 Bludgeoning | match |
| Giant Shark | `Bite 3d10+2 piercing` | Bite 3d10+2 Piercing | match |
| Giant Spider | `Bite 1d8+4 piercing` | Bite 1d8+4 Piercing | match |
| Giant Toad | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Giant Vulture | `Beak 1d4+1 piercing / Talons 1d6+1 slashing` | Beak 1d4+1 Piercing; Talons 1d6+1 Slashing | match |
| Giant Wasp | `Sting 1d6+2 piercing` | Sting 1d6+2 Piercing | match |
| Giant Weasel | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Giant Wolf Spider | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Gibbering Mouther | `Bites 2d6+2 piercing` | Bites 2d6+2 Piercing | match |
| Glabrezu | `Pincer 3d10+2 bludgeoning / Fist 3d4+1 bludgeoning` | Pincer 3d10+2 Bludgeoning; Fist 3d4+1 Bludgeoning | match |
| Gladiator | `Shield Bash 8d4 bludgeoning` | Shield Bash 8d4 Bludgeoning | match |
| Gnoll | `Bite 1d4 piercing / Longbow 1d4 piercing` | Bite 1d4 Piercing; Longbow 1d4 Piercing | match |
| Goat | `Ram 1d4+2 bludgeoning` | Ram 1d4+2 Bludgeoning | match |
| Goblin | `Scimitar 1d4 slashing / Shortbow 1d4 piercing` | Scimitar 1d4 Slashing; Shortbow 1d4 Piercing | match |
| Goblin Warrior | `Short Sword 1d6+1 slashing / Shortbow 1d6 piercing (Range 80/320)` | Short Sword 1d6+1 Slashing; Shortbow 1d6 Piercing | match |
| Gold Dragon Wyrmling | `Bite 2d10+2 piercing` | Bite 2d10+2 Piercing | match |
| Gorgon | `Gore 2d12 piercing / Hooves 2d10 bludgeoning` | Gore 2d12 Piercing; Hooves 2d10 Bludgeoning | match |
| Gray Ooze | `Pseudopod 1d6+2 bludgeoning` | Pseudopod 1d6+2 Bludgeoning | match |
| Green Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Green Hag | `Claws 3d8 slashing` | Claws 3d8 Slashing | match |
| Grick | `Tentacles 1d6+3 slashing / Beak 1d6 piercing` | Tentacles 1d6+3 Slashing; Beak 1d6 Piercing | match |
| Griffon | `Beak 1d6 piercing / Claws 1d6+1 slashing` | Beak 1d6 Piercing; Claws 1d6+1 Slashing | match |
| Grimlock | `Spiked Bone Club 1d4+2 bludgeoning` | Spiked Bone Club 1d4+2 Bludgeoning | match |
| Guard | `—` | (none) | match |
| Guardian Naga | `Bite 6d8 piercing` | Bite 6d8 Piercing | match |
| Gynosphinx | `Claw 7d8+2 slashing` | Claw 7d8+2 Slashing | match |
| Half-Red Dragon Veteran | `Shortsword 5d6+2 piercing` | Shortsword 5d6+2 Piercing | match |
| Harpy | `Claws 1d4+2 slashing / Club 1d4+1 bludgeoning` | Claws 1d4+2 Slashing; Club 1d4+1 Bludgeoning | match |
| Hawk | `Talons 1d6+2 slashing` | Talons 1d6+2 Slashing | match |
| Hell Hound | `Bite 3d8 piercing` | Bite 3d8 Piercing | match |
| Hezrou | `Bite 2d10 piercing / Claws 5d6 slashing` | Bite 2d10 Piercing; Claws 5d6 Slashing | match |
| Hill Giant | `Greatclub 4d8+1 bludgeoning` | Greatclub 4d8+1 Bludgeoning | match |
| Hippogriff | `Beak 1d6 piercing / Claws 1d6+1 slashing` | Beak 1d6 Piercing; Claws 1d6+1 Slashing | match |
| Hobgoblin | `Longbow 1d8 piercing` | Longbow 1d8 Piercing | match |
| Homunculus | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Horned Devil | `Fork 3d8 piercing / Tail 1d8+4 piercing / Hurl Flame 3d6+1 fire` | Fork 3d8 Piercing; Tail 1d8+4 Piercing; Hurl Flame 3d6+1 Fire | match |
| Hunter Shark | `Bite 1d8+4 piercing` | Bite 1d8+4 Piercing | match |
| Hyena | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Ice Devil | `Bite 3d6+1 piercing / Claws 1d10+4 slashing / Tail 3d6+1 bludgeoning` | Bite 3d6+1 Piercing; Claws 1d10+4 Slashing; Tail 3d6+1 Bludgeoning | match |
| Ice Mephit | `Claws 1d4+2 slashing` | Claws 1d4+2 Slashing | match |
| Imp | `Sting (Bite in Beast Form) 3d4+1 piercing` | Sting (Bite in Beast Form) 3d4+1 Piercing | match |
| Invisible Stalker | `Slam 5d6+2 bludgeoning` | Slam 5d6+2 Bludgeoning | match |
| Jackal | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Killer Whale | `Bite 4d6 piercing` | Bite 4d6 Piercing | match |
| Knight | `Greatsword 4d6 slashing` | Greatsword 4d6 Slashing | match |
| Kobold | `Dagger 1d4 piercing / Sling 1d4 bludgeoning` | Dagger 1d4 Piercing; Sling 1d4 Bludgeoning | match |
| Kraken | `Bite 5d8 piercing / Tentacle 5d6+1 bludgeoning` | Bite 5d8 Piercing; Tentacle 5d6+1 Bludgeoning | match |
| Lamia | `Claws 2d10 slashing / Dagger 1d4+1 piercing` | Claws 2d10 Slashing; Dagger 1d4+1 Piercing | match |
| Lemure | `Fist 1d4+2 bludgeoning` | Fist 1d4+2 Bludgeoning | match |
| Lich | `Paralyzing Touch 12d6 cold` | Paralyzing Touch 12d6 Cold | match |
| Lion | `Bite 1d8 piercing / Claw 1d6 slashing` | Bite 1d8 Piercing; Claw 1d6 Slashing | match |
| Lizard | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Lizardfolk | `Bite 1d4 piercing / Heavy Club 1d4 bludgeoning / Javelin 1d4 piercing / Spiked Shield 1d4 piercing` | Bite 1d4 Piercing; Heavy Club 1d4 Bludgeoning; Javelin 1d4 Piercing; Spiked Shield 1d4 Piercing | match |
| Mage | `Dagger 8d4 piercing` | Dagger 8d4 Piercing | match |
| Magma Mephit | `Claws 1d4+2 slashing` | Claws 1d4+2 Slashing | match |
| Magmin | `Touch 1d6+2 fire` | Touch 1d6+2 Fire | match |
| Mammoth | `Gore 1d8+4 piercing / Stomp 2d10 bludgeoning` | Gore 1d8+4 Piercing; Stomp 2d10 Bludgeoning | match |
| Manticore | `Bite 1d8 piercing / Claw 1d6 slashing / Tail Spike 1d8 piercing` | Bite 1d8 Piercing; Claw 1d6 Slashing; Tail Spike 1d8 Piercing | match |
| Marilith | `Longsword 6d8+1 slashing / Tail 1d10 bludgeoning` | Longsword 6d8+1 Slashing; Tail 1d10 Bludgeoning | match |
| Mastiff | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Medusa | `Snake Hair 1d10+4 piercing / Shortsword 1d4 piercing / Longbow 1d8+4 piercing` | Snake Hair 1d10+4 Piercing; Shortsword 1d4 Piercing; Longbow 1d8+4 Piercing | match |
| Merfolk | `—` | (none) | match |
| Merrow | `Bite 1d4 piercing / Claws 1d4 slashing / Harpoon 1d6 piercing` | Bite 1d4 Piercing; Claws 1d4 Slashing; Harpoon 1d6 Piercing | match |
| Mimic | `Pseudopod 1d6 bludgeoning / Bite 1d8+1 piercing` | Pseudopod 1d6 Bludgeoning; Bite 1d8+1 Piercing | match |
| Minotaur | `Greataxe 1d12+1 slashing / Gore 1d8+1 piercing` | Greataxe 1d12+1 Slashing; Gore 1d8+1 Piercing | match |
| Minotaur Skeleton | `Greataxe 1d8 slashing / Gore 1d6 piercing` | Greataxe 1d8 Slashing; Gore 1d6 Piercing | match |
| Mule | `Hooves 1d4+2 bludgeoning` | Hooves 1d4+2 Bludgeoning | match |
| Mummy | `Rotting Fist 4d6 bludgeoning` | Rotting Fist 4d6 Bludgeoning | match |
| Mummy Lord | `Rotting Fist 10d6 bludgeoning` | Rotting Fist 10d6 Bludgeoning | match |
| Nalfeshnee | `Bite 3d10+1 piercing / Claw 5d6 slashing` | Bite 3d10+1 Piercing; Claw 5d6 Slashing | match |
| Night Hag | `Claws (Hag Form Only) 4d8+1 slashing` | Claws (Hag Form Only) 4d8+1 Slashing | match |
| Nightmare | `Hooves 3d8 bludgeoning` | Hooves 3d8 Bludgeoning | match |
| Noble | `Rapier 1d8 piercing` | Rapier 1d8 Piercing | match |
| Ochre Jelly | `Pseudopod 2d6+2 bludgeoning` | Pseudopod 2d6+2 Bludgeoning | match |
| Octopus | `Tentacles 1d6+2 bludgeoning` | Tentacles 1d6+2 Bludgeoning | match |
| Ogre | `Greatclub 1d8 bludgeoning / Javelin 1d6 piercing` | Greatclub 1d8 Bludgeoning; Javelin 1d6 Piercing | match |
| Ogre Zombie | `Morningstar 1d8+4 bludgeoning` | Morningstar 1d8+4 Bludgeoning | match |
| Oni | `Claw (Oni Form Only) 1d8+4 slashing / Glaive 2d10+1 slashing` | Claw (Oni Form Only) 1d8+4 Slashing; Glaive 2d10+1 Slashing | match |
| Orc | `Greataxe 1d4 slashing / Javelin 1d4 piercing` | Greataxe 1d4 Slashing; Javelin 1d4 Piercing | match |
| Otyugh | `Bite 1d8+2 piercing / Tentacle 3d8 bludgeoning` | Bite 1d8+2 Piercing; Tentacle 3d8 Bludgeoning | match |
| Owl | `Talons 1d6+2 slashing` | Talons 1d6+2 Slashing | match |
| Owlbear | `Beak 1d10 piercing / Claws 1d8+4 slashing` | Beak 1d10 Piercing; Claws 1d8+4 Slashing | match |
| Panther | `Bite 1d4 piercing / Claw 1d4 slashing` | Bite 1d4 Piercing; Claw 1d4 Slashing | match |
| Pegasus | `Hooves 2d6+2 bludgeoning` | Hooves 2d6+2 Bludgeoning | match |
| Pit Fiend | `Bite 3d6+1 piercing / Claw 1d8+4 slashing / Mace 2d6+1 bludgeoning / Tail 2d10+2 bludgeoning` | Bite 3d6+1 Piercing; Claw 1d8+4 Slashing; Mace 2d6+1 Bludgeoning; Tail 2d10+2 Bludgeoning | match |
| Planetar | `Greatsword 10d6 slashing` | Greatsword 10d6 Slashing | match |
| Plesiosaurus | `Bite 2d6+2 piercing` | Bite 2d6+2 Piercing | match |
| Poisonous Snake | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Polar Bear | `Bite 1d6 piercing / Claws 1d6+1 slashing` | Bite 1d6 Piercing; Claws 1d6+1 Slashing | match |
| Pony | `Hooves 1d4+2 bludgeoning` | Hooves 1d4+2 Bludgeoning | match |
| Priest | `Mace 2d6+2 bludgeoning` | Mace 2d6+2 Bludgeoning | match |
| Pseudodragon | `Bite 1d4 piercing / Sting 1d4 piercing` | Bite 1d4 Piercing; Sting 1d4 Piercing | match |
| Purple Worm | `Bite 4d8 piercing / Tail Stinger 4d6+2 piercing` | Bite 4d8 Piercing; Tail Stinger 4d6+2 Piercing | match |
| Quasit | `Claw (Bite in Beast Form) 3d4+1 piercing` | Claw (Bite in Beast Form) 3d4+1 Piercing | match |
| Quipper | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Rakshasa | `Claw 10d6 slashing` | Claw 10d6 Slashing | match |
| Rat | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Raven | `Beak 1d6+2 piercing` | Beak 1d6+2 Piercing | match |
| Red Dragon Wyrmling | `Bite 2d10+2 piercing` | Bite 2d10+2 Piercing | match |
| Reef Shark | `Bite 1d8 piercing` | Bite 1d8 Piercing | match |
| Remorhaz | `Bite 6d10 piercing` | Bite 6d10 Piercing | match |
| Rhinoceros | `Gore 1d8+4 bludgeoning` | Gore 1d8+4 Bludgeoning | match |
| Riding Horse | `Hooves 1d4+2 bludgeoning` | Hooves 1d4+2 Bludgeoning | match |
| Roc | `Beak 4d8 piercing / Talons 4d6+1 slashing` | Beak 4d8 Piercing; Talons 4d6+1 Slashing | match |
| Roper | `Bite 4d8+1 piercing` | Bite 4d8+1 Piercing | match |
| Rug of Smothering | `—` | (none) | match |
| Rust Monster | `Bite 1d8 piercing` | Bite 1d8 Piercing | match |
| Saber-Toothed Tiger | `Bite 1d6 piercing / Claw 1d6+1 slashing` | Bite 1d6 Piercing; Claw 1d6+1 Slashing | match |
| Sahuagin | `Bite 1d4 piercing / Claws 1d4 slashing` | Bite 1d4 Piercing; Claws 1d4 Slashing | match |
| Salamander | `Spear 1d6 fire / Tail 5d6 bludgeoning` | Spear 1d6 Fire; Tail 5d6 Bludgeoning | match |
| Satyr | `Ram 1d4 bludgeoning / Shortsword 1d4 piercing / Shortbow 1d4 piercing` | Ram 1d4 Bludgeoning; Shortsword 1d4 Piercing; Shortbow 1d4 Piercing | match |
| Scorpion | `Sting 1d6+2 piercing` | Sting 1d6+2 Piercing | match |
| Scout | `Shortsword 1d4 piercing / Longbow 1d4 piercing` | Shortsword 1d4 Piercing; Longbow 1d4 Piercing | match |
| Sea Hag | `Claws 2d6+2 slashing` | Claws 2d6+2 Slashing | match |
| Sea Horse | `—` | (none) | match |
| Shadow | `Strength Drain 1d6+2 necrotic` | Strength Drain 1d6+2 Necrotic | match |
| Shambling Mound | `Slam 4d8+1 bludgeoning` | Slam 4d8+1 Bludgeoning | match |
| Shield Guardian | `Fist 5d6+2 bludgeoning` | Fist 5d6+2 Bludgeoning | match |
| Shrieker | `—` | (none) | match |
| Silver Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Skeleton | `Shortsword 1d4 piercing / Shortbow 1d4 piercing` | Shortsword 1d4 Piercing; Shortbow 1d4 Piercing | match |
| Solar | `Greatsword 12d6 slashing` | Greatsword 12d6 Slashing | match |
| Specter | `Life Drain 2d6+2 necrotic` | Life Drain 2d6+2 Necrotic | match |
| Spider | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Spirit Naga | `Bite 8d6 piercing` | Bite 8d6 Piercing | match |
| Sprite | `Longsword 1d4 slashing / Shortbow 1d4 piercing` | Longsword 1d4 Slashing; Shortbow 1d4 Piercing | match |
| Spy | `Shortsword 2d6+2 piercing` | Shortsword 2d6+2 Piercing | match |
| Steam Mephit | `Claws 1d4+2 slashing` | Claws 1d4+2 Slashing | match |
| Stirge | `Blood Drain 1d4+2 piercing` | Blood Drain 1d4+2 Piercing | match |
| Stone Giant | `Greatclub 4d8+1 bludgeoning` | Greatclub 4d8+1 Bludgeoning | match |
| Storm Giant | `Greatsword 10d6 slashing` | Greatsword 10d6 Slashing | match |
| Succubus/Incubus | `Claw (Fiend Form Only) 4d6 slashing` | Claw (Fiend Form Only) 4d6 Slashing | match |
| Swarm of Bats | `Bites 1d4+2 piercing` | Bites 1d4+2 Piercing | match |
| Swarm of Beetles | `Bites 1d4+2 piercing` | Bites 1d4+2 Piercing | match |
| Swarm of Centipedes | `Bites 1d4+2 piercing` | Bites 1d4+2 Piercing | match |
| Swarm of Insects | `Bites 1d4+2 piercing` | Bites 1d4+2 Piercing | match |
| Swarm of Poisonous Snakes | `Bites 2d6+2 piercing` | Bites 2d6+2 Piercing | match |
| Swarm of Quippers | `Bites 2d6+2 piercing` | Bites 2d6+2 Piercing | match |
| Swarm of Rats | `Bites 1d6+2 piercing` | Bites 1d6+2 Piercing | match |
| Swarm of Ravens | `Beaks 1d6+2 piercing` | Beaks 1d6+2 Piercing | match |
| Swarm of Spiders | `Bites 1d4+2 piercing` | Bites 1d4+2 Piercing | match |
| Swarm of Wasps | `Bites 1d4+2 piercing` | Bites 1d4+2 Piercing | match |
| Tarrasque | `Bite 2d12 piercing / Claw 1d8+4 slashing / Horns 2d10 piercing / Tail 2d6+1 bludgeoning` | Bite 2d12 Piercing; Claw 1d8+4 Slashing; Horns 2d10 Piercing; Tail 2d6+1 Bludgeoning | match |
| Thug | `Mace 1d6+2 bludgeoning` | Mace 1d6+2 Bludgeoning | match |
| Tiger | `Bite 1d8 piercing / Claw 1d6 slashing` | Bite 1d8 Piercing; Claw 1d6 Slashing | match |
| Treant | `Slam 8d6 bludgeoning` | Slam 8d6 Bludgeoning | match |
| Tribal Warrior | `—` | (none) | match |
| Troll | `Bite 1d6+1 piercing / Claw 4d6 slashing` | Bite 1d6+1 Piercing; Claw 4d6 Slashing | match |
| Unicorn | `Hooves 1d12+4 bludgeoning / Horn 1d8+4 piercing` | Hooves 1d12+4 Bludgeoning; Horn 1d8+4 Piercing | match |
| Vampire Spawn | `Bite 3d6+1 piercing / Claws 1d6+4 slashing` | Bite 3d6+1 Piercing; Claws 1d6+4 Slashing | match |
| Vampire, Bat Form | `Bite 10d6 piercing` | Bite 10d6 Piercing | match |
| Vampire, Mist Form | `—` | (none) | match |
| Vampire, Vampire Form | `Unarmed Strike 2d8+2 bludgeoning / Bite 7d6 piercing` | Unarmed Strike 2d8+2 Bludgeoning; Bite 7d6 Piercing | match |
| Veteran | `Shortsword 4d6 piercing` | Shortsword 4d6 Piercing | match |
| Violet Fungus | `Rotting Touch 1d8 necrotic` | Rotting Touch 1d8 Necrotic | match |
| Vrock | `Beak 2d6+1 piercing / Talons 2d10 slashing` | Beak 2d6+1 Piercing; Talons 2d10 Slashing | match |
| Vulture | `Beak 1d4+2 piercing` | Beak 1d4+2 Piercing | match |
| Warhorse | `Hooves 1d6+2 bludgeoning` | Hooves 1d6+2 Bludgeoning | match |
| Warhorse Skeleton | `Hooves 1d6+2 bludgeoning` | Hooves 1d6+2 Bludgeoning | match |
| Water Elemental | `Slam 4d8+1 bludgeoning` | Slam 4d8+1 Bludgeoning | match |
| Weasel | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Werebear, Bear Form | `Claw 4d8+1 slashing` | Claw 4d8+1 Slashing | match |
| Werebear, Human Form | `Greataxe 3d12 slashing` | Greataxe 3d12 Slashing | match |
| Werebear, Hybrid Form | `Bite 1d10+2 piercing / Claw 1d8+2 slashing / Greataxe 1d10 slashing` | Bite 1d10+2 Piercing; Claw 1d8+2 Slashing; Greataxe 1d10 Slashing | match |
| Wereboar, Boar Form | `Tusks 4d6 slashing` | Tusks 4d6 Slashing | match |
| Wereboar, Human Form | `Maul 4d6 bludgeoning` | Maul 4d6 Bludgeoning | match |
| Wereboar, Hybrid Form | `Maul 1d6+3 bludgeoning / Tusks 1d6+3 slashing` | Maul 1d6+3 Bludgeoning; Tusks 1d6+3 Slashing | match |
| Wererat, Human Form | `Shortsword 1d6+1 piercing / Hand Crossbow 1d6+1 piercing` | Shortsword 1d6+1 Piercing; Hand Crossbow 1d6+1 Piercing | match |
| Wererat, Hybrid Form | `Bite 1d4 piercing / Shortsword 1d6 piercing / Hand Crossbow 1d6 piercing` | Bite 1d4 Piercing; Shortsword 1d6 Piercing; Hand Crossbow 1d6 Piercing | match |
| Wererat, Rat Form | `Bite 3d4+1 piercing` | Bite 3d4+1 Piercing | match |
| Weretiger, Human Form | `Scimitar 1d6+3 slashing / Longbow 1d8+2 piercing` | Scimitar 1d6+3 Slashing; Longbow 1d8+2 Piercing | match |
| Weretiger, Hybrid Form | `Bite 1d6 piercing / Claw 1d6 slashing / Scimitar 1d4 slashing / Longbow 1d4 piercing` | Bite 1d6 Piercing; Claw 1d6 Slashing; Scimitar 1d4 Slashing; Longbow 1d4 Piercing | match |
| Weretiger, Tiger Form | `Bite 1d10+1 piercing / Claw 1d8+2 slashing` | Bite 1d10+1 Piercing; Claw 1d8+2 Slashing | match |
| Werewolf, Human Form | `—` | (none) | match |
| Werewolf, Hybrid Form | `Bite 1d8+2 piercing / Claws 1d6+4 slashing` | Bite 1d8+2 Piercing; Claws 1d6+4 Slashing | match |
| Werewolf, Wolf Form | `Bite 3d8 piercing` | Bite 3d8 Piercing | match |
| White Dragon Wyrmling | `Bite 2d10 piercing` | Bite 2d10 Piercing | match |
| Wight | `Life Drain 1d6+3 necrotic / Longbow 1d8+4 piercing` | Life Drain 1d6+3 Necrotic; Longbow 1d8+4 Piercing | match |
| Will-o'-Wisp | `Shock 1d8+4 lightning` | Shock 1d8+4 Lightning | match |
| Winter Wolf | `Bite 4d6 piercing` | Bite 4d6 Piercing | match |
| Wolf | `Bite 1d4+2 piercing` | Bite 1d4+2 Piercing | match |
| Worg | `Bite 1d6+2 piercing` | Bite 1d6+2 Piercing | match |
| Wraith | `Life Drain 4d8+1 necrotic` | Life Drain 4d8+1 Necrotic | match |
| Wyvern | `Bite 1d6+3 piercing / Claws 1d8+4 slashing / Stinger 1d6+3 piercing` | Bite 1d6+3 Piercing; Claws 1d8+4 Slashing; Stinger 1d6+3 Piercing | match |
| Xorn | `Bite 2d6+1 piercing / Claw 3d6+1 slashing` | Bite 2d6+1 Piercing; Claw 3d6+1 Slashing | match |
| Young Black Dragon | `Bite 2d10 piercing / Claw 1d12+4 slashing` | Bite 2d10 Piercing; Claw 1d12+4 Slashing | match |
| Young Blue Dragon | `Bite 2d10+2 piercing / Claw 4d6 slashing` | Bite 2d10+2 Piercing; Claw 4d6 Slashing | match |
| Young Brass Dragon | `Bite 1d10+2 piercing / Claw 3d6+1 slashing` | Bite 1d10+2 Piercing; Claw 3d6+1 Slashing | match |
| Young Bronze Dragon | `Bite 2d10 piercing / Claw 5d6 slashing` | Bite 2d10 Piercing; Claw 5d6 Slashing | match |
| Young Copper Dragon | `Bite 1d10+2 piercing / Claw 3d6+1 slashing` | Bite 1d10+2 Piercing; Claw 3d6+1 Slashing | match |
| Young Gold Dragon | `Bite 2d10 piercing / Claw 5d6 slashing` | Bite 2d10 Piercing; Claw 5d6 Slashing | match |
| Young Green Dragon | `Bite 2d10+2 piercing / Claw 4d6 slashing` | Bite 2d10+2 Piercing; Claw 4d6 Slashing | match |
| Young Red Dragon | `Bite 2d10+1 piercing / Claw 4d6+1 slashing` | Bite 2d10+1 Piercing; Claw 4d6+1 Slashing | match |
| Young Silver Dragon | `Bite 2d10 piercing / Claw 5d6 slashing` | Bite 2d10 Piercing; Claw 5d6 Slashing | match |
| Young White Dragon | `Bite 2d10 piercing / Claw 1d12+4 slashing` | Bite 2d10 Piercing; Claw 1d12+4 Slashing | match |
| Zombie | `Slam 1d6+2 bludgeoning` | Slam 1d6+2 Bludgeoning | match |

## Starters — display-only, not emitted (10)

| Creature | source attacks[] | Status |
|---|---|---|
| Mossback Hare | (none) | display-only in runtime |
| Duskwatcher Owlcat | Claw/bite 1d6+3 Slashing | display-only in runtime |
| Bramble Boar | Gore 1d6+4 Piercing | display-only in runtime |
| Crag Hound | Bite 1d6+3 Piercing | display-only in runtime |
| Knockerkin | Pick jab 1d4+2 Piercing | display-only in runtime |
| Lantern Wraith | Lantern touch 1d6 Arcane | display-only in runtime |
| Hollow Man | Slam 1d6+1 Slashing | display-only in runtime |
| Whippoorwail | Peck 1d4+2 Piercing | display-only in runtime |
| Hollowkin | Mind lash 1d8 Psychic | display-only in runtime |
| T'rellin Shaman | Staff strike 1d6 Bludgeoning | display-only in runtime |
