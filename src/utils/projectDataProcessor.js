import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { logger } from './logger';

// Fuzzy header mapping configuration for SOLID Single Responsibility Principle
const HEADER_ALIASES = {
    id: ['id', 'task id', 'task no', 'no', 'identifier'],
    name: ['name', 'task name', 'description', 'title', 'summary', 'task description'],
    phase: ['phase', 'stage', 'category', 'group'],
    milestone: ['milestone', 'sub-phase', 'deliverable'],
    dependencies: ['dependencies', 'predecessors', 'depends on', 'predecessor', 'blocking'],
    cost: ['cost', 'effort', 'duration', 'days', 'hours', 'budget'],
    startDate: ['start date', 'start', 'begin', 'created'],
    endDate: ['end date', 'end', 'due', 'due date', 'deadline'],
    assignee: ['assignee', 'owner', 'resource', 'assigned to', 'person'],
    progress: ['progress', 'percent complete', '% complete', 'completion', 'status']
};

export class ProjectDataProcessor {
    /**
     * Maps a raw header to a standardized key using fuzzy matching
     * @param {string} rawHeader 
     * @returns {string} Standardized key or original if no match
     */
    static _mapHeader(rawHeader) {
        if (!rawHeader) return '';
        const normalized = String(rawHeader).trim().toLowerCase();

        for (const [standardKey, aliases] of Object.entries(HEADER_ALIASES)) {
            if (aliases.includes(normalized)) {
                return standardKey;
            }
        }
        return normalized; // Fallback to raw normalized header
    }

    /**
     * Processes an array of raw row objects mapping their keys
     * @param {Array<Object>} rawData 
     * @returns {Array<Object>} Standardized data
     */
    static _standardizeData(rawData) {
        logger.debug(`Standardizing ${rawData.length} rows`);
        return rawData.map((row, index) => {
            const standardizedRow = {};

            // We also need to guarantee an ID exists.
            for (const [key, value] of Object.entries(row)) {
                const standardKey = this._mapHeader(key);
                // Clean trailing spaces in values
                standardizedRow[standardKey] = typeof value === 'string' ? value.trim() : value;
            }

            // Auto-generate ID if missing
            if (!standardizedRow.id) {
                logger.warn(`Row ${index + 1} missing ID. Auto-generating.`);
                standardizedRow.id = `auto-task-${index}`;
            }

            // Ensure name exists
            if (!standardizedRow.name) {
                standardizedRow.name = `Task ${standardizedRow.id}`;
            }

            return standardizedRow;
        });
    }

    /**
     * Parse CSV File relying on PapaParse
     */
    static async _parseCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    logger.info(`Successfully parsed CSV: ${results.data.length} rows`);
                    resolve(results.data);
                },
                error: (error) => {
                    logger.error('Error parsing CSV', error);
                    reject(error);
                }
            });
        });
    }

    /**
     * Parse Excel File relying on SheetJS (xlsx)
     */
    static async _parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // Include empty cells
                    logger.info(`Successfully parsed Excel: ${json.length} rows from sheet ${firstSheetName}`);
                    resolve(json);
                } catch (error) {
                    logger.error('Error parsing Excel', error);
                    reject(error);
                }
            };
            reader.onerror = (error) => {
                logger.error('FileReader error during Excel parsing', error);
                reject(error);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Process a file (CSV/Excel) and extract React Flow nodes and edges
     * @param {File} file 
     */
    static async processFile(file) {
        const traceId = logger.startTrace({ action: 'process_file', fileName: file.name, fileType: file.type });
        try {
            let rawData = [];

            if (file.name.endsWith('.csv')) {
                rawData = await this._parseCSV(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                rawData = await this._parseExcel(file);
            } else {
                throw new Error("Unsupported file format. Please upload CSV or Excel.");
            }

            const standardizedData = this._standardizeData(rawData);
            const { nodes, edges } = this._convertToGraphData(standardizedData);

            logger.info(`Extraction complete: ${nodes.length} nodes, ${edges.length} edges`, { traceId });
            return { nodes, edges, rawData: standardizedData };
        } catch (error) {
            logger.error('Failed to process file', error);
            throw error;
        } finally {
            logger.endTrace();
        }
    }

    /**
     * Converts standardized tabular data into React Flow nodes and edges
     * @param {Array<Object>} data 
     */
    static _convertToGraphData(data) {
        const nodes = [];
        const edges = [];
        const idSet = new Set();

        // First pass: Create Nodes
        data.forEach(row => {
            if (!row.id) return; // Defensive check
            const id = String(row.id).trim();
            idSet.add(id);

            nodes.push({
                id: id,
                type: 'customTask', // Links to CustomNode.jsx
                data: {
                    ...row, // inject all custom data into Node data context
                    label: row.name,
                },
                position: { x: 0, y: 0 } // Default. Dagre will handle explicit positioning
            });
        });

        // Second pass: Create Edges (Dependencies)
        data.forEach(row => {
            const targetId = String(row.id).trim();
            const depsRaw = row.dependencies;

            if (depsRaw) {
                // Handle comma-separated list of dependencies
                const deps = String(depsRaw).split(',').map(d => d.trim()).filter(d => Boolean(d));

                deps.forEach(sourceId => {
                    if (idSet.has(sourceId)) {
                        edges.push({
                            id: `e-${sourceId}-${targetId}`,
                            source: sourceId,
                            target: targetId,
                            type: 'smoothstep', // Base routing
                            animated: true,
                            style: { stroke: '#94a3b8', strokeWidth: 2 } // Fallback default styling (slate-400). Phase 4 refines this.
                        });
                    } else {
                        logger.warn(`Dependency '${sourceId}' for task '${targetId}' not found in dataset.`);
                    }
                });
            }
        });

        return { nodes, edges };
    }
}
