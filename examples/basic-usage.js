// Basic usage example for @thedevelopers/coda-mcp-client

const CodaClient = require('../index');

async function basicExample() {
    // Initialize client
    const client = new CodaClient(process.env.CODA_API_KEY);
    
    try {
        console.log('🚀 Coda MCP Client - Basic Usage Example');
        console.log('=========================================\n');
        
        // 1. List all docs
        console.log('1. Listing all documents...');
        const docs = await client.listDocs();
        console.log(`   Found ${docs.length} documents\n`);
        
        if (docs.length === 0) {
            console.log('   No documents found. Create one at https://coda.io\n');
            return;
        }
        
        // 2. Get first doc details
        const firstDoc = docs[0];
        console.log(`2. Getting details for "${firstDoc.name}"...`);
        const docDetails = await client.getDoc(firstDoc.id);
        console.log(`   Created: ${docDetails.createdAt}`);
        console.log(`   URL: ${docDetails.browserLink}\n`);
        
        // 3. List tables in the doc
        console.log('3. Listing tables in document...');
        const tables = await client.listTables(firstDoc.id);
        console.log(`   Found ${tables.length} tables\n`);
        
        if (tables.length > 0) {
            const firstTable = tables[0];
            console.log(`4. Getting rows from "${firstTable.name}" table...`);
            const rows = await client.listRows(firstDoc.id, firstTable.id, { 
                limit: 5, 
                useColumnNames: true 
            });
            console.log(`   Found ${rows.length} rows (showing first 5)\n`);
            
            // 5. Show sample data
            if (rows.length > 0) {
                console.log('5. Sample row data:');
                const sampleRow = rows[0];
                console.log(`   Row ID: ${sampleRow.id}`);
                if (sampleRow.values) {
                    Object.entries(sampleRow.values).forEach(([column, value]) => {
                        console.log(`   ${column}: ${JSON.stringify(value)}`);
                    });
                }
                console.log('');
            }
        }
        
        // 6. List pages
        console.log('6. Listing pages in document...');
        const pages = await client.listPages(firstDoc.id);
        console.log(`   Found ${pages.length} pages\n`);
        
        console.log('✅ Basic example completed successfully!');
        console.log('\nNext steps:');
        console.log('- Try the CLI: npx coda-mcp-client list-docs');
        console.log('- Check out examples/mcp-integration.js for AI automation');
        console.log('- Read the full documentation at https://github.com/BishopCrypto/coda-mcp');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('401')) {
            console.error('\n💡 Make sure your CODA_API_KEY is valid:');
            console.error('   1. Go to https://coda.io/account');
            console.error('   2. Generate a new API token');
            console.error('   3. Run: export CODA_API_KEY="your-new-token"');
        }
    }
}

// Run example if called directly
if (require.main === module) {
    if (!process.env.CODA_API_KEY) {
        console.error('❌ Please set CODA_API_KEY environment variable');
        console.error('   Run: export CODA_API_KEY="your-api-key"');
        process.exit(1);
    }
    
    basicExample();
}

module.exports = basicExample;
