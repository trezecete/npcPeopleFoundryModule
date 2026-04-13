# NPC People Foundry Sync (Foundry VTT v13)

![Foundry VTT Version](https://img.shields.io/badge/Foundry-v13-blue)
![GitHub Release](https://img.shields.io/github/v/release/trezecete/npcPeopleFoundryModule)

This module allows you to synchronize and share Actors across multiple Foundry VTT game worlds using a central GitHub repository.

## 🚀 Features

- **Full World Sync**: Export all actors from your current world to a GitHub repository.
- **Shared Library**: Use the same repository to populate multiple worlds with the same NPCs.
- **Sync Manager**: A modern UI to manage pushes, pulls, and conflict resolution.
- **Auto-Check**: Automatically notifies the GM on world load if updates are available on GitHub.
- **Conflict Resolution**: Choose nominal versions (Local vs. Remote) when data differs.

## 🛠️ Installation

You can install the module using the following manifest URL:
`https://github.com/trezecete/npcPeopleFoundryModule/releases/latest/download/module.json`

## ⚙️ Configuration

1. Go to **Configure Settings** > **Module Settings** > **NPC People Foundry Sync**.
2. **GitHub Repository**: Set your target repository (e.g., `trezecete/npcPeopleFoundry`).
3. **Target Folder**: Name the folder for this specific world (e.g., `campaign_1`).
4. **Access Token (PAT)**: Provide a GitHub Personal Access Token with `repo` permissions.

## 🔄 How to Use

1. Click the **Sync GitHub** button at the top of the **Actors Directory**.
2. To save your actors to GitHub, click **Push All Local to GitHub**.
3. To get updates from other worlds, click **Check for GitHub Updates** then **Import All Changes**.

## ⚖️ License

Made by [trezecete](https://github.com/trezecete).
