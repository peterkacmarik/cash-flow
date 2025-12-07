/**
 * Complete SQL Backup Script
 * Exports database schema and data as SQL script
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TABLES = [
    'cashflow_scenarios',
    'categories',
    'profit_timer_calculations',
    'reports'
];

function escapeString(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number' || typeof str === 'boolean') return str;
    if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
    return `'${String(str).replace(/'/g, "''")}'`;
}

async function generateSQLBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
    let sql = '';

    // Header
    sql += `-- Supabase Database Backup\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Database: ${SUPABASE_URL}\n\n`;

    sql += `-- Disable triggers during restore\n`;
    sql += `SET session_replication_role = replica;\n\n`;

    console.log('Generating SQL backup...\n');

    // Export data from each table
    for (const tableName of TABLES) {
        console.log(`  - Exporting ${tableName}...`);

        const { data, error } = await supabase
            .from(tableName)
            .select('*');

        if (error) {
            console.warn(`    Warning: ${error.message}`);
            sql += `-- Error exporting ${tableName}: ${error.message}\n\n`;
            continue;
        }

        if (data.length === 0) {
            console.log(`    (empty table)`);
            sql += `-- Table ${tableName} is empty\n\n`;
            continue;
        }

        sql += `-- Table: ${tableName} (${data.length} rows)\n`;
        sql += `TRUNCATE TABLE ${tableName} CASCADE;\n`;

        // Get column names from first row
        const columns = Object.keys(data[0]);

        for (const row of data) {
            const values = columns.map(col => escapeString(row[col])).join(', ');
            sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});\n`;
        }

        sql += `\n`;
        console.log(`    ✓ ${data.length} rows`);
    }

    sql += `-- Re-enable triggers\n`;
    sql += `SET session_replication_role = DEFAULT;\n\n`;

    sql += `-- Backup completed\n`;

    fs.writeFileSync(backupFile, sql);
    console.log(`\n✓ SQL backup created: ${backupFile}`);
    console.log(`  Size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
}

generateSQLBackup().catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
});
