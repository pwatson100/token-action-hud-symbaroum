export let RollHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {
	/**
	 * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
	 */
	RollHandler = class RollHandler extends coreModule.api.RollHandler {
		/**
		 * Handle action event
		 * Called by Token Action HUD Core when an action event is triggered
		 * @override
		 * @param {object} event        The event
		 * @param {string} encodedValue The encoded value
		 */
		async doHandleActionEvent(event, encodedValue) {
			const payload = encodedValue.split("|");

			if (payload.length !== 2) {
				super.throwInvalidValueErr();
			}

			const actionTypeId = payload[0];
			const actionId = payload[1];

			const renderable = [];

			if (renderable.includes(actionTypeId) && this.isRenderItem()) {
				return this.doRenderItem(this.actor, actionId);
			}

			const knownCharacters = ["player", "monster"];

			// If single actor is selected
			if (this.actor) {
				await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId);
				return;
			}

			const controlledTokens = canvas.tokens.controlled.filter((token) => knownCharacters.includes(token.actor?.type));

			// If multiple actors are selected
			for (const token of controlledTokens) {
				const actor = token.actor;
				await this.#handleAction(event, actor, token, actionTypeId, actionId);
			}
		}

		/**
		 * Handle action
		 * @private
		 * @param {object} event        The event
		 * @param {object} actor        The actor
		 * @param {object} token        The token
		 * @param {string} actionTypeId The action type id
		 * @param {string} actionId     The actionId
		 */
		async #handleAction(event, actor, token, actionTypeId, actionId) {
			switch (actor.type) {
				case "player":
				case "monster":
					{
						switch (actionTypeId) {
							case "attributes":
								await this.#handleAttributeAction(event, actor, actionId);
								break;
							case "item":
								{
									const actorItem = actor.items.get(actionId);
									if (actionId == game.symbaroum.config.noArmorID || actorItem.type == "armor") {
										return await this.#handleUArmorAction(event, actor, actionId, actorItem);
									}
									switch (actorItem.type) {
										case "weapon":
											await this.#handleWeaponAction(event, actor, actionId, actorItem);
											break;
										default:
											await this.doRenderItem(this.actor, actionId);
											break;
									}
								}
								break;
							case "trait":
								await this.#handleTraitAction(event, actor, actionId);
								break;
							case "ability":
								await this.#handleAbilityAction(event, actor, actionId);
								break;
							case "mysticalpower":
								await this.#handleMysticalPowerAction(event, actor, actionId);
								break;
							case "toughness":
								await this.#adjustAttribute(actor, "toughness", "value");
								break;
							case "corruption":
								await this.#adjustAttribute(actor, "corruption", "temporary");
								break;

							default:
								await this.doRenderItem(this.actor, actionId);
								break;
						}
					}
					break;
			}
		}

		/**
		 * Handle Attribute action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleAttributeAction(event, actor, actionId) {
			actor.rollAttribute(actionId);
		}

		/**
		 * Handle Trait action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleTraitAction(event, actor, actionId) {
			let usedPower = actor.items.get(actionId);
			actor.usePower(usedPower);
		}

		/**
		 * Handle Ability action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleAbilityAction(event, actor, actionId) {
			let usedPower = actor.items.get(actionId);
			actor.usePower(usedPower);
		}

		/**
		 * Handle Mystical Power action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleMysticalPowerAction(event, actor, actionId) {
			let usedPower = actor.items.get(actionId);
			actor.usePower(usedPower);
		}

		/**
		 * Handle Armour action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleUArmorAction(event, actor, actionId, actorItem) {
			actor.rollArmor();
		}

		/**
		 * Handle Weapon action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleWeaponAction(event, actor, actionId, actorItem) {
			let usedItem = actor.system.weapons.filter((item) => item.id === actionId);
			actor.rollWeapon(usedItem[0]);
		}

		/**
		 * Handle Attribute action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #adjustAttribute(actor, property, valueName) {
			let value = actor.system.health[property][valueName];
			let max = actor.system.health[property].max;

			if (this.rightClick) {
				if (value <= 0) return;
				value--;
			} else {
				if (value >= max) return;
				value++;
			}

			let update = { data: { health: { [property]: { [valueName]: value } } } };

			await actor.update(update);
		}

		/**
		 * Handle item action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {string} actionId The action id
		 */
		async #handleItemAction(event, actor, actionId) {
			const item = actor.items.get(actionId);
			item.toChat(event);
		}

		/**
		 * Handle utility action
		 * @private
		 * @param {object} token    The token
		 * @param {string} actionId The action id
		 */
		async #handleUtilityAction(token, actionId) {
			switch (actionId) {
				case "endTurn":
					if (game.combat?.current?.tokenId === token.id) {
						await game.combat?.nextTurn();
					}
					break;
			}
		}
	};
});
