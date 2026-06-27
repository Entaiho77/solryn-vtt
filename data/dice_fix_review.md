# Dice Notation Fix — Review

**79 attacks fixed across 70 creatures.** Bug: low-damage attacks were written as multiple dice with no modifier (e.g. `2d4`) instead of the file convention of a single die + flat modifier (e.g. `1d4+2`). Fix is notation-only — each attack's average is preserved (shifts ≤0.5) and every affected creature's total damage-per-round still lands inside its TR band (verified). HP, DR, Soul Core, abilities, etc. were not touched.

**Independent re-scan:** the originally-supplied list enumerated 46 creatures; all were fixed. The re-scan (any attack with dice count ≥2, die ≤8, no modifier, average ≤12) found **24 additional creatures** beyond that list — mostly the predicted edge cases (`3d4`, `4d4`, `3d6` rather than only `2dX`, plus single-die secondary attacks on larger creatures):

> Azer, Bone Devil, Dragon Turtle, Drider, Giant Crocodile, Giant Scorpion, Giant Spider, Horned Devil, Hunter Shark, Ice Devil, Mammoth, Medusa, Ogre Zombie, Oni, Owlbear, Pit Fiend, Rhinoceros, Tarrasque, Unicorn, Vampire Spawn, Werewolf, Hybrid Form, Will-o'-Wisp, Young Black Dragon, Young White Dragon

High-damage multi-die attacks (e.g. `8d6`, `4d6`, dragon `3d10`) were left as-is — their average can't be represented as a single die + light modifier, matching the existing convention for big hits.


---


### Acolyte
- **Club** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Awakened Shrub
- **Rake** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4-1` · avg 5.0→4.5 (TR1)

### Azer  *(found by re-scan — not in original list)*
- **Warhammer** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+3` · avg 9.0→8.5 (TR2)

### Baboon
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4-1` · avg 5.0→4.5 (TR1)

### Bandit Captain
- **Dagger** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+3` · avg 5.0→4.5 (TR2)

### Barbed Devil
- **Tail** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+3` · avg 7.0→6.5 (TR4)
- **Hurl Flame** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `3d6` · avg 7.0→6.5 (TR4)

### Blood Hawk
- **Beak** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Bone Devil  *(found by re-scan — not in original list)*
- **Claw** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+4` · avg 9.0→8.5 (TR5)

### Camel
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Chimera
- **Bite** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+4` · avg 7.0→6.5 (TR4)
- **Claws** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+4` · avg 7.0→6.5 (TR4)

### Cockatrice
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+1` · avg 5.0→4.5 (TR1)

### Commoner
- **Club** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Couatl
- **Bite** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `1d6+5` · avg 7.0→6.5 (TR3)
- **Constrict** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+3` · avg 7.0→6.5 (TR3)

### Deer
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Draft Horse
- **Hooves** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4+4` · avg 5.0→4.5 (TR1)

### Dragon Turtle  *(found by re-scan — not in original list)*
- **Claw** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+7` · avg 9.0→8.5 (TR7)

### Drider  *(found by re-scan — not in original list)*
- **Bite** — Before: `4d4` · After: `1d10+4` · 5e source confirmed: `1d4` · avg 10.0→9.5 (TR4)

### Dust Mephit
- **Claws** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Eagle
- **Talons** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Giant Centipede
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Giant Crocodile  *(found by re-scan — not in original list)*
- **Tail** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+5` · avg 9.0→8.5 (TR4)

### Giant Goat
- **Ram** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4+3` · avg 5.0→4.5 (TR1)

### Giant Poisonous Snake
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+4` · avg 5.0→4.5 (TR1)

### Giant Rat
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Giant Rat (Diseased)
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Giant Scorpion  *(found by re-scan — not in original list)*
- **Claw** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+2` · avg 9.0→8.5 (TR3)

### Giant Spider  *(found by re-scan — not in original list)*
- **Bite** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+3` · avg 9.0→8.5 (TR2)

### Giant Weasel
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+3` · avg 5.0→4.5 (TR1)

### Goat
- **Ram** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+1` · avg 5.0→4.5 (TR1)

### Grick
- **Tentacles** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+2` · avg 7.0→6.5 (TR2)

### Grimlock
- **Spiked Bone Club** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+3` · avg 5.0→4.5 (TR1)

### Harpy
- **Claws** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4+1` · avg 5.0→4.5 (TR2)

### Horned Devil  *(found by re-scan — not in original list)*
- **Tail** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+6` · avg 9.0→8.5 (TR6)

### Hunter Shark  *(found by re-scan — not in original list)*
- **Bite** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+4` · avg 9.0→8.5 (TR2)

### Ice Devil  *(found by re-scan — not in original list)*
- **Claws** — Before: `4d4` · After: `1d10+4` · 5e source confirmed: `2d4+5` · avg 10.0→9.5 (TR6)

### Ice Mephit
- **Claws** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+1` · avg 5.0→4.5 (TR1)

### Jackal
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4-1` · avg 5.0→4.5 (TR1)

### Lemure
- **Fist** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Magma Mephit
- **Claws** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+1` · avg 5.0→4.5 (TR1)

### Mammoth  *(found by re-scan — not in original list)*
- **Gore** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `4d8+7` · avg 9.0→8.5 (TR4)

### Medusa  *(found by re-scan — not in original list)*
- **Snake Hair** — Before: `4d4` · After: `1d10+4` · 5e source confirmed: `1d4+2` · avg 10.0→9.5 (TR4)
- **Longbow** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+2` · avg 9.0→8.5 (TR4)

### Mule
- **Hooves** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+2` · avg 5.0→4.5 (TR1)

### Ogre Zombie  *(found by re-scan — not in original list)*
- **Morningstar** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+4` · avg 9.0→8.5 (TR2)

### Oni  *(found by re-scan — not in original list)*
- **Claw (Oni Form Only)** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+4` · avg 9.0→8.5 (TR4)

### Owlbear  *(found by re-scan — not in original list)*
- **Claws** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+5` · avg 9.0→8.5 (TR3)

### Pit Fiend  *(found by re-scan — not in original list)*
- **Claw** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+8` · avg 9.0→8.5 (TR7)

### Pony
- **Hooves** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4+2` · avg 5.0→4.5 (TR1)

### Rhinoceros  *(found by re-scan — not in original list)*
- **Gore** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+5` · avg 9.0→8.5 (TR2)

### Riding Horse
- **Hooves** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4+3` · avg 5.0→4.5 (TR1)

### Steam Mephit
- **Claws** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Stirge
- **Blood Drain** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4+3` · avg 5.0→4.5 (TR1)

### Swarm of Bats
- **Bites** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4` · avg 5.0→4.5 (TR1)

### Swarm of Beetles
- **Bites** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `4d4` · avg 5.0→4.5 (TR1)

### Swarm of Centipedes
- **Bites** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `4d4` · avg 5.0→4.5 (TR1)

### Swarm of Insects
- **Bites** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `4d4` · avg 5.0→4.5 (TR1)

### Swarm of Spiders
- **Bites** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `4d4` · avg 5.0→4.5 (TR1)

### Swarm of Wasps
- **Bites** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `4d4` · avg 5.0→4.5 (TR1)

### Tarrasque  *(found by re-scan — not in original list)*
- **Claw** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `4d8+10` · avg 9.0→8.5 (TR7)

### Unicorn  *(found by re-scan — not in original list)*
- **Hooves** — Before: `3d6` · After: `1d12+4` · 5e source confirmed: `2d6+4` · avg 10.5→10.5 (TR4)
- **Horn** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+4` · avg 9.0→8.5 (TR4)

### Vampire Spawn  *(found by re-scan — not in original list)*
- **Claws** — Before: `3d4` · After: `1d6+4` · 5e source confirmed: `2d4+3` · avg 7.5→7.5 (TR4)

### Vulture
- **Beak** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `1d4` · avg 5.0→4.5 (TR1)

### Wereboar, Hybrid Form
- **Maul** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+3` · avg 7.0→6.5 (TR3)
- **Tusks** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+3` · avg 7.0→6.5 (TR3)

### Weretiger, Human Form
- **Scimitar** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `1d6+3` · avg 7.0→6.5 (TR3)

### Werewolf, Hybrid Form  *(found by re-scan — not in original list)*
- **Claws** — Before: `3d4` · After: `1d6+4` · 5e source confirmed: `2d4+2` · avg 7.5→7.5 (TR3)

### Wight
- **Life Drain** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `1d6+2` · avg 7.0→6.5 (TR3)
- **Longbow** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `1d8+2` · avg 9.0→8.5 (TR3)

### Will-o'-Wisp  *(found by re-scan — not in original list)*
- **Shock** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8` · avg 9.0→8.5 (TR2)

### Wolf
- **Bite** — Before: `2d4` · After: `1d4+2` · 5e source confirmed: `2d4+2` · avg 5.0→4.5 (TR1)

### Wyvern
- **Bite** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+4` · avg 7.0→6.5 (TR4)
- **Claws** — Before: `2d8` · After: `1d8+4` · 5e source confirmed: `2d8+4` · avg 9.0→8.5 (TR4)
- **Stinger** — Before: `2d6` · After: `1d6+3` · 5e source confirmed: `2d6+4` · avg 7.0→6.5 (TR4)

### Young Black Dragon  *(found by re-scan — not in original list)*
- **Claw** — Before: `3d6` · After: `1d12+4` · 5e source confirmed: `2d6+4` · avg 10.5→10.5 (TR4)

### Young White Dragon  *(found by re-scan — not in original list)*
- **Claw** — Before: `3d6` · After: `1d12+4` · 5e source confirmed: `2d6+4` · avg 10.5→10.5 (TR4)

