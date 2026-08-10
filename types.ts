export enum Gender {
  MALE = "Masculino",
  FEMALE = "Feminino",
  NON_BINARY = "Não-Binário",
}

export enum Sexuality {
  HETEROSEXUAL = "Heterossexual",
  HOMOSEXUAL = "Homossexual",
  BISEXUAL = "Bissexual",
  PANSEXUAL = "Pansexual",
  ASEXUAL = "Assexual",
}

export enum MaritalStatus {
  SINGLE = "Solteiro(a)",
  DATING = "Num Relacionamento",
  MARRIED = "Casado(a)",
}

export enum SchoolRank {
    NEOPHYTE = "Neófito",
    APPRENTICE = "Aprendiz",
    ADEPT = "Adepto",
    EXPERT = "Perito",
    MASTER = "Mestre",
    GRANDMASTER = "Grão-Mestre",
}

export enum AbilityRank {
    F = "F",
    E = "E",
    D = "D",
    C = "C",
    B = "B",
    A = "A",
    S = "S",
    SS = "SS",
}

export type Language = 'en' | 'pt-PT' | 'pt-BR';

export enum EquipmentSlot {
    ARMOR = "ARMOR",
    CLAWS = "CLAWS",
    TALISMAN = "TALISMAN",
}

export interface Ability {
    id: string;
    nameKey: string;
    descriptionKey: string;
    rank: AbilityRank;
    power: number; // A numeric value for combat calculations
    manaCost: number; // Mana required to use the ability
}

export interface BaseItem {
    id: string;
    nameKey: string;
    descriptionKey: string;
    cost: number;
}

export interface Equipment extends BaseItem {
    slot: EquipmentSlot;
    stats: Partial<Stats>;
}

export type Item = BaseItem | Equipment;

export interface NPC {
    id: string;
    nameKey: string;
    descriptionKey: string;
    genderKey: string;
    sexualityKey: string;
    maritalStatusKey: string;
}

export interface Rival {
    id: string;
    name: string;
    rank: number;
    dragon: {
        name: string;
        level: number;
        element: string;
        stats: Stats;
        currentHp: number;
        currentMana: number;
        abilities: Ability[];
    };
}

export interface Player {
  name: string;
  day: number;
  gold: number;
  rank: number; // Numerical rank, e.g., 100
  schoolRankKey: string; // Title rank, e.g., Neophyte
  relationships: Record<string, number>;
  inventory: Item[];
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  mana: number;
}

export interface Dragon {
  name: string;
  element: string;
  level: number;
  xp: number;
  stats: Stats;
  equipment: Partial<Record<EquipmentSlot, Equipment>>;
  currentHp: number;
  currentMana: number;
  description: string;
  imageUrl: string;
  abilities: Ability[];
}

export enum GameState {
  LOADING,
  CHARACTER_CREATION,
  PLAYING,
  LEVEL_UP,
  ABILITY_SELECTION,
  SHOP,
  TOURNAMENT,
  MAP_VIEW,
}

export interface EventOutcome {
    description: string;
    xp?: number;
    gold?: number;
    affinityChange?: number;
    hpChange?: number; // Added to allow events to damage/heal the dragon
}

export interface Interaction {
  eventTitle: string;
  choiceText: string;
  outcome: EventOutcome;
  npcId?: string;
}

export interface SavedGame {
  player: Player;
  dragon: Dragon;
  history: Interaction[];
  academyRoster: Rival[];
  actionOutcomeCache: Record<string, string[]>;
  dailyActionsUsed: string[];
  language?: Language;
}

export interface Location {
  id: string;
  nameKey: string;
  descriptionKey: string;
  npcIds: string[];
}

export interface ChatMessage {
    sender: 'player' | 'npc';
    text: string;
    npcName?: string; // For system messages or multi-NPC chats
}

export enum TrainingType {
    STRENGTH = 'strength',
    DEFENSE = 'defense',
    SPEED = 'speed',
    ELEMENTAL = 'elemental',
}

export interface TrainingRegimen {
    id: TrainingType;
    nameKey: string;
    descriptionKey: string;
    icon: React.ElementType; // Lucide icon
    stat?: keyof Omit<Stats, 'hp' | 'mana'>; // The stat it might boost
}