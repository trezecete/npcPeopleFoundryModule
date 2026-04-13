import { SyncManager } from './sync-manager.js';

/**
 * Modern ApplicationV2 for managing GitHub Sync
 */
export class GitHubSyncApp extends foundry.applications.api.ApplicationV2 {
  constructor(options = {}) {
    super(options);
    this.results = null;
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    id: "npc-people-sync-app",
    window: {
      title: "NPC_SYNC.UI.Title",
      icon: "fab fa-github",
      resizable: true
    },
    position: {
      width: 450,
      height: "auto"
    },
    actions: {
      push: GitHubSyncApp.onPush,
      check: GitHubSyncApp.onCheck,
      "import-all": GitHubSyncApp.onImportAll,
      "import-single": GitHubSyncApp.onImportSingle
    }
  };

  static PARTS = {
    main: {
      template: "modules/npc-people-foundry-sync/templates/sync-app.hbs"
    }
  };

  /** @override */
  async _prepareContext(options) {
    const moduleId = 'npc-people-foundry-sync';
    const lastSync = game.settings.get(moduleId, 'lastSync');
    
    return {
      lastSync: lastSync ? new Date(lastSync).toLocaleString() : game.i18n.localize("NPC_SYNC.UI.Never"),
      repo: game.settings.get(moduleId, 'repository'),
      folder: game.settings.get(moduleId, 'folderName'),
      results: this.results
    };
  }

  /**
   * Action: Push all local actors to GitHub
   */
  static async onPush(event, target) {
    await SyncManager.exportAll();
    this.render(true);
  }

  /**
   * Action: Check for updates on GitHub
   */
  static async onCheck(event, target) {
    ui.notifications.info(game.i18n.localize("NPC_SYNC.Notifications.Checking"));
    this.results = await SyncManager.checkRemoteUpdates();
    if (this.results) {
        this.results.hasChanges = (this.results.new?.length > 0 || this.results.modified?.length > 0);
    }
    this.render(true);
  }

  /**
   * Action: Import all pending changes
   */
  static async onImportAll(event, target) {
    if (!this.results || !this.results.remoteFiles) return;
    
    const token = game.settings.get('npc-people-foundry-sync', 'accessToken');
    const filesToImport = [...(this.results.new || []), ...(this.results.modified || [])];
    
    const count = await SyncManager.importFromRemote(filesToImport, token);
    ui.notifications.info(game.i18n.format("NPC_SYNC.Notifications.ImportComplete", { count }));
    
    this.results = null;
    this.render(true);
  }

  /**
   * Action: Import a single file (Keep Remote)
   */
  static async onImportSingle(event, target) {
    const path = target.dataset.path;
    const file = this.results.modified.find(f => f.path === path);
    if (!file) return;

    const token = game.settings.get('npc-people-foundry-sync', 'accessToken');
    await SyncManager.importFromRemote([file], token);
    
    // Remove from results list
    this.results.modified = this.results.modified.filter(f => f.path !== path);
    this.results.hasChanges = (this.results.new?.length > 0 || this.results.modified?.length > 0);
    
    this.render(true);
  }
}
