import { NPC, SchoolRank, Ability, AbilityRank, Item, Location, TrainingRegimen, TrainingType, Equipment, EquipmentSlot } from './types';
import { Sword, Shield, Wind, Sparkles } from 'lucide-react';

export const PLAYER_NAMES: string[] = ["Aric", "Lyra", "Kael", "Seraphina", "Roric", "Zane", "Elara"];
export const DRAGON_NAMES: string[] = ["Ignis", "Zephyr", "Terra", "Aqua", "Fulgor", "Umbra", "Lux"];
export const DRAGON_ELEMENTS: string[] = ["Fogo", "Vento", "Terra", "Água", "Raio", "Sombra", "Luz"];

// --- Progression Constants ---
export const ACADEMY_SIZE = 100;
export const LEVEL_UP_XP = 100;
export const STAT_POINTS_PER_LEVEL = 5;
export const ABILITY_MILESTONES = [5, 10, 25, 50, 100];
export const TOURNAMENT_LEVEL_TRIGGERS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];

// --- Training Constants ---
export const STAT_BONUS_CHANCE = 0.25; // 25% chance to get +1 stat
export const STAT_TRAINING_XP_GAIN = { min: 10, max: 15 };
export const ELEMENTAL_TRAINING_XP_GAIN = { min: 20, max: 25 };

export const TRAINING_REGIMENS: TrainingRegimen[] = [
    {
        id: TrainingType.STRENGTH,
        nameKey: 'training_strength_name',
        descriptionKey: 'training_strength_desc',
        icon: Sword,
        stat: 'attack',
    },
    {
        id: TrainingType.DEFENSE,
        nameKey: 'training_defense_name',
        descriptionKey: 'training_defense_desc',
        icon: Shield,
        stat: 'defense',
    },
    {
        id: TrainingType.SPEED,
        nameKey: 'training_speed_name',
        descriptionKey: 'training_speed_desc',
        icon: Wind,
        stat: 'speed',
    },
    {
        id: TrainingType.ELEMENTAL,
        nameKey: 'training_elemental_name',
        descriptionKey: 'training_elemental_desc',
        icon: Sparkles,
    },
];

export const SCHOOL_RANKS: { level: number, rankKey: string }[] = [
    { level: 1, rankKey: 'rank_neophyte' },
    { level: 10, rankKey: 'rank_apprentice' },
    { level: 25, rankKey: 'rank_adept' },
    { level: 40, rankKey: 'rank_expert' },
    { level: 60, rankKey: 'rank_master' },
    { level: 80, rankKey: 'rank_grandmaster' },
];

// --- Locations ---
export const ACADEMY_LOCATIONS: Location[] = [
  {
    id: 'library',
    nameKey: 'loc_library_name',
    descriptionKey: 'loc_library_desc',
    npcIds: ['elara_swiftwood'],
  },
  {
    id: 'training_arena',
    nameKey: 'loc_arena_name',
    descriptionKey: 'loc_arena_desc',
    npcIds: ['kael_stormrider', 'bren_stonehand'],
  },
  {
    id: 'whispering_gardens',
    nameKey: 'loc_gardens_name',
    descriptionKey: 'loc_gardens_desc',
    npcIds: ['seraphina_moonshadow'],
  },
   {
    id: 'main_hall',
    nameKey: 'loc_mainhall_name',
    descriptionKey: 'loc_mainhall_desc',
    npcIds: ['bren_stonehand', 'kael_stormrider', 'elara_swiftwood'],
  }
];

// --- NPCs ---
export const PREDEFINED_NPCS: NPC[] = [
    {
        id: "elara_swiftwood",
        nameKey: "npc_elara_name",
        descriptionKey: "npc_elara_desc",
        genderKey: "gender_female",
        sexualityKey: "sexuality_bisexual",
        maritalStatusKey: "status_single",
    },
    {
        id: "bren_stonehand",
        nameKey: "npc_bren_name",
        descriptionKey: "npc_bren_desc",
        genderKey: "gender_male",
        sexualityKey: "sexuality_heterosexual",
        maritalStatusKey: "status_married",
    },
    {
        id: "seraphina_moonshadow",
        nameKey: "npc_seraphina_name",
        descriptionKey: "npc_seraphina_desc",
        genderKey: "gender_female",
        sexualityKey: "sexuality_asexual",
        maritalStatusKey: "status_single",
    },
    {
        id: "kael_stormrider",
        nameKey: "npc_kael_name",
        descriptionKey: "npc_kael_desc",
        genderKey: "gender_male",
        sexualityKey: "sexuality_homosexual",
        maritalStatusKey: "status_dating",
    },
];

// --- Abilities ---
export const STARTING_ABILITY: Ability = { id: 'tackle', nameKey: 'ability_tackle_name', descriptionKey: 'ability_tackle_desc', rank: AbilityRank.F, power: 5, manaCost: 0 };

export const PREDEFINED_ABILITIES: Ability[] = [
    // Rank F
    { id: 'ember', nameKey: 'ability_ember_name', descriptionKey: 'ability_ember_desc', rank: AbilityRank.F, power: 8, manaCost: 5 },
    { id: 'gust', nameKey: 'ability_gust_name', descriptionKey: 'ability_gust_desc', rank: AbilityRank.F, power: 8, manaCost: 5 },
    
    // Rank D
    { id: 'slash', nameKey: 'ability_slash_name', descriptionKey: 'ability_slash_desc', rank: AbilityRank.D, power: 18, manaCost: 15 },
    
    // Rank C
    { id: 'fireball', nameKey: 'ability_fireball_name', descriptionKey: 'ability_fireball_desc', rank: AbilityRank.C, power: 30, manaCost: 25 },
    
    // Rank B
    { id: 'thunder_claw', nameKey: 'ability_thunderclaw_name', descriptionKey: 'ability_thunderclaw_desc', rank: AbilityRank.B, power: 45, manaCost: 35 },

    // Rank A
    { id: 'inferno', nameKey: 'ability_inferno_name', descriptionKey: 'ability_inferno_desc', rank: AbilityRank.A, power: 60, manaCost: 50 },

    // Rank S
    { id: 'meteor_strike', nameKey: 'ability_meteor_name', descriptionKey: 'ability_meteor_desc', rank: AbilityRank.S, power: 85, manaCost: 75 },

    // Rank SS
    { id: 'celestial_judgment', nameKey: 'ability_celestial_name', descriptionKey: 'ability_celestial_desc', rank: AbilityRank.SS, power: 150, manaCost: 120 },
];

export const PREDEFINED_EQUIPMENT: Equipment[] = [
    // Armor
    { id: 'leather_armor', nameKey: 'eq_leather_armor_name', descriptionKey: 'eq_leather_armor_desc', cost: 150, slot: EquipmentSlot.ARMOR, stats: { hp: 10, defense: 2 } },
    { id: 'iron_scales', nameKey: 'eq_iron_scales_name', descriptionKey: 'eq_iron_scales_desc', cost: 400, slot: EquipmentSlot.ARMOR, stats: { hp: 25, defense: 5 } },
    // Claws
    { id: 'sharpened_claws', nameKey: 'eq_sharp_claws_name', descriptionKey: 'eq_sharp_claws_desc', cost: 200, slot: EquipmentSlot.CLAWS, stats: { attack: 5 } },
    { id: 'elemental_claws', nameKey: 'eq_elem_claws_name', descriptionKey: 'eq_elem_claws_desc', cost: 500, slot: EquipmentSlot.CLAWS, stats: { attack: 8, mana: 10 } },
    // Talismans
    { id: 'talisman_of_vitality', nameKey: 'eq_vitality_talisman_name', descriptionKey: 'eq_vitality_talisman_desc', cost: 300, slot: EquipmentSlot.TALISMAN, stats: { hp: 20 } },
    { id: 'talisman_of_speed', nameKey: 'eq_speed_talisman_name', descriptionKey: 'eq_speed_talisman_desc', cost: 300, slot: EquipmentSlot.TALISMAN, stats: { speed: 5 } },
];


// --- Shop ---
export const SHOP_ITEMS: Item[] = [
    { id: 'sm_health_potion', nameKey: 'item_sm_health_potion_name', descriptionKey: 'item_sm_health_potion_desc', cost: 50 },
    { id: 'xp_scroll', nameKey: 'item_xp_scroll_name', descriptionKey: 'item_xp_scroll_desc', cost: 100 },
    ...PREDEFINED_EQUIPMENT,
];

// --- Rivals ---
export const ACADEMY_ROSTER_PREFABS = {
    firstNames: ["Zane", "Roric", "Gwen", "Elian", "Mila", "Jorn", "Faye"],
    lastNames: ["Blackwood", "Ironhide", "Silverwind", "Shadowend", "Brightwater"],
};