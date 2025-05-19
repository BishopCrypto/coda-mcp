# Coda MCP Client - Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. "CODA_API_KEY environment variable not set"

**Problem**: The CLI can't find your Coda API key.

**Solutions**:
```bash
# Option 1: Set for current session
export CODA_API_KEY="your-api-key-here"

# Option 2: Add to shell profile (permanent)
echo 'export CODA_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc

# Option 3: Set directly when running
CODA_API_KEY="your-api-key-here" coda-mcp list-docs
```

**Verify it's set**:
```bash
echo $CODA_API_KEY  # Should print your key
```

### 2. "API Error 401: Unauthorized"

**Problem**: Your API key is invalid or expired.

**Solutions**:
1. Go to https://coda.io/account
2. Generate a new API token
3. Copy the new token (it starts with something like `464c04e1-...`)
4. Update your environment variable

**Common mistakes**:
- Extra spaces around the key
- Using the wrong quotes
- Key has expired or been revoked

### 3. "No documents found"

**Problem**: Your API key works but returns no documents.

**Solutions**:
1. Create a test document in Coda first
2. Make sure you're logged into the right Coda account
3. Check that your API token has the correct permissions

### 4. MCP Server Issues

**Problem**: Claude Desktop can't connect to the MCP server.

**Common fixes**:

**Check Claude Desktop config syntax**:
```json
{
  "mcpServers": {
    "coda": {
      "command": "node",
      "args": ["/absolute/path/to/coda-mcp-server.js"],
      "env": {
        "CODA_API_KEY": "464c04e1-a705-4206-a87c-beeca5044089"
      }
    }
  }
}
```

**Important**:
- Use absolute paths, not `~/` or relative paths
- Put your actual API key in the config
- Restart Claude Desktop after changes

**Test the MCP server manually**:
```bash
# This should work without errors
CODA_API_KEY="your-key" node /path/to/coda-mcp-server.js
```

### 5. Installation Issues

**Problem**: Package won't install or import.

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm uninstall coda-mcp-client
npm install coda-mcp-client

# For global CLI installation
npm uninstall -g coda-mcp-client
npm install -g coda-mcp-client
```

### 6. Module Import Errors

**Problem**: `require('coda-mcp-client')` fails.

**Check Node.js version**:
```bash
node --version  # Should be 12.0.0 or higher
```

**Try absolute require**:
```javascript
// Instead of this:
const CodaClient = require('coda-mcp-client');

// Try this:
const CodaClient = require('/path/to/node_modules/coda-mcp-client');
```

## 🔍 Debug Mode

**Enable verbose logging**:
```bash
# For CLI
DEBUG=coda-mcp* coda-mcp list-docs

# For programmatic use
const client = new CodaClient(apiKey, { debug: true });
```

## 📧 Getting Help

If you're still having issues:

1. **Check the examples**:
   - Run `node examples/basic-usage.js`
   - Run `node examples/mcp-integration.js`

2. **Search GitHub issues**: https://github.com/BishopCrypto/coda-mcp/issues

3. **Create a new issue** with:
   - Your operating system
   - Node.js version
   - Exact error message
   - Steps to reproduce

4. **Contact support**: ryan@thedevelopers.dev

## ✅ Verification Checklist

Before opening an issue, verify:

- [ ] Node.js version is 12.0.0 or higher
- [ ] `npm install coda-mcp-client` completed successfully
- [ ] CODA_API_KEY is set: `echo $CODA_API_KEY`
- [ ] API key is valid: test at https://coda.io/account
- [ ] Basic CLI works: `coda-mcp list-docs`
- [ ] You have at least one document in Coda

## 🎯 Quick Test

Run this to verify everything is working:

```bash
# 1. Check environment
echo "Node version: $(node --version)"
echo "API key set: ${CODA_API_KEY:+Yes}"

# 2. Test CLI
coda-mcp list-docs

# 3. Test programmatic API
node -e "
const CodaClient = require('coda-mcp-client');
const client = new CodaClient(process.env.CODA_API_KEY);
client.listDocs().then(docs => console.log(\`Found \${docs.length} documents\`));
"
```

If all three work, you're ready to go! 🚀
