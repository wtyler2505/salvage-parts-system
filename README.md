# Salvage Parts System (Android)

An Android application built with **Kotlin**, **Jetpack Compose (Material 3)**, and **Room Database** for managing 3D salvage parts inventory, CAD model inspection, point-to-point 3D measurements, annotations, and multi-physics simulation.

## Key Features

- **Parts Inventory Manager**:
  - Search by part name, manufacturer, model, OEM part number, location, category, or tag.
  - Filter by condition (`New`, `Used`, `Salvaged`, `Broken`), category, and favorites.
  - Switch between adaptive Grid and List views.
  - Full 5-tab Part Editor (`Metadata`, `Specifications`, `3D Model`, `Documentation`, `Simulation`) with duplicate, delete, and undo/redo support.
- **Interactive 3D CAD & Simulation Viewport**:
  - Real-time 3D perspective projection with drag-to-orbit rotation, camera reset, and infinite reference grid.
  - Render modes: `Normal` (Shaded), `Wireframe`, `X-Ray`, and `Exploded` assembly view with continuous `Explode Factor` slider (`0.0x` – `2.0x`).
  - Interactive 2-point 3D Euclidean distance measurement tool (`mm`) and 3D surface inspection annotations.
  - Multi-physics simulation toggles (`Rigid-Body Gravity & Restitution`, `Electrical Current Flow`, `Thermal Dissipation Heatmap`).
  - Keyframe animation timeline scrubber (`0.0s` – `10.0s`) with play/pause and turntable yaw automation.
- **Inventory Analytics & Valuation Dashboard**:
  - Summary KPIs for Total Parts, Total Value ($ USD), Categories, and Average Part Value.
  - Condition distribution progress bars, Category breakdown, and Valuation Tier distribution.
- **Adaptive Material 3 Layout**:
  - Bottom `NavigationBar` on compact screens and `NavigationRail` + supporting `InspectorScreen` pane on tablets/foldables.

## Architecture & Tech Stack

- **UI**: Jetpack Compose, Material Design 3, Adaptive Window Size layout
- **Architecture**: MVVM (`SalvageViewModel` + `StateFlow` + `PartRepository`)
- **Persistence**: Room SQLite Database (`SalvageDatabase`, `PartDao`) with Kotlinx Serialization JSON payload support
- **Build System**: Gradle Kotlin DSL (`build.gradle.kts`, `gradle/libs.versions.toml`), Secrets Gradle Plugin
