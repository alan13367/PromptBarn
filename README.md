# PromptBarn

PromptBarn is an offline-first desktop application designed for secure, local storage and management of AI prompts. It provides a structured environment to organize, edit, and instantly reuse prompts without relying on cloud synchronization, ensuring your data remains entirely on your machine.

## Features

- **Offline-First Architecture**: All data is stored locally using SQLite. No accounts, no cloud sync, and no external dependencies.
- **Variable Injection**: Automatically detects and provides input fields for variables (e.g., `{{variable}}`) within your prompts for rapid template reuse.
- **Categorization and Tagging**: Organize prompts into distinct categories and apply multiple tags for granular filtering.
- **Advanced Search**: Built-in full-text search capabilities utilizing SQLite FTS5 for instantaneous retrieval of prompts across titles, descriptions, and body content.
- **Secure by Default**: Built on a hardened Electron foundation with strict context isolation, sandboxing enabled, and node integration disabled in the renderer process.
- **Import and Export**: Fully portable JSON-based import and export functionality for backup and sharing.

## Technology Stack

- **Framework**: Electron, React
- **Build System**: electron-vite, Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: SQLite (`better-sqlite3`)
- **Validation**: Zod

## Development Setup

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

### Build and Package

To run type checking and build the application:

```bash
npm run build
```

To package the application into a distributable binary for your operating system:

```bash
npm run package
```

*Note: `better-sqlite3` is a native dependency. The `postinstall` script automatically runs `electron-builder install-app-deps` to ensure it is correctly compiled for the Electron runtime.*

## Architecture Guidelines

- **Main Process (`src/main`)**: Handles all native operating system interactions, window management, and SQLite database operations.
- **Renderer Process (`src/renderer`)**: Houses the React frontend. It strictly avoids direct access to Node.js APIs or the filesystem.
- **IPC Interface (`src/preload` & `src/main/ipc`)**: Communication between the renderer and main processes is strictly typed and routed through a dedicated preload script (`window.promptBarn`), enforcing a secure boundary.

## License

This project is licensed under the MIT License.
