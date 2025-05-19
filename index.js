/**
 * @thedevelopers/coda-mcp-client
 * Complete Coda API client with MCP integration for AI automation
 * 
 * Developed by Ryan Scott at The Developers (https://thedevelopers.dev)
 * MIT License
 */

const https = require('https');

/**
 * Coda API Client
 * Provides comprehensive Coda integration without external dependencies
 */
class CodaClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://coda.io/apis/v1';
        this.headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make HTTP request to Coda API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.baseUrl + endpoint);
            
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: method,
                headers: this.headers
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(parsedData);
                        } else {
                            reject(new Error(`API Error ${res.statusCode}: ${parsedData.message || responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`Parse Error: ${error.message}\nResponse: ${responseData}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    // Document Operations
    
    /**
     * List all accessible documents
     * @returns {Promise<Array>} Array of document objects
     */
    async listDocs() {
        const response = await this.makeRequest('/docs');
        return response.items || [];
    }

    /**
     * Get document details
     * @param {string} docId - Document ID
     * @returns {Promise<Object>} Document object
     */
    async getDoc(docId) {
        return await this.makeRequest(`/docs/${docId}`);
    }

    // Table Operations
    
    /**
     * List tables in a document
     * @param {string} docId - Document ID
     * @returns {Promise<Array>} Array of table objects
     */
    async listTables(docId) {
        const response = await this.makeRequest(`/docs/${docId}/tables`);
        return response.items || [];
    }

    /**
     * Get table details
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @returns {Promise<Object>} Table object
     */
    async getTable(docId, tableId) {
        return await this.makeRequest(`/docs/${docId}/tables/${tableId}`);
    }

    /**
     * Create a new table
     * @param {string} docId - Document ID
     * @param {Object} tableData - Table configuration
     * @returns {Promise<Object>} Created table object
     */
    async createTable(docId, tableData) {
        const data = {
            name: tableData.name,
            columns: tableData.columns || []
        };
        
        return await this.makeRequest(`/docs/${docId}/tables`, 'POST', data);
    }

    // Row Operations
    
    /**
     * List rows in a table
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @param {Object} options - Query options (limit, useColumnNames, query)
     * @returns {Promise<Array>} Array of row objects
     */
    async listRows(docId, tableId, options = {}) {
        let endpoint = `/docs/${docId}/tables/${tableId}/rows`;
        const params = new URLSearchParams();
        
        if (options.limit) params.append('limit', options.limit);
        if (options.useColumnNames) params.append('useColumnNames', 'true');
        if (options.query) params.append('query', options.query);
        
        if (params.toString()) {
            endpoint += '?' + params.toString();
        }
        
        const response = await this.makeRequest(endpoint);
        return response.items || [];
    }

    /**
     * Get specific row
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @param {string} rowId - Row ID
     * @returns {Promise<Object>} Row object
     */
    async getRow(docId, tableId, rowId) {
        return await this.makeRequest(`/docs/${docId}/tables/${tableId}/rows/${rowId}`);
    }

    /**
     * Insert new row
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @param {Object} cells - Cell values as key-value pairs
     * @param {Object} options - Insert options (keyColumns)
     * @returns {Promise<Object>} Insert result
     */
    async insertRow(docId, tableId, cells, options = {}) {
        const data = {
            rows: [{
                cells: cells
            }]
        };
        
        if (options.keyColumns) {
            data.keyColumns = options.keyColumns;
        }
        
        return await this.makeRequest(`/docs/${docId}/tables/${tableId}/rows`, 'POST', data);
    }

    /**
     * Update existing row
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @param {string} rowId - Row ID
     * @param {Object} cells - Cell values to update
     * @returns {Promise<Object>} Update result
     */
    async updateRow(docId, tableId, rowId, cells) {
        const data = {
            row: {
                cells: cells
            }
        };
        
        return await this.makeRequest(`/docs/${docId}/tables/${tableId}/rows/${rowId}`, 'PUT', data);
    }

    /**
     * Delete row
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @param {string} rowId - Row ID
     * @returns {Promise<Object>} Delete result
     */
    async deleteRow(docId, tableId, rowId) {
        return await this.makeRequest(`/docs/${docId}/tables/${tableId}/rows/${rowId}`, 'DELETE');
    }

    // Column Operations
    
    /**
     * List columns in a table
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @returns {Promise<Array>} Array of column objects
     */
    async listColumns(docId, tableId) {
        const response = await this.makeRequest(`/docs/${docId}/tables/${tableId}/columns`);
        return response.items || [];
    }

    // Page Operations
    
    /**
     * List pages in a document
     * @param {string} docId - Document ID
     * @returns {Promise<Array>} Array of page objects
     */
    async listPages(docId) {
        const response = await this.makeRequest(`/docs/${docId}/pages`);
        return response.items || [];
    }

    /**
     * Get page details
     * @param {string} docId - Document ID
     * @param {string} pageId - Page ID
     * @returns {Promise<Object>} Page object
     */
    async getPage(docId, pageId) {
        return await this.makeRequest(`/docs/${docId}/pages/${pageId}`);
    }

    /**
     * Create new page
     * @param {string} docId - Document ID
     * @param {Object} pageData - Page configuration
     * @returns {Promise<Object>} Created page object
     */
    async createPage(docId, pageData) {
        const data = {
            name: pageData.name
        };
        
        if (pageData.subtitle) data.subtitle = pageData.subtitle;
        if (pageData.iconName) data.iconName = pageData.iconName;
        if (pageData.imageUrl) data.imageUrl = pageData.imageUrl;
        if (pageData.parentPageId) data.parentPageId = pageData.parentPageId;
        if (pageData.pageContent) data.pageContent = pageData.pageContent;
        
        return await this.makeRequest(`/docs/${docId}/pages`, 'POST', data);
    }

    /**
     * Update page content
     * @param {string} docId - Document ID
     * @param {string} pageId - Page ID
     * @param {string} content - New content
     * @param {string} insertionMode - 'replace' or 'append'
     * @param {string} format - 'markdown' or 'html'
     * @returns {Promise<Object>} Update result
     */
    async updatePageContent(docId, pageId, content, insertionMode = 'replace', format = 'markdown') {
        const data = {
            contentUpdate: {
                insertionMode: insertionMode,
                canvasContent: {
                    format: format,
                    content: content
                }
            }
        };
        
        return await this.makeRequest(`/docs/${docId}/pages/${pageId}`, 'PUT', data);
    }

    /**
     * Update page metadata (name, subtitle, icon)
     * @param {string} docId - Document ID
     * @param {string} pageId - Page ID
     * @param {Object} metadata - Metadata to update
     * @returns {Promise<Object>} Update result
     */
    async updatePageMetadata(docId, pageId, metadata) {
        const data = {};
        if (metadata.name) data.name = metadata.name;
        if (metadata.subtitle) data.subtitle = metadata.subtitle;
        if (metadata.iconName) data.iconName = metadata.iconName;
        if (metadata.imageUrl) data.imageUrl = metadata.imageUrl;
        
        return await this.makeRequest(`/docs/${docId}/pages/${pageId}`, 'PUT', data);
    }

    // Utility Functions
    
    /**
     * Find document by name (case-insensitive partial match)
     * @param {string} name - Document name or partial name
     * @returns {Promise<Object|null>} Found document or null
     */
    async findDocByName(name) {
        const docs = await this.listDocs();
        return docs.find(doc => doc.name.toLowerCase().includes(name.toLowerCase()));
    }

    /**
     * Find table by name (case-insensitive partial match)
     * @param {string} docId - Document ID
     * @param {string} name - Table name or partial name
     * @returns {Promise<Object|null>} Found table or null
     */
    async findTableByName(docId, name) {
        const tables = await this.listTables(docId);
        return tables.find(table => table.name.toLowerCase().includes(name.toLowerCase()));
    }

    /**
     * Search rows by column value
     * @param {string} docId - Document ID
     * @param {string} tableId - Table ID
     * @param {string} columnName - Column name to search
     * @param {string} value - Value to search for
     * @returns {Promise<Array>} Matching rows
     */
    async searchRows(docId, tableId, columnName, value) {
        const rows = await this.listRows(docId, tableId, { useColumnNames: true });
        return rows.filter(row => {
            const cellValue = row.values[columnName];
            if (typeof cellValue === 'string') {
                return cellValue.toLowerCase().includes(value.toLowerCase());
            }
            return cellValue == value;
        });
    }
}

module.exports = CodaClient;
