/**
 * Service to handle communications with GitHub REST API
 */
export class GitHubService {
  static BASE_URL = 'https://api.github.com';

  /**
   * Fetch file list from a repository branch/folder
   */
  static async getFiles(repo, folder, token) {
    if (!token) throw new Error("GitHub Access Token is missing.");
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };
    
    const response = await fetch(url, { headers });

    if (response.status === 401 || response.status === 403) {
      throw new Error("NPC_SYNC.Errors.AuthFailed");
    }

    return await response.json();
  }

  /**
   * Fetch a specific file content (already decoded if using JSON format)
   */
  static async getFileContent(downloadUrl, token) {
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to download file content.");
    return await response.json();
  }

  /**
   * Create or update a file in the repository
   * @param {string} repo - owner/repo
   * @param {string} path - path to file
   * @param {string} content - JSON string
   * @param {string} sha - SHA of the existing file (if update)
   * @param {string} token - GitHub PAT
   */
  static async pushFile(repo, path, content, sha, token) {
    const url = `${this.BASE_URL}/repos/${repo}/contents/${path}`;
    const body = {
      message: `Sync actor: ${path}`,
      content: b64EncodeUnicode(content),
    };
    if (sha) body.sha = sha;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.status === 401 || response.status === 403) {
       throw new Error("NPC_SYNC.Errors.AuthFailed");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to push file to GitHub.");
    }

    return await response.json();
  }
}

/**
 * UTF-8 safe Base64 encoding
 */
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}
