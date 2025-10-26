# Tutorial Skip Guide

This guide explains how to skip Tutorial Island in Lost City for all users.

## Changes Made

### 1. Modified Tutorial Script
**File**: `content/scripts/tutorial/scripts/guides/runescape_guide.rs2`

- **Before**: Tutorial skip was only available in development mode (`map_production = false`)
- **After**: Tutorial skip is now available to all users regardless of server mode

### 2. Added Admin Command
**File**: `engine/src/network/game/client/handler/ClientCheatHandler.ts`

- **Command**: `::skiptutorial`
- **Access Level**: Admin/Moderator (staffmodlevel >= 2)
- **Function**: Instantly sets tutorial progress to complete

### 3. Added General Command
**File**: `engine/src/network/game/client/handler/ClientCheatHandler.ts`

- **Command**: `::skiptutorial`
- **Access Level**: All users
- **Function**: Instantly sets tutorial progress to complete

## How to Use

### Method 1: In-Game Skip Option
1. Start a new character
2. Talk to the **RuneScape Guide** (first NPC on Tutorial Island)
3. When asked "Do you want to skip the tutorial?", choose **"Yes please."**
4. You'll be teleported to Lumbridge with starter items

### Method 2: Admin Command
1. Log in as an admin user
2. Type: `::skiptutorial`
3. You'll receive confirmation: "Tutorial skipped! You can now access the mainland."

### Method 3: General Command
1. Log in as any user
2. Type: `::skiptutorial`
3. You'll receive confirmation: "Tutorial skipped! You can now access the mainland."

## What Happens When You Skip

When you skip the tutorial, the following occurs:

1. **Tutorial Progress**: Set to `^tutorial_complete` (value 1000)
2. **Location**: Teleported to Lumbridge (coordinates 50,50,22,22)
3. **Inventory**: Cleared and filled with starter items:
   - Bronze axe, tinderbox, net, shrimp, empty bucket, empty pot, bread
   - Bronze pickaxe, bronze dagger, bronze sword, wooden shield
   - Shortbow, 25 bronze arrows
   - 25 air runes, 15 mind runes, 6 water runes, 4 earth runes, 2 body runes
4. **Bank**: Cleared and given 25 coins
5. **Skills**: Reset to default levels
6. **Interface**: All tabs initialized

## Technical Details

- **Tutorial Variable**: `%tutorial` is set to `^tutorial_complete` (1000)
- **Database**: Changes are saved to the player's save file
- **Persistence**: Skip status is permanent for that character
- **Compatibility**: Works with both single-world and multi-world setups

## Reverting Changes

If you want to restore the original behavior (tutorial skip only in development mode):

1. Revert `content/scripts/tutorial/scripts/guides/runescape_guide.rs2`:
   ```rs2
   [label,newbie_basics_instructor_welcome]
   if (map_production = false) {
       ~chatnpc("<p,neutral>Do you want to skip the tutorial?");
       def_int $choice = ~p_choice2("Yes please.", 1, "No, thank you.", 2);
       if ($choice = 1) {
           %tutorial = ^tutorial_complete;
           @tutorial_complete;
       }
   }
   ```

2. Remove the `::skiptutorial` commands from `ClientCheatHandler.ts`

## Notes

- The tutorial skip option appears immediately when talking to the RuneScape Guide
- No admin privileges required for the in-game skip option
- The `::skiptutorial` command works from anywhere in the game
- All methods achieve the same result - completing the tutorial instantly
