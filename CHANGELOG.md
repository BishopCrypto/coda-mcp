# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-05-19

### Added
- **Automatic chunked uploads** for large content (eliminates size limitations)
- New `coda_update_page_content` MCP tool for targeted content updates
- Smart content splitting algorithm that preserves markdown formatting
- Enhanced error handling with helpful user guidance
- Production-ready MCP server (`mcp-server.js`) with full protocol compliance

### Fixed
- **MAJOR**: Large content uploads no longer hang or timeout
- Page creation now handles unlimited content sizes seamlessly
- Improved timing for new page content updates
- Better error messages with actionable suggestions

### Changed
- MCP `coda_create_page` now automatically chunks large content
- Enhanced `coda_update_page_content` with automatic chunking support
- Improved rate limiting with proper delays between API calls
- Updated documentation to reflect resolved limitations

### Technical Details
- Content automatically split into 4000-character chunks
- Sequential upload with replace → append → append pattern
- Preserves all markdown formatting across chunk boundaries
- Graceful fallback with informative error messages
- Comprehensive testing with 14,000+ character content

### Why This Release
- Eliminated the last major limitation of the package
- Now truly handles ANY content size without user intervention
- Strengthens competitive advantage as the only fully-working Coda automation solution
- Production-tested and battle-proven

## [1.0.0] - 2025-05-19

### Added
- Complete Coda API client with all major operations
- Document operations (list, get, find)
- Table operations (list, get, create, columns)
- Row operations (list, get, insert, update, delete, search)
- Page operations (list, get, create, update content/metadata)
- CLI interface with comprehensive commands
- MCP (Model Context Protocol) integration examples
- Proper error handling with detailed messages
- Support for markdown and HTML content formats
- Replace and append modes for page updates
- Column name support for readable output
- Utility functions for finding docs/tables by name
- Production-ready with no external dependencies
- Comprehensive documentation and examples

### Technical Details
- Built with Node.js built-ins only (https, fs)
- Proper async/await error handling
- JSON parsing with error recovery
- Environment variable authentication
- CLI with helpful usage messages
- MCP server example for AI automation
- Battle-tested with real Coda workflows

### Why This Release
- Existing Coda clients had broken page operations
- No comprehensive MCP integration available
- Missing CLI tools for Coda automation
- Needed production-ready solution for The Developers' workflows
- Gap in Coda ecosystem for AI automation tools

---

*This project was developed by [Ryan Scott](https://github.com/BishopCrypto) at [The Developers](https://thedevelopers.dev) to fill real gaps in the Coda automation ecosystem.*
