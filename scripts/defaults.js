import { GROUP } from "./constants.js";

/**
 * Default layout and groups
 */
export let DEFAULTS = null;

Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {
	const groups = GROUP;
	Object.values(groups).forEach((group) => {
		group.name = coreModule.api.Utils.i18n(group.name);
		group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`;
	});
	
	const groupsArray = Object.values(groups);
	DEFAULTS = {
		layout: [
			{
				nestId: "attributes",
				id: "attributes",
				name: coreModule.api.Utils.i18n("TITLE.ATTRIBUTES"),
				groups: [{ ...groups.attributes, nestId: "attributes_attributes" }],
			},
			{
				nestId: "inventory",
				id: "inventory",
				name: coreModule.api.Utils.i18n("ITEM.TypeEquipment"),
				groups: [
					{ ...groups.weapons, nestId: "inventory_weapons" },
					{ ...groups.armor, nestId: "inventory_armor" },
					{ ...groups.equipment, nestId: "inventory_equipment" },
					{ ...groups.artifact, nestId: "inventory_artifact" },
				],
			},
			{
				nestId: "abilities",
				id: "abilities",
				name: coreModule.api.Utils.i18n("ITEM.ABILITY"),
				groups: [{ ...groups.abilities, nestId: "abilities_abilities" }],
			},
			{
				nestId: "traits",
				id: "traits",
				name: coreModule.api.Utils.i18n("ITEM.TRAIT"),
				groups: [{ ...groups.traits, nestId: "traits_traits" }],
			},
			{
				nestId: "mysticalpower",
				id: "mysticalpower",
				name: coreModule.api.Utils.i18n("ITEM.MYSTICAL_POWER"),
				groups: [{ ...groups.mysticalpower, nestId: "mysticalpower_mysticalpower" }],
			},
			{
				nestId: "utility",
				id: "utility",
				name: coreModule.api.Utils.i18n("ABILITY_LABEL.DEFAULT"),
				groups: [{ ...groups.utility, nestId: "utility_toughness" }],
			},
		],
		groups: groupsArray,
	};
});
