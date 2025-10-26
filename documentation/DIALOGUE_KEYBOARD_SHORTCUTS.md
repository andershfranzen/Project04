# Dialogue Keyboard Shortcuts

## Overview
This document describes the implementation of keyboard shortcuts for dialogue interactions in the RuneScape 2 (RS2) emulator web client. The system allows players to use the spacebar to skip simple dialogues and number keys (1-9) to select multiple choice dialogue options.

## Features
- **Spacebar**: Skip simple "Click here to continue" dialogues
- **Number Keys (1-9)**: Select multiple choice dialogue options
- **Smart Detection**: Only works when actually in dialogue interfaces
- **No Interference**: Doesn't affect right-click menus, hover menus, or other UI elements

## Technical Implementation

### How Dialogue Systems Work

#### 1. Simple Dialogues (Spacebar)
- **Trigger**: RuneScript calls `P_PAUSEBUTTON` opcode
- **Client State**: `ScriptState.PAUSEBUTTON` with `chatInterfaceId !== -1`
- **Action**: Send `ClientProt.RESUME_PAUSEBUTTON` packet
- **Detection**: Check if `chatInterfaceId !== -1`

#### 2. Multiple Choice Dialogues (Number Keys)
- **Trigger**: RuneScript calls `p_choice2()`, `p_choice3()`, etc. functions
- **Server Action**: Creates interface with `IF_OPENCHAT` opcode
- **Client State**: `chatInterfaceId` set to dialogue interface ID
- **Interface Structure**: Contains `type: 4, buttonType: 1` components for each choice
- **Action**: Send `ClientProt.IF_BUTTON` packet with component ID

### Interface Component Detection

#### Dialogue Choice Buttons
```typescript
// Primary detection method
if (child.type === 4 && child.buttonType === 1) {
    // This is a dialogue choice button
}

// Legacy detection method (for scripts)
if (child.scripts && child.scripts[0] === 465 || child.scripts[0] === 960) {
    // This is an IF_BUTTON component
}
```

#### Interface Structure Example
```
chatInterfaceId: 2459
├── Child 0: type: 4, buttonType: 0 (text component - "Select an Option")
├── Child 1: type: 4, buttonType: 1 (choice button 1)
├── Child 2: type: 4, buttonType: 1 (choice button 2)
├── Child 3: type: 0, buttonType: 0 (container)
└── Child 4: type: 0, buttonType: 0 (container)
```

### Key Detection Logic

#### Spacebar (Simple Dialogues)
```typescript
if (key === 32 && this.chatInterfaceId !== -1) {
    this.out.p1isaac(ClientProt.RESUME_PAUSEBUTTON);
    this.out.p2(0);
}
```

#### Number Keys (Multiple Choice)
```typescript
if (key >= 49 && key <= 57 && this.isInDialogueChoice()) {
    const choiceNumber = key - 48; // Convert to 1-9
    this.clickDialogueChoice(choiceNumber);
}
```

### Helper Methods

#### `isInDialogueChoice()`
Detects if the player is currently in a dialogue choice interface:
1. Check `stickyChatInterfaceId !== -1` (modal dialogues)
2. Check `chatInterfaceId !== -1` with choice buttons
3. Scan interface children for `type: 4, buttonType: 1` components

#### `hasChoiceButtons(chatInterface)`
Scans an interface for dialogue choice buttons:
1. Iterate through interface children
2. Look for `type: 4, buttonType: 1` components
3. Also check for legacy script-based buttons

#### `clickDialogueChoice(choiceNumber)`
Simulates clicking on a dialogue choice:
1. Find the nth choice button in the interface
2. Send `ClientProt.IF_BUTTON` packet with component ID
3. Works for both sticky and regular chat interfaces

## RuneScript Integration

### Server-Side (RuneScript)
```rs2
// Simple dialogue
mes("Hello there!");
P_PAUSEBUTTON; // Pauses for spacebar

// Multiple choice dialogue
def_int $choice = ~p_choice2("Option 1", 1, "Option 2", 2);
if ($choice = 1) {
    mes("You chose option 1!");
} else {
    mes("You chose option 2!");
}
```

### Client-Side (TypeScript)
```typescript
// Spacebar detection
if (key === 32 && this.chatInterfaceId !== -1) {
    this.out.p1isaac(ClientProt.RESUME_PAUSEBUTTON);
    this.out.p2(0);
}

// Number key detection
if (key >= 49 && key <= 57 && this.isInDialogueChoice()) {
    const choiceNumber = key - 48;
    this.clickDialogueChoice(choiceNumber);
}
```

## Debugging

### Common Issues
1. **Spacebar not working**: Check if `chatInterfaceId !== -1`
2. **Number keys not working**: Check if `isInDialogueChoice()` returns true
3. **Wrong choice selected**: Check interface component order and numbering

### Debug Logging
Add console.log statements to track:
- `chatInterfaceId` and `stickyChatInterfaceId` values
- Interface component structure (`type`, `buttonType`)
- Choice button detection results
- Click simulation success

## File Locations

### Client Implementation
- **Main Logic**: `webclient/src/client/Client.ts`
- **Keyboard Input**: `handleInputKey()` method
- **Helper Methods**: `isInDialogueChoice()`, `hasChoiceButtons()`, `clickDialogueChoice()`

### Server Implementation
- **RuneScript Handlers**: `engine/src/engine/script/handlers/PlayerOps.ts`
- **P_PAUSEBUTTON**: Line 381-383
- **IF_OPENCHAT**: Line 589-591

### Build Process
- **Development**: `bun run bundle.ts dev` (keeps console logs)
- **Production**: `bun run bundle.ts` (minifies, removes console logs)
- **Deploy**: Copy `out/*.js` to `engine/public/client/`

## Testing

### Test Cases
1. **Simple Dialogue**: Spacebar should advance text
2. **Multiple Choice**: Number keys should select options
3. **Right-Click Menu**: Shortcuts should not interfere
4. **Hover Menu**: Shortcuts should not interfere
5. **Non-Dialogue Interface**: Shortcuts should not work

### Test Scenarios
- Tutorial Island dialogue choices
- NPC conversation options
- Quest dialogue selections
- Bank interface interactions
- Inventory right-click menus

## Future Enhancements

### Potential Improvements
1. **Visual Indicators**: Show which number corresponds to which choice
2. **Customizable Keys**: Allow remapping of shortcut keys
3. **Accessibility**: Support for screen readers and keyboard navigation
4. **Mobile Support**: Touch-friendly dialogue selection
5. **Auto-Advance**: Option to automatically skip simple dialogues

### Technical Considerations
- Maintain compatibility with existing RuneScript
- Ensure no performance impact on dialogue rendering
- Preserve original mouse-click functionality
- Support for all dialogue types (NPC, quest, tutorial, etc.)

## Conclusion

The dialogue keyboard shortcuts system provides a significant quality-of-life improvement for players by allowing faster navigation through dialogues. The implementation is robust, detecting dialogue interfaces accurately while avoiding interference with other UI elements. The system works seamlessly with the existing RuneScript dialogue system and maintains full compatibility with mouse-based interactions.
