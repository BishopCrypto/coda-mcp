#!/usr/bin/env node

/**
 * Coda MCP Server
 * A proper Model Context Protocol server for Coda integration
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const CodaClient = require('./index.js');

class CodaMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'coda-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.codaClient = null;
        this.setupHandlers();
    }

    setupHandlers() {
        // Handle listing available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'coda_list_docs',
                        description: 'List all accessible Coda documents',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    },
                    {
                        name: 'coda_find_doc',
                        description: 'Find Coda document by name',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: { 
                                    type: 'string', 
                                    description: 'Document name or partial name to search for' 
                                }
                            },
                            required: ['name']
                        }
                    },
                    {
                        name: 'coda_list_tables',
                        description: 'List all tables in a Coda document',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                }
                            },
                            required: ['docId']
                        }
                    },
                    {
                        name: 'coda_list_pages',
                        description: 'List all pages in a Coda document',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                }
                            },
                            required: ['docId']
                        }
                    },
                    {
                        name: 'coda_analyze_table',
                        description: 'Get sample data and structure from a Coda table for analysis',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                },
                                tableId: { 
                                    type: 'string', 
                                    description: 'Table ID or name' 
                                },
                                limit: { 
                                    type: 'number', 
                                    description: 'Number of rows to sample (default: 10)', 
                                    default: 10 
                                }
                            },
                            required: ['docId', 'tableId']
                        }
                    },
                    {
                        name: 'coda_insert_row',
                        description: 'Insert a new row into a Coda table',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                },
                                tableId: { 
                                    type: 'string', 
                                    description: 'Table ID or name' 
                                },
                                data: { 
                                    type: 'object', 
                                    description: 'Row data as key-value pairs using column names' 
                                }
                            },
                            required: ['docId', 'tableId', 'data']
                        }
                    },
                    {
                        name: 'coda_create_page',
                        description: 'Create a new page in a Coda document',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                },
                                name: { 
                                    type: 'string', 
                                    description: 'Page name' 
                                },
                                content: { 
                                    type: 'string', 
                                    description: 'Page content in markdown format' 
                                },
                                subtitle: { 
                                    type: 'string', 
                                    description: 'Optional page subtitle' 
                                }
                            },
                            required: ['docId', 'name']
                        }
                    },
                    {
                        name: 'coda_update_page_content',
                        description: 'Update content of an existing page',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                },
                                pageId: { 
                                    type: 'string', 
                                    description: 'Page ID to update' 
                                },
                                content: { 
                                    type: 'string', 
                                    description: 'New content in markdown format' 
                                },
                                mode: { 
                                    type: 'string', 
                                    description: 'Insert mode: replace or append', 
                                    default: 'replace' 
                                }
                            },
                            required: ['docId', 'pageId', 'content']
                        }
                    },
                    {
                        name: 'coda_search_data',
                        description: 'Search for specific data in a Coda table',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                },
                                tableId: { 
                                    type: 'string', 
                                    description: 'Table ID or name' 
                                },
                                column: { 
                                    type: 'string', 
                                    description: 'Column name to search in' 
                                },
                                value: { 
                                    type: 'string', 
                                    description: 'Value to search for' 
                                }
                            },
                            required: ['docId', 'tableId', 'column', 'value']
                        }
                    },
                    {
                        name: 'coda_update_row',
                        description: 'Update an existing row in a Coda table',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                docId: { 
                                    type: 'string', 
                                    description: 'Coda document ID' 
                                },
                                tableId: { 
                                    type: 'string', 
                                    description: 'Table ID or name' 
                                },
                                rowId: { 
                                    type: 'string', 
                                    description: 'Row ID to update' 
                                },
                                data: { 
                                    type: 'object', 
                                    description: 'Updated row data as key-value pairs' 
                                }
                            },
                            required: ['docId', 'tableId', 'rowId', 'data']
                        }
                    }
                ]
            };
        });

        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            // Initialize Coda client if not already done
            if (!this.codaClient) {
                const apiKey = process.env.CODA_API_KEY;
                if (!apiKey) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: CODA_API_KEY environment variable not set. Please configure it in your Claude Desktop configuration.'
                            }
                        ]
                    };
                }
                this.codaClient = new CodaClient(apiKey);
            }

            try {
                let result;

                switch (name) {
                    case 'coda_list_docs':
                        result = await this.listDocs();
                        break;
                    
                    case 'coda_find_doc':
                        result = await this.findDoc(args.name);
                        break;
                    
                    case 'coda_list_tables':
                        result = await this.listTables(args.docId);
                        break;
                    
                    case 'coda_list_pages':
                        result = await this.listPages(args.docId);
                        break;
                    
                    case 'coda_analyze_table':
                        result = await this.analyzeTable(args.docId, args.tableId, args.limit || 10);
                        break;
                    
                    case 'coda_insert_row':
                        result = await this.insertRow(args.docId, args.tableId, args.data);
                        break;
                    
                    case 'coda_create_page':
                        result = await this.createPage(args.docId, args.name, args.content, args.subtitle);
                        break;
                    
                    case 'coda_update_page_content':
                        result = await this.updatePageContent(args.docId, args.pageId, args.content, args.mode || 'replace');
                        break;
                    
                    case 'coda_search_data':
                        result = await this.searchData(args.docId, args.tableId, args.column, args.value);
                        break;
                    
                    case 'coda_update_row':
                        result = await this.updateRow(args.docId, args.tableId, args.rowId, args.data);
                        break;
                    
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: result
                        }
                    ]
                };

            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${error.message}`
                        }
                    ]
                };
            }
        });
    }

    // Tool implementations
    async listDocs() {
        const docs = await this.codaClient.listDocs();
        if (docs.length === 0) {
            return 'No Coda documents found.';
        }
        
        return `Found ${docs.length} Coda document(s):\n\n` +
               docs.map(doc => `• **${doc.name}** (ID: ${doc.id})\n  URL: ${doc.browserLink}\n  Created: ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}`).join('\n\n');
    }

    async findDoc(name) {
        const doc = await this.codaClient.findDocByName(name);
        if (!doc) {
            return `No document found matching: "${name}"`;
        }
        
        return `Found document: **${doc.name}**\n` +
               `ID: ${doc.id}\n` +
               `URL: ${doc.browserLink}\n` +
               `Created: ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}`;
    }

    async listTables(docId) {
        const tables = await this.codaClient.listTables(docId);
        if (tables.length === 0) {
            return 'No tables found in this document.';
        }
        
        return `Found ${tables.length} table(s):\n\n` +
               tables.map(table => `• **${table.name}** (ID: ${table.id})\n  Type: ${table.tableType || 'N/A'}\n  Rows: ${table.rowCount || 'N/A'}`).join('\n\n');
    }

    async listPages(docId) {
        const pages = await this.codaClient.listPages(docId);
        if (pages.length === 0) {
            return 'No pages found in this document.';
        }
        
        return `Found ${pages.length} page(s):\n\n` +
               pages.map(page => `• **${page.name}** (ID: ${page.id})\n  Subtitle: ${page.subtitle || 'None'}\n  URL: ${page.browserLink}`).join('\n\n');
    }

    async analyzeTable(docId, tableId, limit) {
        // First get table info
        const tables = await this.codaClient.listTables(docId);
        const table = tables.find(t => t.id === tableId || t.name === tableId);
        const tableName = table ? table.name : tableId;
        
        // Get sample rows
        const rows = await this.codaClient.listRows(docId, tableId, { 
            limit, 
            useColumnNames: true 
        });
        
        if (rows.length === 0) {
            return `Table "${tableName}" is empty or has no accessible data.`;
        }

        // Extract columns from first row
        const columns = Object.keys(rows[0].values || {});
        
        let analysis = `**Table Analysis: ${tableName}**\n\n`;
        analysis += `• **Columns** (${columns.length}): ${columns.join(', ')}\n`;
        analysis += `• **Sample Size**: ${rows.length} rows\n`;
        analysis += `• **Total Rows**: ${table?.rowCount || 'Unknown'}\n\n`;
        
        analysis += `**Sample Data**:\n`;
        rows.slice(0, Math.min(3, rows.length)).forEach((row, index) => {
            analysis += `\n**Row ${index + 1}** (ID: ${row.id}):\n`;
            Object.entries(row.values || {}).forEach(([col, val]) => {
                const displayValue = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
                analysis += `  • ${col}: ${displayValue}\n`;
            });
        });

        if (rows.length > 3) {
            analysis += `\n... and ${rows.length - 3} more rows available`;
        }

        return analysis;
    }

    async insertRow(docId, tableId, data) {
        const result = await this.codaClient.insertRow(docId, tableId, data);
        const rowId = result.addedRowIds?.[0] || 'Unknown';
        
        return `✅ **Row inserted successfully!**\n\n` +
               `• **Row ID**: ${rowId}\n` +
               `• **Data**: ${JSON.stringify(data, null, 2)}`;
    }

    async createPage(docId, name, content, subtitle) {
        try {
            const pageData = { name };
            if (subtitle) pageData.subtitle = subtitle;
            
            const result = await this.codaClient.createPage(docId, pageData);
            
            // Handle content if provided
            if (content) {
                // Wait a moment for the page to be fully created
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                    await this.uploadContentInChunks(docId, result.id, content);
                } catch (contentError) {
                    // If content upload fails, still return success for page creation
                    console.error('Content upload failed:', contentError.message);
                    return `✅ **Page created successfully!**\n\n` +
                           `• **Name**: ${name}\n` +
                           `• **ID**: ${result.id}\n` +
                           `• **Subtitle**: ${subtitle || 'None'}\n` +
                           `• **Content**: Failed to upload - try using coda_update_page_content with pageId: ${result.id}\n` +
                           `• **Error**: ${contentError.message}`;
                }
            }
            
            return `✅ **Page created successfully!**\n\n` +
                   `• **Name**: ${name}\n` +
                   `• **ID**: ${result.id}\n` +
                   `• **Subtitle**: ${subtitle || 'None'}\n` +
                   `• **Content**: ${content ? `Added successfully (${content.length} characters)` : 'Empty page created'}`;
        } catch (error) {
            throw new Error(`Failed to create page: ${error.message}`);
        }
    }

    async uploadContentInChunks(docId, pageId, content) {
        const CHUNK_SIZE = 4000; // Safe size to avoid timeouts
        
        if (content.length <= CHUNK_SIZE) {
            // Small content - upload directly
            await this.codaClient.updatePageContent(docId, pageId, content, 'replace', 'markdown');
            return;
        }
        
        // Large content - split into chunks
        const chunks = this.splitContent(content, CHUNK_SIZE);
        
        for (let i = 0; i < chunks.length; i++) {
            const mode = i === 0 ? 'replace' : 'append';
            await this.codaClient.updatePageContent(docId, pageId, chunks[i], mode, 'markdown');
            
            // Small delay between chunks to be nice to the API
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    splitContent(content, maxSize) {
        const chunks = [];
        let currentChunk = '';
        const lines = content.split('\n');
        
        for (const line of lines) {
            // If adding this line would exceed chunk size
            if (currentChunk.length + line.length + 1 > maxSize) {
                // If current chunk has content, save it
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                
                // If single line is too long, split it
                if (line.length > maxSize) {
                    const lineParts = this.splitLongLine(line, maxSize);
                    chunks.push(...lineParts.slice(0, -1));
                    currentChunk = lineParts[lineParts.length - 1];
                } else {
                    currentChunk = line;
                }
            } else {
                // Add line to current chunk
                currentChunk += (currentChunk ? '\n' : '') + line;
            }
        }
        
        // Don't forget the last chunk
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    splitLongLine(line, maxSize) {
        const parts = [];
        let remaining = line;
        
        while (remaining.length > maxSize) {
            // Try to split on word boundaries
            let splitPoint = maxSize;
            const spaceIndex = remaining.lastIndexOf(' ', maxSize);
            
            if (spaceIndex > maxSize * 0.7) {
                splitPoint = spaceIndex;
            }
            
            parts.push(remaining.substring(0, splitPoint));
            remaining = remaining.substring(splitPoint).trim();
        }
        
        if (remaining) {
            parts.push(remaining);
        }
        
        return parts;
    }

    async updatePageContent(docId, pageId, content, mode = 'replace') {
        try {
            const CHUNK_SIZE = 4000;
            
            if (content.length <= CHUNK_SIZE || mode === 'append') {
                // Small content or append mode - upload directly
                await this.codaClient.updatePageContent(docId, pageId, content, mode, 'markdown');
            } else {
                // Large content with replace mode - split into chunks
                const chunks = this.splitContent(content, CHUNK_SIZE);
                
                for (let i = 0; i < chunks.length; i++) {
                    const chunkMode = i === 0 ? 'replace' : 'append';
                    await this.codaClient.updatePageContent(docId, pageId, chunks[i], chunkMode, 'markdown');
                    
                    // Small delay between chunks
                    if (i < chunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
            
            return `✅ **Page content updated successfully!**\n\n` +
                   `• **Page ID**: ${pageId}\n` +
                   `• **Mode**: ${mode}\n` +
                   `• **Content Length**: ${content.length} characters\n` +
                   `• **Method**: ${content.length > CHUNK_SIZE && mode === 'replace' ? 'Chunked upload' : 'Direct upload'}\n` +
                   `• **Status**: Content updated successfully`;
        } catch (error) {
            throw new Error(`Failed to update page content: ${error.message}`);
        }
    }

    async searchData(docId, tableId, column, value) {
        const results = await this.codaClient.searchRows(docId, tableId, column, value);
        
        if (results.length === 0) {
            return `No results found for "${value}" in column "${column}"`;
        }

        let searchResult = `**Search Results**: Found ${results.length} matching row(s)\n`;
        searchResult += `**Query**: "${value}" in column "${column}"\n\n`;
        
        results.slice(0, 5).forEach((row, index) => {
            searchResult += `**Result ${index + 1}** (ID: ${row.id}):\n`;
            Object.entries(row.values || {}).forEach(([col, val]) => {
                const displayValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
                const isMatch = col === column && String(val).includes(value);
                searchResult += `  • ${col}: ${isMatch ? `**${displayValue}**` : displayValue}\n`;
            });
            searchResult += '\n';
        });

        if (results.length > 5) {
            searchResult += `... and ${results.length - 5} more result(s)`;
        }

        return searchResult;
    }

    async updateRow(docId, tableId, rowId, data) {
        await this.codaClient.updateRow(docId, tableId, rowId, data);
        
        return `✅ **Row updated successfully!**\n\n` +
               `• **Row ID**: ${rowId}\n` +
               `• **Updated Data**: ${JSON.stringify(data, null, 2)}`;
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Coda MCP Server running on stdio');
    }
}

// Check if we're running directly
if (require.main === module) {
    const server = new CodaMCPServer();
    server.run().catch(console.error);
}

module.exports = CodaMCPServer;
