// System Module Imports
import { ACTION_TYPE, ITEM_TYPE, CONDITION } from "./constants.js";
import { Utils } from "./utils.js";

export let ActionHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {
	/**
	 * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
	 */
	ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
		// Initialize actor and token variables
		actors = null;
		tokens = null;
		actorType = null;

		// Initialize items variable
		items = null;

		// Initialize setting variables
		showUnequippedItems = null;
		showtooltip = null;

		/**
		 * Build system actions
		 * Called by Token Action HUD Core
		 * @override
		 * @param {array} groupIds
		 */
		async buildSystemActions(groupIds) {
			// Set actor and token variables
			this.actors = !this.actor ? this.#getActors() : [this.actor];
			this.tokens = !this.token ? this.#getTokens() : [this.token];
			this.actorType = this.actor?.type;

			// Settings
			this.displayUnequipped = Utils.getSetting("displayUnequipped");
			this.showtooltip = Utils.getSetting("showtooltip");

			// Set items variable
			if (this.actor) {
				let items = this.actor.items;
				items = coreModule.api.Utils.sortItemsByName(items);
				this.items = items;
			}

			switch (this.actorType) {
				case "player":
				case "monster":
					{
						await this.#buildPlayerActions();
					}
					break;
				default:
					{
						await this.#buildMultipleTokenActions();
					}
					break;
			}
		}

		/**
		 * Build player actions
		 * @private
		 */
		async #buildPlayerActions() {
			await Promise.all([
				this.#buildAttributes(),
				this.#buildTraits(),
				this.#buildAbilities(),
				this.#buildMysticalPowers(),
				this.#buildInventory(),
				this.#buildToughness(),
				this.#buildTempCorruption(),
			]);
		}

		// async #buildMonsterActions(actor) {
		// 	// debugger;
		// 	await Promise.all([
		// 		this.#buildAttributes(),
		// 		this.#buildTraits(),
		// 		this.#buildAbilities(),
		// 		this.#buildMysticalPowers(),
		// 		this.#buildInventory(),
		// 		this.#buildToughness(),
		// 	]);
		// }

		async #buildMultipleTokenActions() {}

		async #buildAttributes() {
			const actionType = "attributes";

			// Get skills
			const attributes = {
				...(!this.actor ? game.symbaroum.config.attributes : this.actor.system.attributes),
			};
			// Exit if there are no skills
			if (attributes.length === 0) return;

			// Get actions
			const actions = Object.entries(attributes)
				.map((attributes) => {
					try {
						const id = attributes[0];
						// const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1);
						const name = `${coreModule.api.Utils.i18n(game.symbaroum.config.attributeLabels[id])}` + " " + "-" + " " + this.actor.system.attributes[id].value;
						const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? "";
						const listName = `${actionTypeName}${game.symbaroum.config.attributes[id]}`;
						const encodedValue = [actionType, id].join(this.delimiter);
						// const mod = attributes[id].total
						// const tooltip = coreModule.api.Utils.i18n("ALIENRPG.LEFTCLICKTOROLL");
						return {
							id,
							name,
							encodedValue,
							listName,
							// tooltip,
						};
					} catch (error) {
						coreModule.api.Logger.error(attributes);
						return null;
					}
				})
				.filter((attributes) => !!attributes);

			// Create group data
			const groupData = { id: "attributes", type: "system" };

			// Add actions to HUD
			this.addActions(actions, groupData);
		}

		async #buildInventory() {
			if (this.items.size === 0) return;

			const actionTypeId = "item";
			const inventoryMap = new Map();

			for (const [itemId, itemData] of this.items) {
				const type = itemData.type;

				if (type === "weapon" || type === "armor" || type === "equipment") {
					const typeMap = inventoryMap.get(type) ?? new Map();
					typeMap.set(itemId, itemData);
					inventoryMap.set(type, typeMap);
				}

				for (const [type, typeMap] of inventoryMap) {
					const groupId = ITEM_TYPE[type]?.groupId;

					if (!groupId) continue;

					const groupData = { id: groupId, type: "system" };

					// Get actions
					const actions = [...typeMap].map(([itemId, itemData]) => {
						// let name = "";
						const id = itemId;
						const img = coreModule.api.Utils.getImage(itemData);
						const name = itemData.name;
						const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId]);
						const listName = `${actionTypeName ? `${actionTypeName}: ` : ""}${name}`;
						const encodedValue = [actionTypeId, id].join(this.delimiter);
						// const tooltip = coreModule.api.Utils.i18n("ALIENRPG.LEFTCLICKTOROLL");

						return {
							id,
							name,
							img,
							listName,
							encodedValue,
							// tooltip,
						};
					});

					// TAH Core method to add actions to the action list
					this.addActions(actions, groupData);
				}
			}
		}

		async #buildTraits() {
			const actionType = "trait";
			// Get traits
			const traits = this.actor.items.filter((item) => item.type === "trait" && item.system?.hasScript);
			// Exit if there are no traits with scripts
			if (traits.length === 0) return;

			// Get actions
			const actions = Object.entries(traits)
				.map((trait) => {
					try {
						const lookupId = trait[1].name.toLowerCase().replace(/\s/g, "");
						const id = trait[1].name;
						const name = `${coreModule.api.Utils.i18n(game.symbaroum.config.traitsList[lookupId])}`;
						const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? "";
						const listName = `${actionTypeName}${coreModule.api.Utils.i18n(game.symbaroum.config.traitsList[lookupId])}`;
						const encodedValue = [actionType, id].join(this.delimiter);
						return {
							id,
							name,
							encodedValue,
							listName,
							// tooltip,
						};
					} catch (error) {
						coreModule.api.Logger.error(trait);
						return null;
					}
				})
				.filter((trait) => !!trait);

			// Create group data
			const groupData = { id: "traits", type: "system" };

			// Add actions to HUD
			this.addActions(actions, groupData);
		}

		async #buildAbilities() {
			const actionType = "ability";
			// Get traits
			const abilities = this.actor.items.filter((item) => item.type === "ability" && item.system?.script);
			// Exit if there are no abilities with scripts
			if (abilities.length === 0) return;

			// Get actions
			const actions = Object.entries(abilities)
				.map((ability) => {
					try {
						const lookupId = ability[1].name.toLowerCase().replace(/\s/g, "");
						const id = ability[1].name;
						const name = `${coreModule.api.Utils.i18n(game.symbaroum.config.abilitiesList[lookupId])}`;
						const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? "";
						const listName = `${actionTypeName}${coreModule.api.Utils.i18n(game.symbaroum.config.abilitiesList[lookupId])}`;
						const encodedValue = [actionType, id].join(this.delimiter);
						return {
							id,
							name,
							encodedValue,
							listName,
							// tooltip,
						};
					} catch (error) {
						coreModule.api.Logger.error(ability);
						return null;
					}
				})
				.filter((ability) => !!ability);

			// Create group data
			const groupData = { id: "abilities", type: "system" };

			// Add actions to HUD
			this.addActions(actions, groupData);
		}
		async #buildMysticalPowers() {
			const actionType = "mysticalpower";
			// Get traits
			let powers = this.actor.items.filter((item) => item.type === "mysticalPower" && item.system?.hasScript);
			// Exit if there are no abilities with scripts
			if (powers.length === 0) return;

			// Get actions
			const actions = Object.entries(powers)
				.map((power) => {
					try {
						const lookupId = power[1].name.toLowerCase().replace(/\s/g, "");
						const id = power[1].name;
						const name = `${coreModule.api.Utils.i18n(game.symbaroum.config.powersList[lookupId])}`;
						const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? "";
						const listName = `${actionTypeName}${coreModule.api.Utils.i18n(game.symbaroum.config.powersList[lookupId])}`;
						const encodedValue = [actionType, id].join(this.delimiter);
						return {
							id,
							name,
							encodedValue,
							listName,
							// tooltip,
						};
					} catch (error) {
						coreModule.api.Logger.error(power);
						return null;
					}
				})
				.filter((power) => !!power);

			// Create group data
			const groupData = { id: "mysticalpower", type: "system" };

			// Add actions to HUD
			this.addActions(actions, groupData);
		}

		async #buildToughness() {
			const actionTypeId = "toughness";
			const groupData = { id: "utility", type: "system" };
			const value = this.actor.system?.health.toughness.value;
			const max = this.actor.system?.health.toughness.max;

			// Get actions
			const id = actionTypeId;
			const name = coreModule.api.Utils.i18n("HEALTH.TOUGHNESS") + " - " + (max > 0 ? `${value ?? 0}/${max}` : "");
			const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId]);
			const listName = `${actionTypeName ? `${actionTypeName}: ` : ""}${name}`;
			const encodedValue = [actionTypeId, id].join(this.delimiter);
			// const tooltip = coreModule.api.Utils.i18n("ALIENRPG.ConButtons");
			const actions = [
				{
					id,
					name,
					listName,
					encodedValue,
					// tooltip,
				},
			];
			// TAH Core method to add actions to the action list
			this.addActions(actions, groupData);
		}

		async #buildTempCorruption() {
			const actionTypeId = "corruption";
			let name = "";
			const groupData = { id: "utility", type: "system" };
			const value = this.actor.system?.health.corruption.value;
			const max = this.actor.system?.health.corruption.max;

			// Get actions
			const id = actionTypeId;
			if (max === 0) {
				name = coreModule.api.Utils.i18n("HEALTH.CORRUPTION_THROUGHLY").capitalize();
			} else {
				name =
					coreModule.api.Utils.i18n("HEALTH.CORRUPTION_TEMPORARY") +
					" " +
					coreModule.api.Utils.i18n("HEALTH.CORRUPTION") +
					" - " +
					(max > 0 ? `${value ?? 0}/${max}` : "");
			}

			const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId]);
			const listName = `${actionTypeName ? `${actionTypeName}: ` : ""}${name}`;
			const encodedValue = [actionTypeId, id].join(this.delimiter);
			// const tooltip = coreModule.api.Utils.i18n("ALIENRPG.ConButtons");
			const actions = [
				{
					id,
					name,
					listName,
					encodedValue,
					// tooltip,
				},
			];
			// TAH Core method to add actions to the action list
			this.addActions(actions, groupData);
		}

		/**
		 * Get actors
		 * @private
		 * @returns {object}
		 */
		async #getActors() {
			const allowedTypes = ["player", "monster"];
			const actors = canvas.tokens.controlled.filter((token) => token.actor).map((token) => token.actor);
			if (actors.every((actor) => allowedTypes.includes(actor.type))) {
				return actors;
			} else {
				return [];
			}
		}

		/**
		 * Get tokens
		 * @private
		 * @returns {object}
		 */
		async #getTokens() {
			const allowedTypes = ["player", "monster"];
			const tokens = canvas.tokens.controlled;
			const actors = tokens.filter((token) => token.actor).map((token) => token.actor);
			if (actors.every((actor) => allowedTypes.includes(actor.type))) {
				return tokens;
			} else {
				return [];
			}
		}

		/**
		 * Get condition tooltip data
		 * @param {*} id     The condition id
		 * @param {*} name   The condition name
		 * @returns {object} The tooltip data
		 */
		#getConditionTooltipData(id, name) {
			if (this.showtooltip === false) return "";
			const description = CONDITION[id] ? CONDITION[id]?.description : null;
			return {
				name,
				description,
			};
		}
		/**
		 * Get tooltip
		 * @param {object} tooltipData The tooltip data
		 * @returns {string}           The tooltip
		 */
		#getTooltip(tooltipData) {
			if (this.showtooltip === false) return "";
			// if (typeof tooltipData === 'string') return tooltipData;

			const name = coreModule.api.Utils.i18n(tooltipData.name);

			// if (this.tooltipsSetting === 'nameOnly') return name;

			const nameHtml = `<h3>${name}</h3>`;

			const description =
				tooltipData?.descriptionLocalised ?? TextEditor.enrichHTML(coreModule.api.Utils.i18n(tooltipData?.description ?? ""), { async: false });

			const rarityHtml = tooltipData?.rarity
				? `<span class="tah-tag ${tooltipData.rarity}">${coreModule.api.Utils.i18n(RARITY[tooltipData.rarity])}</span>`
				: "";

			const propertiesHtml = tooltipData?.properties
				? `<div class="tah-properties">${tooltipData.properties
						.map((property) => `<span class="tah-property">${coreModule.api.Utils.i18n(property)}</span>`)
						.join("")}</div>`
				: "";

			const traitsHtml = tooltipData?.traits
				? tooltipData.traits.map((trait) => `<span class="tah-tag">${coreModule.api.Utils.i18n(trait.label ?? trait)}</span>`).join("")
				: "";

			const traits2Html = tooltipData?.traits2
				? tooltipData.traits2.map((trait) => `<span class="tah-tag tah-tag-secondary">${coreModule.api.Utils.i18n(trait.label ?? trait)}</span>`).join("")
				: "";

			const traitsAltHtml = tooltipData?.traitsAlt
				? tooltipData.traitsAlt.map((trait) => `<span class="tah-tag tah-tag-alt">${coreModule.api.Utils.i18n(trait.label)}</span>`).join("")
				: "";

			const modifiersHtml = tooltipData?.modifiers
				? `<div class="tah-tags">${tooltipData.modifiers
						.filter((modifier) => modifier.enabled)
						.map((modifier) => {
							const label = coreModule.api.Utils.i18n(modifier.label);
							const sign = modifier.modifier >= 0 ? "+" : "";
							const mod = `${sign}${modifier.modifier ?? ""}`;
							return `<span class="tah-tag tah-tag-transparent">${label} ${mod}</span>`;
						})
						.join("")}</div>`
				: "";

			const tagsJoined = [rarityHtml, traitsHtml, traits2Html, traitsAltHtml].join("");

			const tagsHtml = tagsJoined ? `<div class="tah-tags">${tagsJoined}</div>` : "";

			const headerTags = tagsHtml || modifiersHtml ? `<div class="tah-tags-wrapper">${tagsHtml}${modifiersHtml}</div>` : "";

			if (!description && !tagsHtml && !modifiersHtml) return name;

			return `<div>${nameHtml}${headerTags}${description}${propertiesHtml}</div>`;
		}
	};
});