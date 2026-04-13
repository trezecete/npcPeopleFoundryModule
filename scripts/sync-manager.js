import { GitHubService } from './github-api.js';

/**
 * Main engine to process actors and manage sync state
 */
export class SyncManager {
  static MODULE_ID = 'npcPeopleFoundryModule';

  /**
   * Export all world actors to a format suitable for GitHub
   */
  static async exportAll() {
    const actors = game.actors.contents;
    const results = {
      success: [],
      failed: []
    };

    const repo = game.settings.get(this.MODULE_ID, 'repository');
    const folder = game.settings.get(this.MODULE_ID, 'folderName');
    const token = game.settings.get(this.MODULE_ID, 'accessToken');
    const remoteMetadata = game.settings.get(this.MODULE_ID, 'remoteMetadata') || {};

    if (!folder) {
      ui.notifications.error(game.i18n.localize("NPC_SYNC.Notifications.NoFolder"));
      return;
    }

    ui.notifications.info(game.i18n.format("NPC_SYNC.Notifications.SyncStart", { count: actors.length }));

    for (const actor of actors) {
      try {
        const data = actor.toObject();
        const filename = `${actor.id}.json`;
        const path = `${folder}/${filename}`;
        const sha = remoteMetadata[actor.id]?.sha;

        const response = await GitHubService.pushFile(repo, path, JSON.stringify(data, null, 2), sha, token);
        
        // Update local metadata with the new SHA
        remoteMetadata[actor.id] = {
          sha: response.content.sha,
          updatedAt: Date.now()
        };
        
        results.success.push(actor.name);
      } catch (e) {
        console.error(`${this.MODULE_ID} | Failed to sync actor ${actor.name}:`, e);
        results.failed.push(actor.name);
      }
    }

    await game.settings.set(this.MODULE_ID, 'remoteMetadata', remoteMetadata);
    await game.settings.set(this.MODULE_ID, 'lastSync', Date.now());

    ui.notifications.info(game.i18n.format("NPC_SYNC.Notifications.SyncComplete", { 
      success: results.success.length, 
      failed: results.failed.length 
    }));
  }

  /**
   * Check for updates on GitHub and return list of changes
   */
  static async checkRemoteUpdates() {
    const repo = game.settings.get(this.MODULE_ID, 'repository');
    const folder = game.settings.get(this.MODULE_ID, 'folderName');
    const token = game.settings.get(this.MODULE_ID, 'accessToken');
    const localMetadata = game.settings.get(this.MODULE_ID, 'remoteMetadata') || {};

    if (!folder || !token) return null;

    try {
      const remoteFiles = await GitHubService.getFiles(repo, folder, token);
      if (!remoteFiles) return { status: 'no_folder' };

      const updates = {
        new: [],
        modified: [],
        remoteFiles: remoteFiles // Store to avoid refetching
      };

      for (const file of remoteFiles) {
        if (!file.name.endsWith('.json')) continue;
        const actorId = file.name.replace('.json', '');
        const localActor = game.actors.get(actorId);

        if (!localActor) {
          updates.new.push(file);
        } else if (localMetadata[actorId]?.sha !== file.sha) {
          updates.modified.push(file);
        }
      }

      return updates;
    } catch (e) {
      console.error(`${this.MODULE_ID} | Error checking updates:`, e);
      return null;
    }
  }

  /**
   * Import a list of actors from GitHub
   */
  static async importFromRemote(filesToImport, token) {
    const remoteMetadata = game.settings.get(this.MODULE_ID, 'remoteMetadata') || {};
    let count = 0;

    for (const file of filesToImport) {
      try {
        const data = await GitHubService.getFileContent(file.download_url, token);
        const actorId = file.name.replace('.json', '');
        const existingActor = game.actors.get(actorId);

        if (existingActor) {
          await existingActor.update(data, { recursive: true, diff: false });
        } else {
          await Actor.create(data, { keepId: true });
        }

        remoteMetadata[actorId] = {
          sha: file.sha,
          updatedAt: Date.now()
        };
        count++;
      } catch (e) {
        console.error(`${this.MODULE_ID} | Failed to import ${file.name}:`, e);
      }
    }

    await game.settings.set(this.MODULE_ID, 'remoteMetadata', remoteMetadata);
    await game.settings.set(this.MODULE_ID, 'lastSync', Date.now());
    return count;
  }
}
