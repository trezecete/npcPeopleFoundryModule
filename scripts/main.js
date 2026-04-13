import { registerSettings } from './settings.js';
import { GitHubSyncApp } from './sync-app.js';
import { SyncManager } from './sync-manager.js';

const MODULE_ID = 'npcPeopleFoundryModule';

Hooks.once('init', () => {
  console.log(`${MODULE_ID} | Initializing...`);
  registerSettings();
});

Hooks.on('renderActorDirectory', (app, html, data) => {
  if (!game.user.isGM) return;

  const footer = $(html).find('.footer');
  if (footer.length === 0) {
    console.warn(`${MODULE_ID} | Footer not found in ActorDirectory, checking header...`);
  }

  const headerActions = $(html).find('.header-actions');
  if (headerActions.length === 0) {
    console.error(`${MODULE_ID} | Could not find .header-actions in ActorDirectory. HTML structure might have changed.`);
    return;
  }

  const syncButton = $(`
    <button type="button" class="sync-github-btn" title="${game.i18n.localize('NPC_SYNC.UI.Title')}">
      <i class="fab fa-github"></i> ${game.i18n.localize('NPC_SYNC.UI.Sync')}
    </button>
  `);

  syncButton.on('click', () => {
    new GitHubSyncApp().render(true);
  });

  headerActions.append(syncButton);
  console.log(`${MODULE_ID} | Sync button added to ActorDirectory.`);
});

Hooks.on('ready', async () => {
  if (!game.user.isGM) return;

  const folder = game.settings.get(MODULE_ID, 'folderName');
  if (!folder) {
    ui.notifications.warn(game.i18n.localize('NPC_SYNC.Notifications.NoFolderConfigured'), { permanent: true });
    return;
  }

  // Automatic check for updates on startup
  const updates = await SyncManager.checkRemoteUpdates();
  
  if (updates?.status === 'no_folder') {
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize('NPC_SYNC.Dialog.FolderMissing.Title') },
      content: `<p>${game.i18n.format('NPC_SYNC.Dialog.FolderMissing.Content', { folder })}</p>`,
      buttons: [{
        action: "yes",
        label: game.i18n.localize('NPC_SYNC.Dialog.FolderMissing.Yes'),
        callback: () => {
          ui.notifications.info(game.i18n.format('NPC_SYNC.Notifications.FolderMissingOnRemote', { folder }));
        }
      }, {
        action: "config",
        label: game.i18n.localize('NPC_SYNC.Dialog.FolderMissing.Config'),
        callback: () => {
          game.settings.sheet.render(true, { focus: `${MODULE_ID}.folderName` });
        }
      }]
    }).render(true);
  }
 else if (updates?.new.length || updates?.modified.length) {
    const total = updates.new.length + updates.modified.length;
    
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize('NPC_SYNC.Dialog.UpdateAvailable.Title') },
      content: `<p>${game.i18n.format('NPC_SYNC.Dialog.UpdateAvailable.Content', { count: total })}</p>`,
      buttons: [{
        action: "sync",
        label: game.i18n.localize('NPC_SYNC.Dialog.UpdateAvailable.SyncNow'),
        callback: (event, button, dialog) => {
          new GitHubSyncApp().render(true);
        }
      }, {
        action: "later",
        label: game.i18n.localize('NPC_SYNC.Dialog.UpdateAvailable.Later'),
        callback: () => {}
      }]
    }).render(true);
  }
});
