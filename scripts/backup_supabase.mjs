/**
 * Supabase Database Backup Script
 * Uses Supabase API to export all tables to JSON format
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment');
    console.error('Get Service Role Key from: https://supabase.com/dashboard/project/lfibaygcxftjdkmuigim/settings/api');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// List of tables to backup
const TABLES = [
    'cashflow_scenarios',
    'categories',
    'profit_timer_calculations',
    'reports'
];

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

    const backup = {
        timestamp: new Date().toISOString(),
        database: 'postgres',
        supabase_url: SUPABASE_URL,
        tables: {}
    };

    console.log(`Backing up ${TABLES.length} tables...`);

    for (const tableName of TABLES) {
        console.log(`  - Exporting ${tableName}...`);

        const { data, error } = await supabase
            .from(tableName)
            .select('*');

        if (error) {
            console.warn(`    Warning: Could not export ${tableName}: ${error.message}`);
            backup.tables[tableName] = { error: error.message };
        } else {
            backup.tables[tableName] = data;
            console.log(`    ✓ Exported ${data.length} rows`);
        }
    }

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`\n✓ Backup completed: ${backupFile}`);
    console.log(`  Size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);

    // Summary
    console.log('\nBackup summary:');
    let totalRows = 0;
    Object.keys(backup.tables).forEach(table => {
        const data = backup.tables[table];
        if (data.error) {
            console.log(`  - ${table}: ERROR - ${data.error}`);
        } else {
            console.log(`  - ${table}: ${data.length} rows`);
            totalRows += data.length;
        }
    });
    console.log(`\nTotal: ${totalRows} rows backed up`);
}

backupDatabase().catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
});
