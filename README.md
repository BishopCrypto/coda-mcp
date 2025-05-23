# coda-mcp-client

> Complete Coda API client with MCP integration for AI automation

[![npm version](https://badge.fury.io/js/coda-mcp-client.svg)](https://www.npmjs.com/package/coda-mcp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**🎁 [Get Free Automation Guide + Templates](https://thedevelopers.dev/coda-guide)**

A production-ready Coda API client that solves real problems in the Coda ecosystem. Built by [Ryan Scott](https://github.com/BishopCrypto) at [The Developers](https://thedevelopers.dev) to fill gaps in existing tools and provide seamless AI automation through Model Context Protocol (MCP) integration.

## 🚀 Why This Client?

**Fixes What's Broken:**
- ✅ **Page creation/updates that actually work** (existing tools have broken API calls)
- ✅ **Handles unlimited content size** with automatic chunking (no size limitations!)
- ✅ **Complete table operations** with proper error handling
- ✅ **Support for replace/append modes** for page content
- ✅ **Markdown & HTML content support**

**Powers AI Automation:**
- 🤖 **MCP integration** for Claude and other AI systems
- 🔧 **CLI + programmatic API** - works both ways  
- 🎯 **Production-tested** with real workflows
- 📡 **No external dependencies** - just Node.js built-ins

## 📦 Installation

```bash
npm install coda-mcp-client

# Or use globally for CLI
npm install -g coda-mcp-client
```

## 🔑 Setup

### Step 1: Get Your Coda API Key
1. Go to [coda.io/account](https://coda.io/account)
2. Generate an API token under "API Settings"
3. Copy the token (starts with something like `464c04e1-...`)

### Step 2: Set Environment Variable

**For current terminal session:**
```bash
export CODA_API_KEY="464c04e1-a705-4206-a87c-beeca5044089"
```

**For permanent setup (recommended):**

Add to your shell profile (`~/.zshrc`, `~/.bashrc`, or `~/.bash_profile`):
```bash
echo 'export CODA_API_KEY="464c04e1-a705-4206-a87c-beeca5044089"' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Verify Setup

```bash
# Test the CLI
coda-mcp list-docs

# Should show your documents, not an error about missing API key
```

### 🚨 Common Issues

**Error: "CODA_API_KEY environment variable not set"**
- Make sure you've exported the key in your current terminal
- Restart your terminal after adding to shell profile
- Verify with: `echo $CODA_API_KEY`

**Error: "API Error 401"**
- Double-check your API key is correct
- Make sure there are no extra spaces or quotes
- Generate a new API key if needed

**Error: "No documents found"**
- Your API key might not have access to any documents
- Try creating a test document in Coda first
- Check that your account has the necessary permissions

## 🎁 Free Resources

### **Automation Starter Guide**
Get our comprehensive guide with proven workflows:
- ✅ Complete setup walkthrough
- ✅ 5 production-ready automation templates  
- ✅ Troubleshooting checklist
- ✅ Advanced integration examples

**[Download Free Guide →](https://thedevelopers.dev/coda-guide)**

### **Premium Workflows**
Want done-for-you solutions? Check out our premium automation pack:
- 🚀 15+ advanced workflow templates
- 🎥 Video setup tutorials
- 💬 Private community access
- 🛠️ Custom configuration files

**[Get Premium Pack ($47) →](https://thedevelopers.dev/coda-premium)**

## 🏗️ Usage

### Programmatic API

```javascript
const CodaClient = require('coda-mcp-client');

const client = new CodaClient(process.env.CODA_API_KEY);

// List documents
const docs = await client.listDocs();

// Find document by name
const doc = await client.findDocByName('My Project');

// Get table data
const rows = await client.listRows(docId, tableId, { 
    limit: 50, 
    useColumnNames: true 
});

// Insert new row
await client.insertRow(docId, tableId, {
    'Name': 'John Doe',
    'Email': 'john@example.com',
    'Status': 'Active'
});

// Create page with content
const page = await client.createPage(docId, {
    name: 'New Report',
    subtitle: 'Generated by AI'
});

// Update page content (supports markdown/html)
await client.updatePageContent(docId, page.id, `
# My Report

This page was created via the API!

## Data Summary
- Total items: 42
- Status: Complete
`, 'replace', 'markdown');
```

### Command Line Interface

```bash
# List all documents
coda-mcp list-docs

# Find document by name
coda-mcp find-doc "Project Tracker"

# List tables in a document
coda-mcp list-tables doc-abc123

# Get table data (limit to 10 rows)
coda-mcp list-rows doc-abc123 grid-xyz789 10

# Insert new row
coda-mcp insert-row doc-abc123 grid-xyz789 '{"Name":"Jane","Status":"New"}'

# Create page
coda-mcp create-page doc-abc123 '{"name":"Weekly Report","subtitle":"Team Update"}'

# Update page content
coda-mcp update-page-content doc-abc123 page-def456 "# Updated content" replace markdown
```

## 🤖 MCP Integration (Claude AI)

This client is designed for seamless integration with Claude's Model Context Protocol:

### 1. Quick Start for Claude Desktop

**Step 1: Install the package globally**
```bash
npm install -g coda-mcp-client
```

**Step 2: Create MCP server file**
Create `/path/to/coda-mcp-server.js`:
```javascript
#!/usr/bin/env node
const { CodaMCPServer } = require('coda-mcp-client/examples/mcp-integration');

const server = new CodaMCPServer(process.env.CODA_API_KEY);

// Start MCP server
async function main() {
    if (!process.env.CODA_API_KEY) {
        console.error('CODA_API_KEY environment variable required');
        process.exit(1);
    }
    
    console.log('Coda MCP server starting...');
    // MCP server implementation here
}

main().catch(console.error);
```

**Step 3: Add to Claude Desktop config**
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "coda": {
      "command": "node",
      "args": ["/absolute/path/to/coda-mcp-server.js"],
      "env": {
        "CODA_API_KEY": "your-actual-api-key-here"
      }
    }
  }
}
```

**Important Notes:**
- Use absolute paths, not relative paths
- Replace `your-actual-api-key-here` with your real API key
- Restart Claude Desktop after config changes

### 2. Alternative: Direct API Usage

```javascript
const { CodaMCPServer } = require('coda-mcp-client/examples/mcp-integration');

const server = new CodaMCPServer(process.env.CODA_API_KEY);

// Get available tools for Claude
const tools = server.getTools();

// Execute tool calls from Claude
const result = await server.executeTool('coda_list_docs', {});
```

### 3. Available MCP Tools

- `coda_list_docs` - List all accessible documents
- `coda_find_doc` - Find document by name  
- `coda_list_tables` - List tables in a document
- `coda_analyze_table` - Get sample data for AI analysis
- `coda_insert_row` - Insert new rows via conversation
- `coda_create_page` - Create pages with AI-generated content
- `coda_search_data` - Search for specific information

### 🚨 MCP Troubleshooting

**Claude doesn't see Coda tools:**
- Verify Claude Desktop config syntax (valid JSON)
- Check that paths are absolute, not relative
- Restart Claude Desktop after config changes
- Look for errors in Claude logs

**"CODA_API_KEY not set" in MCP:**
- API key must be in Claude Desktop config `env` section
- Don't rely on shell environment variables for MCP
- Each MCP server gets its own environment

**MCP server won't start:**
- Test the server manually: `node /path/to/coda-mcp-server.js`
- Check Node.js version compatibility
- Verify all dependencies are installed globally

## 📚 API Reference

### Documents

- `listDocs()` - List all accessible documents
- `getDoc(docId)` - Get document details
- `findDocByName(name)` - Find document by name

### Tables  

- `listTables(docId)` - List tables in document
- `getTable(docId, tableId)` - Get table details
- `createTable(docId, tableData)` - Create new table
- `listColumns(docId, tableId)` - List table columns

### Rows

- `listRows(docId, tableId, options)` - List rows with options
- `getRow(docId, tableId, rowId)` - Get specific row
- `insertRow(docId, tableId, cells, options)` - Insert new row
- `updateRow(docId, tableId, rowId, cells)` - Update existing row
- `deleteRow(docId, tableId, rowId)` - Delete row
- `searchRows(docId, tableId, column, value)` - Search rows

### Pages

- `listPages(docId)` - List pages in document
- `getPage(docId, pageId)` - Get page details  
- `createPage(docId, pageData)` - Create new page
- `updatePageContent(docId, pageId, content, mode, format)` - Update page content
- `updatePageMetadata(docId, pageId, metadata)` - Update page metadata

## 🔧 Advanced Features

### Error Handling

The client provides detailed error messages and proper HTTP status code handling:

```javascript
try {
    await client.insertRow(docId, tableId, data);
} catch (error) {
    if (error.message.includes('401')) {
        console.log('Invalid API key');
    } else if (error.message.includes('404')) {
        console.log('Document or table not found');
    } else {
        console.log('Other error:', error.message);
    }
}
```

### Batch Operations

```javascript
// Insert multiple rows efficiently
const rows = [
    { 'Name': 'Alice', 'Status': 'Active' },
    { 'Name': 'Bob', 'Status': 'Pending' }
];

for (const rowData of rows) {
    await client.insertRow(docId, tableId, rowData);
}
```

### Content Modes

Page updates support different insertion modes:

```javascript
// Replace entire page content
await client.updatePageContent(docId, pageId, newContent, 'replace');

// Append to existing content  
await client.updatePageContent(docId, pageId, additionalContent, 'append');
```

## 🛠️ Development

### Running Examples

```bash
# Basic usage example
node examples/basic-usage.js

# MCP integration example  
node examples/mcp-integration.js

# CLI test
npm test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and examples
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋 Support & Community

- **⭐ Star this repo** if it helped you!
- **🐛 Issues**: [GitHub Issues](https://github.com/BishopCrypto/coda-mcp/issues)
- **📖 Documentation**: [GitHub Wiki](https://github.com/BishopCrypto/coda-mcp/wiki)
- **🔧 Troubleshooting**: [Common issues & solutions](./TROUBLESHOOTING.md)
- **💬 Community**: [Join our Discord](https://discord.gg/thedevelopers) 
- **📧 Updates**: [Newsletter for automation tips](https://thedevelopers.dev/newsletter)
- **🌐 Website**: [https://thedevelopers.dev](https://thedevelopers.dev)
- **👨‍💻 Author**: [Ryan Scott](https://github.com/BishopCrypto)

### 🤝 Professional Services

Need custom Coda automation or enterprise setup?
- Custom MCP server development
- Advanced workflow design
- Team training & support

Contact: [ryan@thedevelopers.dev](mailto:ryan@thedevelopers.dev)

## 🌟 Why We Built This

At [The Developers](https://thedevelopers.dev), we build tools that developers actually want to use. Created by [Ryan Scott](https://github.com/BishopCrypto), this client was built because existing Coda clients had broken functionality and missing features. We built this one to:

1. **Actually work** with the current Coda API
2. **Support AI automation** through MCP integration  
3. **Provide complete functionality** including page management
4. **Offer great developer experience** with CLI + programmatic access

Built with ❤️ by [Ryan Scott](https://github.com/BishopCrypto) at [The Developers](https://thedevelopers.dev)

---

*This package is not officially affiliated with Coda. Coda is a trademark of Coda Project, Inc.*
