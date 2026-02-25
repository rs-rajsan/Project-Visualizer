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
    progress: ['progress', 'percent complete', '% complete', 'completion', 'status'],
    snowTicket: ['snow ticket', 'servicenow', 'incident', 'chg', 'req', 'snow']
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
     * Parse MS Project XML export
     */
    static async _parseMSProjectXML(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");

                    // Basic validation
                    const projectNode = xmlDoc.querySelector("Project");
                    if (!projectNode) {
                        throw new Error("Invalid MS Project XML structure.");
                    }

                    const rawData = [];
                    // Tasks
                    const tasks = xmlDoc.querySelectorAll("Project > Tasks > Task");
                    if (!tasks || tasks.length === 0) {
                        logger.warn("No tasks found in XML export.", { fileName: file.name });
                        resolve([]);
                        return;
                    }

                    // For Assignees mapping (Resource UID -> Name)
                    const resources = xmlDoc.querySelectorAll("Project > Resources > Resource");
                    const resourceMap = new Map();
                    resources.forEach(res => {
                        const uid = res.querySelector("UID")?.textContent;
                        const name = res.querySelector("Name")?.textContent;
                        if (uid && name) {
                            resourceMap.set(uid, name);
                        }
                    });

                    // For Assignments (Task UID -> Resource UID)
                    const assignments = xmlDoc.querySelectorAll("Project > Assignments > Assignment");
                    const assignmentMap = new Map(); // Task UID -> array of Resource Names
                    assignments.forEach(assn => {
                        const taskUID = assn.querySelector("TaskUID")?.textContent;
                        const resUID = assn.querySelector("ResourceUID")?.textContent;
                        if (taskUID && resUID && resourceMap.has(resUID)) {
                            if (!assignmentMap.has(taskUID)) assignmentMap.set(taskUID, []);
                            assignmentMap.get(taskUID).push(resourceMap.get(resUID));
                        }
                    });

                    // We need to establish phases and milestones based on Outline levels
                    // We will do a generic pass to build the rawData list
                    tasks.forEach(task => {
                        const outlineLevel = task.querySelector("OutlineLevel")?.textContent;
                        // Skip root project summary task, usually OutlineLevel 0
                        if (!outlineLevel || outlineLevel === "0") return;

                        const uid = task.querySelector("UID")?.textContent;
                        const defaultId = task.querySelector("ID")?.textContent;
                        const name = task.querySelector("Name")?.textContent;
                        if (!name) return; // Ignore empty rows

                        const start = task.querySelector("Start")?.textContent; // format: 2023-10-25T08:00:00
                        const finish = task.querySelector("Finish")?.textContent;
                        const startFormat = start ? start.split('T')[0] : '';
                        const finishFormat = finish ? finish.split('T')[0] : '';

                        const isMilestone = task.querySelector("Milestone")?.textContent === "1";
                        const isSummary = task.querySelector("Summary")?.textContent === "1";

                        // Dependencies (PredecessorLinks)
                        const predLinks = task.querySelectorAll("PredecessorLink");
                        const dependencies = [];
                        predLinks.forEach(link => {
                            const predUID = link.querySelector("PredecessorUID")?.textContent;
                            if (predUID) dependencies.push(predUID);
                        });

                        const taskAssignees = assignmentMap.get(uid) || [];

                        rawData.push({
                            id: uid || defaultId, // Prefer UID
                            name: name,
                            phase: isSummary ? name : 'General', // Fallback, we'll refine this
                            milestone: isMilestone ? name : '',
                            dependencies: dependencies.join(','),
                            startDate: startFormat,
                            endDate: finishFormat,
                            assignee: taskAssignees.join(', '),
                            percentComplete: task.querySelector("PercentComplete")?.textContent || '0',
                            isSummary: isSummary,
                            outlineLevel: outlineLevel
                        });
                    });

                    // Post-processing: Apply correct Phases based on outline parent structure
                    const outlineStack = [];
                    rawData.forEach(task => {
                        const level = parseInt(task.outlineLevel, 10);

                        // Keep stack aligned with current level
                        while (outlineStack.length > 0 && outlineStack[outlineStack.length - 1].level >= level) {
                            outlineStack.pop();
                        }

                        if (task.isSummary) {
                            outlineStack.push({ level: level, name: task.name });
                        }

                        // Determine phase based on top-level summary task (Level 1)
                        const phaseSummary = outlineStack.find(s => s.level === 1);
                        if (phaseSummary) {
                            task.phase = phaseSummary.name;
                        } else if (!task.isSummary) {
                            task.phase = "General Tasks";
                        }
                    });

                    // Remove Summary tasks from final dataset (they are structural in MS Project)
                    // If we removed them, we'd lose connection if tasks depend on a phase. So we keep them,
                    // but they acts as 'tasks' in our system right now. If we drop them, we need to map their IDs
                    // Currently, let's keep them and rely on standard processing. Our Gantt groups by Phase automatically.
                    // Wait, if we keep them, they draw as tasks. Better to remove them if they are just grouping folders.
                    const finalData = rawData.filter(t => !t.isSummary);

                    logger.info(`Successfully parsed MS Project XML: ${finalData.length} tasks extracted.`);
                    resolve(finalData);

                } catch (error) {
                    logger.error("Failed to parse MS Project XML", error);
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
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
            } else if (file.name.endsWith('.xml')) {
                rawData = await this._parseMSProjectXML(file);
            } else {
                throw new Error("Unsupported file format. Please upload CSV, Excel, or MS Project XML.");
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
     * Process a baseline file and merge its dates into existing rawData
     * @param {File} file
     * @param {Array<Object>} currentRawData
     * @returns {Array<Object>} Updated rawData with baseline properties mapped
     */
    static async processBaselineFile(file, currentRawData) {
        const traceId = logger.startTrace({ action: 'process_baseline', fileName: file.name });
        try {
            let baselineRaw = [];
            if (file.name.endsWith('.csv')) {
                baselineRaw = await this._parseCSV(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                baselineRaw = await this._parseExcel(file);
            } else if (file.name.endsWith('.xml')) {
                baselineRaw = await this._parseMSProjectXML(file);
            } else {
                throw new Error("Unsupported file format for baseline.");
            }

            const standardizedBaseline = this._standardizeData(baselineRaw);
            const baselineMap = new Map();
            standardizedBaseline.forEach(row => {
                if (row.id) baselineMap.set(String(row.id).trim(), row);
            });

            // Merge details
            const updatedData = currentRawData.map(task => {
                const bTask = baselineMap.get(String(task.id).trim());
                if (bTask) {
                    return {
                        ...task,
                        baselineStartDate: bTask.startDate,
                        baselineEndDate: bTask.endDate,
                        baselineCost: bTask.cost
                    };
                }
                return task;
            });

            logger.info(`Baseline merged for ${updatedData.length} tasks`, { traceId });
            return updatedData;
        } catch (error) {
            logger.error('Failed to process baseline', error);
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
