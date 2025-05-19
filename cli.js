#!/usr/bin/env node

/**
 * coda-mcp-client CLI
 * Command-line interface for Coda API operations
 * 
 * Developed by Ryan Scott at The Developers (https://thedevelopers.dev)
 */

const CodaClient = require('./index');

function showUsage() {
    console.log(`
🔧 Coda MCP Client CLI
Usage: coda-mcp <command> [args...]

📄 Document Operations:
  list-docs                           - List all accessible docs
  get-doc <docId>                     - Get document details
  find-doc <name>                     - Find document by name

📊 Table Operations:  
  list-tables <docId>                 - List tables in a doc
  get-table <docId> <tableId>         - Get table details
  find-table <docId> <name>           - Find table by name
  create-table <docId> <table-json>   - Create new table

📋 Row Operations:
  list-rows <docId> <tableId> [limit] - List rows in a table
  get-row <docId> <tableId> <rowId>   - Get specific row
  insert-row <docId> <tableId> <cells-json> - Insert new row
  update-row <docId> <tableId> <rowId> <cells-json> - Update row
  delete-row <docId> <tableId> <rowId> - Delete row
  search-rows <docId> <tableId> <column> <value> - Search rows

📄 Page Operations:
  list-pages <docId>                  - List pages in a doc
  get-page <docId> <pageId>           - Get page details
  create-page <docId> <page-json>     - Create new page
  update-page-content <docId> <pageId> <content> [mode] [format] - Update page content
  update-page-metadata <docId> <pageId> <metadata-json> - Update page metadata

🔧 Column Operations:
  list-columns <docId> <tableId>      - List columns in a table

Examples:
  coda-mcp list-docs
  coda-mcp find-doc "My Project"
  coda-mcp list-rows doc123 grid456 10
  coda-mcp insert-row doc123 grid456 '{"Name":"John","Status":"Active"}'
  coda-mcp create-page doc123 '{"name":"New Page","subtitle":"Created via CLI"}'

Environment:
  CODA_API_KEY - Your Coda API key (required)

Get your API key: https://coda.io/account
    `);
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    // Check for API key
    const apiKey = process.env.CODA_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: CODA_API_KEY environment variable not set');
        console.error('');
        console.error('To get your API key:');
        console.error('1. Go to https://coda.io/account');
        console.error('2. Generate an API token');
        console.error('3. Run: export CODA_API_KEY="your-api-key"');
        process.exit(1);
    }

    const client = new CodaClient(apiKey);
    const command = args[0];
    const commandArgs = args.slice(1);

    try {
        switch (command) {
            // Document Operations
            case 'list-docs':
                const docs = await client.listDocs();
                console.log(`📄 Found ${docs.length} docs:`);
                docs.forEach(doc => {
                    console.log(`  • ${doc.name} (${doc.id})`);
                    console.log(`    URL: ${doc.browserLink}`);
                    console.log('');
                });
                break;

            case 'get-doc':
                if (!commandArgs[0]) throw new Error('Missing docId parameter');
                const doc = await client.getDoc(commandArgs[0]);
                console.log(`📄 Document: ${doc.name}`);
                console.log(`   ID: ${doc.id}`);
                console.log(`   URL: ${doc.browserLink}`);
                console.log(`   Created: ${doc.createdAt}`);
                console.log(`   Updated: ${doc.updatedAt}`);
                break;

            case 'find-doc':
                if (!commandArgs[0]) throw new Error('Missing doc name parameter');
                const foundDoc = await client.findDocByName(commandArgs[0]);
                if (foundDoc) {
                    console.log(`📄 Found doc: ${foundDoc.name}`);
                    console.log(`   ID: ${foundDoc.id}`);
                    console.log(`   URL: ${foundDoc.browserLink}`);
                } else {
                    console.log(`❌ No doc found matching: ${commandArgs[0]}`);
                }
                break;

            // Table Operations
            case 'list-tables':
                if (!commandArgs[0]) throw new Error('Missing docId parameter');
                const tables = await client.listTables(commandArgs[0]);
                console.log(`📊 Found ${tables.length} tables:`);
                tables.forEach(table => {
                    console.log(`  • ${table.name} (${table.id})`);
                    console.log(`    Type: ${table.tableType}, Rows: ${table.rowCount || 'N/A'}`);
                    console.log('');
                });
                break;

            case 'get-table':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or tableId parameter');
                const table = await client.getTable(commandArgs[0], commandArgs[1]);
                console.log(`📊 Table: ${table.name}`);
                console.log(`   ID: ${table.id}`);
                console.log(`   Type: ${table.tableType}`);
                console.log(`   Rows: ${table.rowCount || 'N/A'}`);
                break;

            case 'find-table':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or table name parameter');
                const foundTable = await client.findTableByName(commandArgs[0], commandArgs[1]);
                if (foundTable) {
                    console.log(`📊 Found table: ${foundTable.name}`);
                    console.log(`   ID: ${foundTable.id}`);
                    console.log(`   Type: ${foundTable.tableType}`);
                    console.log(`   Rows: ${foundTable.rowCount || 'N/A'}`);
                } else {
                    console.log(`❌ No table found matching: ${commandArgs[1]}`);
                }
                break;

            case 'create-table':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or table-json parameter');
                const tableData = JSON.parse(commandArgs[1]);
                const tableResult = await client.createTable(commandArgs[0], tableData);
                console.log(`✅ Table created successfully`);
                console.log(`   ID: ${tableResult.id}`);
                console.log(`   Name: ${tableResult.name}`);
                break;

            // Row Operations
            case 'list-rows':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or tableId parameter');
                const options = { useColumnNames: true };
                if (commandArgs[2]) options.limit = parseInt(commandArgs[2]);
                
                const rows = await client.listRows(commandArgs[0], commandArgs[1], options);
                console.log(`📋 Found ${rows.length} rows:`);
                rows.forEach((row, index) => {
                    console.log(`\\n  Row ${index + 1} (ID: ${row.id}):`);
                    if (row.values) {
                        Object.entries(row.values).forEach(([column, value]) => {
                            console.log(`    ${column}: ${JSON.stringify(value)}`);
                        });
                    }
                });
                break;

            case 'get-row':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2]) {
                    throw new Error('Missing docId, tableId, or rowId parameter');
                }
                const row = await client.getRow(commandArgs[0], commandArgs[1], commandArgs[2]);
                console.log(`📋 Row details (ID: ${row.id}):`);
                if (row.values) {
                    Object.entries(row.values).forEach(([column, value]) => {
                        console.log(`  ${column}: ${JSON.stringify(value)}`);
                    });
                }
                break;

            case 'search-rows':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2] || !commandArgs[3]) {
                    throw new Error('Missing parameters: docId, tableId, column, value');
                }
                const searchResults = await client.searchRows(commandArgs[0], commandArgs[1], commandArgs[2], commandArgs[3]);
                console.log(`🔍 Found ${searchResults.length} matching rows:`);
                searchResults.forEach((row, index) => {
                    console.log(`\\n  Match ${index + 1} (ID: ${row.id}):`);
                    if (row.values) {
                        Object.entries(row.values).forEach(([column, value]) => {
                            console.log(`    ${column}: ${JSON.stringify(value)}`);
                        });
                    }
                });
                break;

            case 'insert-row':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2]) {
                    throw new Error('Missing parameters: docId, tableId, cells-json');
                }
                const cells = JSON.parse(commandArgs[2]);
                const insertResult = await client.insertRow(commandArgs[0], commandArgs[1], cells);
                console.log(`✅ Row inserted successfully`);
                console.log(`   ID: ${insertResult.addedRowIds?.[0] || 'N/A'}`);
                break;

            case 'update-row':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2] || !commandArgs[3]) {
                    throw new Error('Missing parameters: docId, tableId, rowId, cells-json');
                }
                const updateCells = JSON.parse(commandArgs[3]);
                await client.updateRow(commandArgs[0], commandArgs[1], commandArgs[2], updateCells);
                console.log(`✅ Row updated successfully`);
                break;

            case 'delete-row':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2]) {
                    throw new Error('Missing parameters: docId, tableId, rowId');
                }
                await client.deleteRow(commandArgs[0], commandArgs[1], commandArgs[2]);
                console.log(`✅ Row deleted successfully`);
                break;

            // Page Operations
            case 'list-pages':
                if (!commandArgs[0]) throw new Error('Missing docId parameter');
                const pages = await client.listPages(commandArgs[0]);
                console.log(`📄 Found ${pages.length} pages:`);
                pages.forEach(page => {
                    console.log(`  • ${page.name} (${page.id})`);
                    console.log(`    Type: ${page.type}, Parent: ${page.parentPageId || 'None'}`);
                    console.log('');
                });
                break;

            case 'get-page':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or pageId parameter');
                const page = await client.getPage(commandArgs[0], commandArgs[1]);
                console.log(`📄 Page: ${page.name}`);
                console.log(`   ID: ${page.id}`);
                console.log(`   Type: ${page.type}`);
                console.log(`   Parent: ${page.parentPageId || 'None'}`);
                break;

            case 'create-page':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or page-json parameter');
                const pageData = JSON.parse(commandArgs[1]);
                const pageResult = await client.createPage(commandArgs[0], pageData);
                console.log(`✅ Page created successfully`);
                console.log(`   ID: ${pageResult.id}`);
                console.log(`   Name: ${pageData.name}`);
                break;

            case 'update-page-content':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2]) {
                    throw new Error('Missing docId, pageId, or content parameter');
                }
                const insertionMode = commandArgs[3] || 'replace';
                const contentFormat = commandArgs[4] || 'markdown';
                await client.updatePageContent(commandArgs[0], commandArgs[1], commandArgs[2], insertionMode, contentFormat);
                console.log(`✅ Page content updated successfully`);
                console.log(`   Page ID: ${commandArgs[1]}`);
                console.log(`   Mode: ${insertionMode}`);
                console.log(`   Format: ${contentFormat}`);
                break;

            case 'update-page-metadata':
                if (!commandArgs[0] || !commandArgs[1] || !commandArgs[2]) {
                    throw new Error('Missing docId, pageId, or metadata-json parameter');
                }
                const metadata = JSON.parse(commandArgs[2]);
                await client.updatePageMetadata(commandArgs[0], commandArgs[1], metadata);
                console.log(`✅ Page metadata updated successfully`);
                console.log(`   Page ID: ${commandArgs[1]}`);
                if (metadata.name) console.log(`   New Name: ${metadata.name}`);
                break;

            // Column Operations
            case 'list-columns':
                if (!commandArgs[0] || !commandArgs[1]) throw new Error('Missing docId or tableId parameter');
                const columns = await client.listColumns(commandArgs[0], commandArgs[1]);
                console.log(`🔧 Found ${columns.length} columns:`);
                columns.forEach(column => {
                    console.log(`  • ${column.name} (${column.id})`);
                    console.log(`    Type: ${column.format}, Display: ${column.display}`);
                    console.log('');
                });
                break;

            default:
                console.error(`❌ Unknown command: ${command}`);
                console.error('Run "coda-mcp" without arguments to see available commands');
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Auto-run if called directly
if (require.main === module) {
    main();
}
