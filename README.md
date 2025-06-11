# Salvage Parts System

A web based interface for managing salvage parts and exploring them in a 3D scene. The project uses React, TypeScript and Tailwind CSS bundled with Vite.

## Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm**

Copy `.env.example` to `.env` and provide your Supabase credentials if you want to connect to a database.

## Installation

```bash
npm install
```

## Running the development server

```bash
npm run dev
```

Vite will start a dev server, usually at `http://localhost:5173`.

## Features

### Parts Manager

Manage your salvage inventory. Search, filter, add new parts and view statistics.

### Part Library Panel

Browse the entire part library. Supports grid, list and tree views, favorites and recent items. Parts can be dragged into the 3D viewer.

### Property Panel

Inspect and edit metadata, specifications and simulation settings for the selected part.

### Timeline Panel

Create animation tracks and keyframes, then play, pause or scrub through the timeline.

### Scene Controls Panel

Toggle grid or wireframe mode, enable measurements, exploded view and physics simulation.

### Annotation Panel

Add, edit and filter annotations attached to the 3D scene.

### 3D Viewer

Interact with parts in a real‑time scene. Panels can be docked or rearranged to suit your workflow.

## Contributing

1. Create a feature branch from `main` for your changes.
2. Follow the existing TypeScript + React style and run linting before committing:

   ```bash
   npm run lint
   ```

Pull requests are welcome!

## Deployment

Generate a production build with:

```bash
npm run build
```

The contents of `dist/` can be deployed to any static host. Ensure the required environment variables are set on the target platform.
