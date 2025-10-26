# Lost City Codebase Documentation

## Project Overview

**Lost City** is a reverse-engineered RuneScape 2 (RS2) server emulator that accurately simulates the game as it existed in 2004. The project aims to recreate the exact cycle behaviors, game mechanics, and content from early RS2 builds (revisions 225, 244, and 245.2).

### Key Dates
- **Revision 225**: May 18, 2004
- **Revision 244**: June 28, 2004  
- **Revision 245.2**: July 13, 2004

## Repository Structure

This is a **meta-repository** that orchestrates four separate sub-projects:

### 1. **Engine** (`engine/`)
The TypeScript-based game server engine that handles all game logic, networking, and data processing.

### 2. **Content** (`content/`)
Game data including scripts, configurations, assets, and media files.

### 3. **Web Client** (`webclient/`)
Modern TypeScript port of the original client for web browsers (available for revisions 225, 244, 245.2).

### 4. **Java Client** (`javaclient/`)
Decompiled and fixed version of the original Java applet client with OS/Java compatibility improvements.

## Core Technologies

- **Runtime**: Bun 1.2 (JavaScript/TypeScript runtime)
- **Language**: TypeScript 5
- **Database**: SQLite (single-world) or MySQL (multi-world via Prisma)
- **Networking**: WebSocket and TCP
- **Scripting**: Custom RuneScript language (`.rs2` files)
- **Build Tool**: Custom packing system + Java compiler for scripts

## Engine Architecture

### Entry Point (`start.ts`)
Interactive CLI menu system that:
- Clones required repositories based on selected revision
- Manages server startup, updates, and client launching
- Handles version switching

### Main Application (`engine/src/app.ts`)
Bootstrap sequence:
1. Updates RuneScript compiler if needed
2. Packs client/server data on first run
3. Spawns worker threads (login, friend, logger)
4. Initializes World
5. Starts TCP and Web servers
6. Sets up Prometheus metrics

### World System (`engine/src/engine/World.ts`)
Central game loop manager:
- **Tick Rate**: 600ms (0.6 seconds)
- Manages players (up to `NODE_MAX_PLAYERS`)
- Manages NPCs (up to `NODE_MAX_NPCS`)
- Handles zones, inventories, and entity lifecycle
- Processes login/logout queues
- Executes game scripts

### Script System
**RuneScript** (`.rs2`) - Custom scripting language for game content:
- Commands defined in `content/scripts/engine.rs2`
- Compiled by `RuneScriptCompiler.jar` (Neptune compiler)
- Executed by `ScriptRunner.ts` with opcode handlers
- Supports triggers: player actions, NPC AI, object interactions, timers

**Handler Categories**:
- CoreOps, ServerOps, PlayerOps, NpcOps, LocOps, ObjOps
- InvOps, EnumOps, StringOps, NumberOps, DbOps

### Networking

**TCP Server** (`engine/src/server/tcp/`):
- Traditional socket-based connections
- Port configurable via environment

**WebSocket Server** (`engine/src/web.ts`):
- Port 8888 (default)
- Serves game cache files (`/crc`, `/title`, `/config`, etc.)
- Serves web client static files
- Handles WebSocket game connections

**Protocol**:
- Client/Server message handlers in `engine/src/network/game/`
- Isaac cipher for packet encryption
- RSA for login handshake

### Worker Threads
Three background services:
1. **Login Thread**: Handles authentication, account management, 2FA
2. **Friend Thread**: Manages friends list, private messages
3. **Logger Thread**: Tracks events, wealth transactions, session logs

### Database Schema

**Single World** (`prisma/singleworld/schema.prisma`):
- SQLite-based
- Tables: account, account_login, session, login, ipban, account_session, account_event

**Multi World** (`prisma/multiworld/schema.prisma`):
- MySQL-based
- Same schema as single world but supports distributed architecture

## Content Structure

### Scripts (`content/scripts/`)
Over 1,200 `.rs2` script files organized by category:

**Skills**: agility, combat, cooking, crafting, firemaking, fishing, fletching, herblore, magic, mining, prayer, runecraft, smithing, thieving, woodcutting

**Quests**: 50+ quests including Cook's Assistant, Dragon Slayer, Desert Treasure, etc.

**Systems**: tutorial, bank, trade, shop, doors, ladders, login/logout, levelup

**Minigames**: Various minigame implementations

### Configuration Files
Multiple config types (packed into `.pack` files):
- `.npc` - NPC definitions
- `.obj` - Object/item definitions  
- `.loc` - Location/scenery definitions
- `.seq` - Animation sequences
- `.spotanim` - Spot animations
- `.if` - Interface definitions
- `.varp` / `.varn` / `.vars` - Variables
- `.enum` / `.dbtable` / `.dbrow` - Data structures
- `.constant` - Named constants

### Assets (`content/`)
- **models/**: 3D models (`.ob2`) and animations (`.anim`)
- **maps/**: Map data (`.jm2` files), multiway zones, F2P areas
- **jingles/**: Level-up and event music (`.mid`)
- **songs/**: Background music (`.mid`)
- **sprites/**: UI graphics (`.png`)
- **textures/**: 3D textures (`.png`)
- **synth/**: Sound effects (`.synth`)
- **fonts/**: Font data (`.png`)

### Pack System (`content/pack/`)
Pre-compiled binary cache files:
- `script.pack` - Compiled RuneScripts
- `npc.pack`, `obj.pack`, `loc.pack` - Game configs
- `model.pack` - 3D models
- `map.pack` - Map data
- `interface.pack` - UI definitions

## Build Process

### Packing (`engine/tools/pack/`)
Converts human-readable content into binary cache format:
1. **PackAll.ts**: Orchestrates client and server packing
2. **Config packers**: Process `.npc`, `.obj`, `.loc`, etc.
3. **Graphics packer**: Processes sprites, textures, models
4. **Script compiler**: Compiles `.rs2` to bytecode
5. **Map packer**: Processes terrain data

**Output**: `engine/data/pack/` (client and server caches)

### Unpacking (`engine/tools/unpack/`)
Reverse process for debugging and research

## Web Client (`webclient/`)

TypeScript reimplementation of the original client:
- Canvas-based 3D rendering
- WebSocket networking
- MIDI audio playback
- Built with `bundle.ts` script
- Output: `client.js` and `deps.js`

## Java Client (`javaclient/`)

Gradle-based project:
- Deobfuscated original client code
- Package structure mirrors original: `jagex2.client`, `jagex2.config`, `jagex2.dash3d`, etc.
- Runs with: `gradlew run --args="10 0 highmem members 32"`

## Development Workflow

### Starting the Server
```bash
bun start.ts
```
Interactive menu provides options:
- Start Server
- Update Source (git pull all repos)
- Run Web/Java Client
- Advanced Options (dev mode, clean build, version change)

### Content Development
```bash
cd engine
bun start
```
Server watches for changes to scripts/configs and automatically repacks.

### Engine Development  
```bash
cd engine
bun dev
```
Watches TypeScript files and restarts server on changes.

### Environment Configuration
First run triggers setup via `engine/tools/server/setup.ts`:
- Creates `.env` file
- Configures database
- Sets ports, debug flags, etc.

## Key Features

### Game Systems
- **Combat**: Melee, ranged, magic with special attacks
- **Skills**: All 18 RS2 skills implemented
- **Quests**: 50+ quests with full dialogue trees
- **Trading**: Player-to-player trading
- **Banking**: Item storage system
- **Shops**: NPC vendors with stock management
- **Prayer**: Prayer system with drain rates
- **PvP**: Player vs player combat with skulling

### Technical Features
- **Pathfinding**: `@2004scape/rsmod-pathfinder` library
- **Collision**: Full collision detection for players, NPCs, objects
- **Zones**: 8x8 tile zones for efficient entity management
- **Instancing**: Support for instanced areas
- **Metrics**: Prometheus metrics for monitoring
- **Logging**: Comprehensive event and wealth tracking
- **Word Filter**: Profanity and domain filtering

## Configuration

### Server Config (`server.json`)
```json
{
  "rev": "245.2"
}
```

### Environment Variables (`.env`)
- Database connection strings
- Port numbers
- Debug flags
- Node ID for multi-world
- Max players/NPCs

### Neptune Config (`engine/neptune.toml`)
RuneScript compiler configuration:
- Source paths
- Symbol paths  
- Output directory
- Pointer checking

## License

- **Source Code**: MIT License
- **Assets**: Intellectual property of Jagex Ltd (included for historical preservation)

## Dependencies

**Required**:
- Git CLI
- Node.js 22
- Java 17+
- Bun 1.2

**Optional**:
- VS Code with RuneScript extension

This codebase represents a comprehensive historical preservation and reverse-engineering effort to accurately recreate RuneScape 2 as it existed in mid-2004.
