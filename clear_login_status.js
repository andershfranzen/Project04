const Database = require('better-sqlite3');
const fs = require('fs');

console.log('Clearing all login statuses...');

try {
    const dbPath = 'engine/db.sqlite';
    
    // Check if database exists
    if (!fs.existsSync(dbPath)) {
        console.log('Database not found at:', dbPath);
        process.exit(1);
    }

    // Open database
    const db = new Database(dbPath);
    
    // Get current login status
    const before = db.prepare("SELECT COUNT(*) as count FROM account_login WHERE logged_in > 0").get();
    console.log(`Before: ${before.count} accounts marked as logged in`);
    
    // Clear all login statuses
    const result = db.prepare("UPDATE account_login SET logged_in = 0, login_time = NULL WHERE logged_in > 0").run();
    
    // Get after status
    const after = db.prepare("SELECT COUNT(*) as count FROM account_login WHERE logged_in > 0").get();
    console.log(`After: ${after.count} accounts marked as logged in`);
    console.log(`Updated ${result.changes} records`);
    
    db.close();
    console.log('✅ Login statuses cleared successfully!');
    
} catch (error) {
    console.error('❌ Error clearing login statuses:', error.message);
    process.exit(1);
}
