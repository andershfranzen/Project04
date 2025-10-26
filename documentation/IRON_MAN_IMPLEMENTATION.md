# Iron Man Mode Implementation

## Overview

Iron Man mode is a self-sufficient game mode where players cannot trade with other players. Players can opt into this mode during Tutorial Island or when skipping the tutorial, and the choice is permanent for that character.

## Features Implemented

### ✅ Database Schema
- Added `ironman` field to both `singleworld` and `multiworld` database schemas
- Field type: `Boolean` (default: `false`)
- Updated TypeScript types in `engine/src/db/types.ts`

### ✅ Content Scripts
- **VarPlayer Configuration**: Created `content/scripts/player/configs/ironman.varp`
- **Constants**: Created `content/scripts/player/configs/player.constant` with Iron Man values
- **Tutorial Integration**: Modified RuneScape Guide script to offer Iron Man selection
- **Tutorial Completion**: Added Iron Man selection for players who complete tutorial normally

### ✅ Engine Integration
- **Player Class**: Added `ironman: boolean = false` property to Player class
- **Login System**: Updated login server to pass Iron Man status from database
- **Player Loading**: Modified player loading to set Iron Man status from login data

### ✅ Trade Restrictions
- **RuneScript Level**: Added Iron Man checks in `trade.rs2` script
- **Engine Level**: Added Iron Man validation in `OpPlayerHandler.ts`
- **Error Messages**: 
  - "You are an Iron Man and cannot trade with other players."
  - "That player is an Iron Man and cannot accept trades."

### ✅ Admin Commands
- **`::ironman <username> <on|off>`**: Toggle Iron Man status (Admin level 3+)
- **`::checkironman <username>`**: Check Iron Man status (Moderator level 2+)

## How It Works

### Account Creation
1. **Tutorial Skip**: When skipping tutorial, players choose between Standard and Iron Man
2. **Tutorial Complete**: When completing tutorial normally, players choose account type
3. **Choice is Permanent**: Once selected, the choice cannot be changed (except by admins)

### Trade Blocking
1. **RuneScript Level**: Trade initiation is blocked in `trade.rs2`
2. **Engine Level**: Trade requests are blocked in `OpPlayerHandler.ts`
3. **Both Directions**: Iron Man cannot initiate trades, and others cannot trade with Iron Man

### Database Storage
- Iron Man status is stored in the `account` table
- Status is loaded during player login
- Status is synchronized with the `ironman` VarPlayer

## Installation Instructions

### 1. Apply Database Migration
```bash
# Stop the server first (Ctrl+C)
node apply_ironman_migration.js
```

### 2. Start the Server
```bash
bun start
```

### 3. Test the Implementation
1. Create a new character
2. Choose Iron Man mode during tutorial
3. Try to trade with another player (should be blocked)
4. Use admin commands to manage Iron Man status

## Admin Commands

### Toggle Iron Man Status
```
::ironman <username> <on|off>
```
- **Access**: Admin level 3+
- **Function**: Changes a player's Iron Man status
- **Example**: `::ironman TestPlayer on`

### Check Iron Man Status
```
::checkironman <username>
```
- **Access**: Moderator level 2+
- **Function**: Shows a player's Iron Man status
- **Example**: `::checkironman TestPlayer`

## Technical Details

### Database Schema
```sql
-- SQLite (singleworld)
ALTER TABLE account ADD COLUMN ironman INTEGER DEFAULT 0;

-- MySQL (multiworld)
ALTER TABLE account ADD COLUMN ironman BOOLEAN DEFAULT false;
```

### VarPlayer Configuration
```
[ironman]
scope=perm
```

### Constants
```
^ironman_disabled = 0
^ironman_enabled = 1
```

## Files Modified

### Database
- `engine/prisma/singleworld/schema.prisma`
- `engine/prisma/multiworld/schema.prisma`
- `engine/src/db/types.ts`

### Content Scripts
- `content/scripts/player/configs/ironman.varp` (new)
- `content/scripts/player/configs/player.constant` (new)
- `content/scripts/tutorial/scripts/guides/runescape_guide.rs2`
- `content/scripts/tutorial/scripts/tutorial.rs2`
- `content/scripts/interface_trade/scripts/trade.rs2`

### Engine Code
- `engine/src/engine/entity/Player.ts`
- `engine/src/server/login/LoginServer.ts`
- `engine/src/server/login/LoginThread.ts`
- `engine/src/engine/World.ts`
- `engine/src/network/game/client/handler/OpPlayerHandler.ts`
- `engine/src/network/game/client/handler/ClientCheatHandler.ts`

## Testing Checklist

- [ ] Create new character and choose Iron Man mode
- [ ] Create new character and choose Standard mode
- [ ] Test trade blocking (Iron Man cannot trade)
- [ ] Test trade blocking (others cannot trade with Iron Man)
- [ ] Test admin commands (`::ironman`, `::checkironman`)
- [ ] Test persistence across login/logout
- [ ] Test tutorial skip with Iron Man selection
- [ ] Test tutorial completion with Iron Man selection

## Future Enhancements

1. **Iron Man Leaderboards**: Separate hiscores for Iron Man accounts
2. **Iron Man Badge**: Visual indicator on character examine
3. **De-Iron Option**: Allow players to remove Iron Man status (one-way)
4. **Hardcore Iron Man**: Permadeath variant
5. **Ultimate Iron Man**: No banking allowed
6. **Group Iron Man**: Shared storage with group members only

## Troubleshooting

### Database Migration Issues
- **Error**: "database is locked"
  - **Solution**: Stop the server first, then run the migration script
- **Error**: "duplicate column name"
  - **Solution**: Migration already applied, no action needed

### Trade Not Blocked
- **Check**: Ensure both RuneScript and engine-level checks are in place
- **Verify**: Iron Man status is properly set in database and VarPlayer

### Admin Commands Not Working
- **Check**: User has appropriate staffmodlevel (2+ for check, 3+ for toggle)
- **Verify**: Commands are properly added to ClientCheatHandler.ts

## Rollback Plan

If issues arise, you can rollback by:

1. **Remove Iron Man checks from trade scripts**
2. **Remove Iron Man validation from engine code**
3. **Remove admin commands**
4. **Set all `ironman` flags to `false` in database**
5. **Remove database column** (if needed)

## Support

For issues or questions about the Iron Man implementation, check:
1. Server logs for error messages
2. Database for correct Iron Man status
3. VarPlayer values for synchronization issues
4. Admin command permissions and syntax
