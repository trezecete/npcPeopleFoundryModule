/**
 * Handle all module settings registration
 */
export const registerSettings = function() {
  const MODULE_ID = 'npc-people-foundry-sync';

  // GitHub Repository Path (e.g., trezecete/npcPeopleFoundry)
  game.settings.register(MODULE_ID, 'repository', {
    name: "NPC_SYNC.Settings.Repo.Name",
    hint: "NPC_SYNC.Settings.Repo.Hint",
    scope: 'world',
    config: true,
    type: String,
    default: "trezecete/npcPeopleFoundry",
    onChange: value => console.log(`${MODULE_ID} | Repository set to: ${value}`)
  });

  // Folder name in the repository for this world
  game.settings.register(MODULE_ID, 'folderName', {
    name: "NPC_SYNC.Settings.Folder.Name",
    hint: "NPC_SYNC.Settings.Folder.Hint",
    scope: 'world',
    config: true,
    type: String,
    default: "",
    onChange: value => console.log(`${MODULE_ID} | Folder name set to: ${value}`)
  });

  // GitHub Personal Access Token
  game.settings.register(MODULE_ID, 'accessToken', {
    name: "NPC_SYNC.Settings.Token.Name",
    hint: "NPC_SYNC.Settings.Token.Hint",
    scope: 'world',
    config: true,
    type: String,
    default: "",
    secret: true
  });

  // Internal last sync timestamp
  game.settings.register(MODULE_ID, 'lastSync', {
    scope: 'world',
    config: false,
    type: Number,
    default: 0
  });

  // Internal storage for known remote SHAs to handle conflicts better
  game.settings.register(MODULE_ID, 'remoteMetadata', {
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });
};
