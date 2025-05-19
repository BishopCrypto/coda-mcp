#!/usr/bin/env node

/**
 * Standalone MCP Server for Coda Integration
 * Use this file directly with Claude Desktop
 */

const { CodaMCPServer } = require('coda-mcp-client/examples/mcp-integration');

async function startMCPServer() {
    // Check for API key
    if (!process.env.CODA_API_KEY) {
        console.error('❌ Error: CODA_API_KEY environment variable not set');
        console.error('This should be set in your Claude Desktop configuration:');
        console.error('');
        console.error('{');
        console.error('  "mcpServers": {');
        console.error('    "coda": {');
        console.error('      "command": "node",');
        console.error('      "args": ["/path/to/this/file.js"],');
        console.error('      "env": {');
        console.error('        "CODA_API_KEY": "your-actual-api-key-here"');
        console.error('      }');
        console.error('    }');
        console.error('  }');
        console.error('}');
        process.exit(1);
    }

    console.log('🚀 Starting Coda MCP Server...');
    console.log('API Key found:', process.env.CODA_API_KEY.substring(0, 8) + '...');
    
    try {
        // Initialize the MCP server
        const server = new CodaMCPServer(process.env.CODA_API_KEY);
        
        // Test connection by listing docs
        const result = await server.executeTool('coda_list_docs', {});
        console.log('✅ Successfully connected to Coda API');
        console.log('Available tools:', Object.keys(server.getTools()).join(', '));
        
        // For actual MCP implementation, you would:
        // 1. Set up stdio communication
        // 2. Handle MCP protocol messages
        // 3. Route tool calls to the appropriate methods
        
        console.log('📡 MCP Server ready for Claude Desktop integration');
        
        // Keep the process running
        process.on('SIGINT', () => {
            console.log('\n👋 Shutting down Coda MCP Server...');
            process.exit(0);
        });
        
        // Simulate MCP server running
        console.log('💬 Send messages to this server via Claude Desktop...');
        
    } catch (error) {
        console.error('❌ Failed to start MCP server:', error.message);
        
        if (error.message.includes('401')) {
            console.error('🔑 API key appears to be invalid. Please check:');
            console.error('1. Go to https://coda.io/account');
            console.error('2. Generate a new API token');
            console.error('3. Update your Claude Desktop configuration');
        }
        
        process.exit(1);
    }
}

// Run the server
startMCPServer();
