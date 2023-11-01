/**
 * Module-based constants
 */
export const MODULE = {
	ID: "token-action-hud-symbaroum",
};

/**
 * Core module
 */
export const CORE_MODULE = {
	ID: "token-action-hud-core",
};

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = "1.5";

/**
 * Action types
 */
export const ACTION_TYPE = {
	attributes: "TITLE.ATTRIBUTES",
	ability: "ITEM.ABILITY",
	trait: "ITEM.TRAIT",
	mysticalpower: "ITEM.MYSTICAL_POWER",
	toughness: "HEALTH.TOUGHNESS",
	corruption: "HEALTH.CORRUPTION_TEMPORARY",
	utility: "ABILITY_LABEL.DEFAULT",
};

/**
 * Groups
 */
export const GROUP = {
	abilities: { id: "abilities", name: "ITEM.ABILITY", type: "system" },
	traits: { id: "traits", name: "ITEM.TRAIT", type: "system" },
	weapons: { id: "weapons", name: "TITLE.WEAPONS", type: "system" },
	armor: { id: "armor", name: "ITEM.ARMOR", type: "system" },
	equipment: { id: "equipment", name: "ITEM.TypeEquipment", type: "system" },
	artifact: { id: "artifact", name: "TITLE.ARTIFACTS", type: "system" },
	attributes: { id: "attributes", name: "TITLE.ATTRIBUTES", type: "system" },
	mysticalpower: { id: "mysticalpower", name: "ITEM.MYSTICAL_POWER", type: "system" },
	utility: { id: "utility", name: "ABILITY_LABEL.DEFAULT", type: "system" },
};

/**
 * Item types
 */
export const ITEM_TYPE = {
	armor: { groupId: "armor" },
	weapon: { groupId: "weapons" },
	equipment: { groupId: "equipment" },
	artifact: { groupId: "artifact" },
};

/**
 * Conditions
 */
export const CONDITION = {};
