# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
