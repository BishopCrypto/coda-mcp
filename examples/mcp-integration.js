// MCP integration example for @thedevelopers/coda-mcp-client
// Shows how to use the client with Claude's Model Context Protocol

const CodaClient = require('../index');

/**
 * Example MCP Server implementation for Coda integration
 * This shows how you could build an MCP server using this client
 */
class CodaMCPServer {
    constructor(apiKey) {
        this.client = new CodaClient(apiKey);
    }

    // MCP-style tool definitions
    getTools() {
        return {
            'coda_list_docs': {
                description: 'List all accessible Coda documents',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            'coda_find_doc': {
                description: 'Find Coda document by name',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Document name or partial name' }
                    },
                    required: ['name']
                }
            },
            'coda_list_tables': {
                description: 'List tables in a Coda document',
                inputSchema: {
                    type: 'object',
                    properties: {
                        docId: { type: 'string', description: 'Document ID' }
                    },
                    required: ['docId']
                }
            },
            'coda_analyze_table': {
                description: 'Get sample data from a table for analysis',
                inputSchema: {
                    type: 'object',
                    properties: {
                        docId: { type: 'string', description: 'Document ID' },
                        tableId: { type: 'string', description: 'Table ID' },
                        limit: { type: 'number', description: 'Number of rows to sample', default: 10 }
                    },
                    required: ['docId', 'tableId']
                }
            },
            'coda_insert_row': {
                description: 'Insert a new row into a Coda table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        docId: { type: 'string', description: 'Document ID' },
                        tableId: { type: 'string', description: 'Table ID' },
                        data: { type: 'object', description: 'Row data as key-value pairs' }
                    },
                    required: ['docId', 'tableId', 'data']
                }
            },
            'coda_create_page': {
                description: 'Create a new page in a Coda document',
                inputSchema: {
                    type: 'object',
                    properties: {
                        docId: { type: 'string', description: 'Document ID' },
                        name: { type: 'string', description: 'Page name' },
                        content: { type: 'string', description: 'Page content (markdown)' },
                        subtitle: { type: 'string', description: 'Page subtitle' }
                    },
                    required: ['docId', 'name']
                }
            },
            'coda_search_data': {
                description: 'Search for data in a Coda table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        docId: { type: 'string', description: 'Document ID' },
                        tableId: { type: 'string', description: 'Table ID' },
                        column: { type: 'string', description: 'Column to search' },
                        value: { type: 'string', description: 'Value to search for' }
                    },
                    required: ['docId', 'tableId', 'column', 'value']
                }
            }
        };
    }

    // MCP-style tool execution
    async executeTool(name, args) {
        switch (name) {
            case 'coda_list_docs':
                return await this.listDocsForMCP();
                
            case 'coda_find_doc':
                return await this.findDocForMCP(args.name);
                
            case 'coda_list_tables':
                return await this.listTablesForMCP(args.docId);
                
            case 'coda_analyze_table':
                return await this.analyzeTableForMCP(args.docId, args.tableId, args.limit || 10);
                
            case 'coda_insert_row':
                return await this.insertRowForMCP(args.docId, args.tableId, args.data);
                
            case 'coda_create_page':
                return await this.createPageForMCP(args.docId, args.name, args.content, args.subtitle);
                
            case 'coda_search_data':
                return await this.searchDataForMCP(args.docId, args.tableId, args.column, args.value);
                
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }

    // MCP tool implementations
    async listDocsForMCP() {
        try {
            const docs = await this.client.listDocs();
            return {
                type: 'text',
                text: `Found ${docs.length} Coda documents:\n\n` +
                      docs.map(doc => `• **${doc.name}** (${doc.id})\n  URL: ${doc.browserLink}`).join('\n\n')
            };
        } catch (error) {
            return { type: 'text', text: `Error listing documents: ${error.message}` };
        }
    }

    async findDocForMCP(name) {
        try {
            const doc = await this.client.findDocByName(name);
            if (doc) {
                return {
                    type: 'text',
                    text: `Found document: **${doc.name}**\n` +
                          `ID: ${doc.id}\n` +
                          `URL: ${doc.browserLink}`
                };
            } else {
                return { type: 'text', text: `No document found matching: ${name}` };
            }
        } catch (error) {
            return { type: 'text', text: `Error finding document: ${error.message}` };
        }
    }

    async listTablesForMCP(docId) {
        try {
            const tables = await this.client.listTables(docId);
            return {
                type: 'text',
                text: `Found ${tables.length} tables:\n\n` +
                      tables.map(table => `• **${table.name}** (${table.id})\n  Type: ${table.tableType}, Rows: ${table.rowCount || 'N/A'}`).join('\n\n')
            };
        } catch (error) {
            return { type: 'text', text: `Error listing tables: ${error.message}` };
        }
    }

    async analyzeTableForMCP(docId, tableId, limit) {
        try {
            const rows = await this.client.listRows(docId, tableId, { 
                limit, 
                useColumnNames: true 
            });
            
            if (rows.length === 0) {
                return { type: 'text', text: 'No data found in this table.' };
            }

            // Get columns from first row
            const columns = Object.keys(rows[0].values || {});
            
            let text = `Table Analysis (${rows.length} rows sampled):\n\n`;
            text += `**Columns**: ${columns.join(', ')}\n\n`;
            text += `**Sample Data**:\n`;
            
            rows.slice(0, 3).forEach((row, index) => {
                text += `\nRow ${index + 1}:\n`;
                Object.entries(row.values || {}).forEach(([col, val]) => {
                    text += `  ${col}: ${JSON.stringify(val)}\n`;
                });
            });

            return { type: 'text', text };
        } catch (error) {
            return { type: 'text', text: `Error analyzing table: ${error.message}` };
        }
    }

    async insertRowForMCP(docId, tableId, data) {
        try {
            const result = await this.client.insertRow(docId, tableId, data);
            return {
                type: 'text',
                text: `✅ Row inserted successfully!\n` +
                      `Row ID: ${result.addedRowIds?.[0] || 'N/A'}\n` +
                      `Data: ${JSON.stringify(data, null, 2)}`
            };
        } catch (error) {
            return { type: 'text', text: `Error inserting row: ${error.message}` };
        }
    }

    async createPageForMCP(docId, name, content, subtitle) {
        try {
            const pageData = { name };
            if (subtitle) pageData.subtitle = subtitle;
            
            const result = await this.client.createPage(docId, pageData);
            
            // If content provided, update the page content
            if (content) {
                await this.client.updatePageContent(result.id, docId, content);
            }
            
            return {
                type: 'text',
                text: `✅ Page created successfully!\n` +
                      `Name: ${name}\n` +
                      `ID: ${result.id}\n` +
                      `${content ? 'Content added' : 'No content added'}`
            };
        } catch (error) {
            return { type: 'text', text: `Error creating page: ${error.message}` };
        }
    }

    async searchDataForMCP(docId, tableId, column, value) {
        try {
            const results = await this.client.searchRows(docId, tableId, column, value);
            
            if (results.length === 0) {
                return { type: 'text', text: `No results found for "${value}" in column "${column}"` };
            }

            let text = `Found ${results.length} matching rows:\n\n`;
            results.slice(0, 5).forEach((row, index) => {
                text += `**Result ${index + 1}** (ID: ${row.id}):\n`;
                Object.entries(row.values || {}).forEach(([col, val]) => {
                    text += `  ${col}: ${JSON.stringify(val)}\n`;
                });
                text += '\n';
            });

            if (results.length > 5) {
                text += `...and ${results.length - 5} more results`;
            }

            return { type: 'text', text };
        } catch (error) {
            return { type: 'text', text: `Error searching data: ${error.message}` };
        }
    }
}

// Example usage
async function mcpIntegrationExample() {
    console.log('🤖 Coda MCP Integration Example');
    console.log('===============================\n');
    
    if (!process.env.CODA_API_KEY) {
        console.error('❌ Please set CODA_API_KEY environment variable');
        return;
    }
    
    const mcpServer = new CodaMCPServer(process.env.CODA_API_KEY);
    
    try {
        // Example: Claude asking to list documents
        console.log('1. Claude asks: "List my Coda documents"');
        const docsResult = await mcpServer.executeTool('coda_list_docs', {});
        console.log('   Response:', docsResult.text.substring(0, 200) + '...\n');
        
        // Example: Claude asking to find a specific document
        console.log('2. Claude asks: "Find my project tracker document"');
        const findResult = await mcpServer.executeTool('coda_find_doc', { name: 'project' });
        console.log('   Response:', findResult.text + '\n');
        
        // Example: Claude asking to analyze data
        console.log('3. Claude asks: "Show me the available tools in this integration"');
        const tools = mcpServer.getTools();
        console.log('   Available MCP tools:');
        Object.entries(tools).forEach(([name, tool]) => {
            console.log(`   • ${name}: ${tool.description}`);
        });
        
        console.log('\n✅ MCP integration example completed!');
        console.log('\nThis example shows how Claude can:');
        console.log('- List and find Coda documents');
        console.log('- Analyze table structures and data');
        console.log('- Insert new rows based on conversation');
        console.log('- Create pages with AI-generated content');
        console.log('- Search for specific information');
        console.log('\nNext steps:');
        console.log('- Implement this as a full MCP server');
        console.log('- Add to Claude Desktop configuration');
        console.log('- Build custom AI workflows with your Coda data');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run example if called directly
if (require.main === module) {
    mcpIntegrationExample();
}

module.exports = { CodaMCPServer, mcpIntegrationExample };
