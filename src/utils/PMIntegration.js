/**
 * Abstract Base Class for Project Management Integrations
 * Defines the standard interface for connecting external tools like Jira or MS Project.
 */
/* eslint-disable no-unused-vars */
export class ProjectManagementIntegration {
    constructor(config = {}) {
        this.config = config;
        this.isAuthenticated = false;
    }

    /**
     * Authenticate with the external service
     * @returns {Promise<boolean>}
     */
    async authenticate() {
        throw new Error("authenticate() must be implemented by subclass");
    }

    /**
     * Fetch all available projects
     * @returns {Promise<Array>} List of standardized project metadata
     */
    async fetchProjects() {
        throw new Error("fetchProjects() must be implemented by subclass");
    }

    /**
     * Fetch tasks and dependencies for a specific project
     * @param {string} projectId 
     * @returns {Promise<Object>} { rawData: Array, nodes: Array, edges: Array }
     */
    async fetchProjectData(projectId) {
        throw new Error("fetchProjectData() must be implemented by subclass");
    }

    /**
     * Update a task in the external service
     * @param {string} taskId 
     * @param {Object} updates 
     */
    async updateTask(taskId, updates) {
        throw new Error("updateTask() must be implemented by subclass");
    }

    /**
     * Standardizes external data format to Project-Flow's internal format
     * @param {any} externalData 
     * @returns {Array} Standardized rawData rows
     */
    _standardize(externalData) {
        throw new Error("_standardize() must be implemented by subclass");
    }
}

import axios from 'axios';
import base64 from 'base-64';

/**
 * Interface Skeleton for Jira Integration
 */
export class JiraIntegration extends ProjectManagementIntegration {
    constructor(config) {
        super(config);
        // config = { url: "https://domain.atlassian.net", email: "user@domain.com", apiToken: "xxx" }
        this.api = axios.create({
            baseURL: config.url,
            headers: {
                'Authorization': `Basic ${base64.encode(`${config.email}:${config.apiToken}`)}`,
                'Accept': 'application/json'
            }
        });
    }

    async authenticate() {
        try {
            const response = await this.api.get('/rest/api/3/myself');
            if (response.status === 200) {
                this.isAuthenticated = true;
                return true;
            }
            return false;
        } catch (error) {
            console.error("Jira authentication failed", error);
            return false;
        }
    }

    async fetchProjects() {
        try {
            const response = await this.api.get('/rest/api/3/project/search');
            return response.data.values.map(p => ({
                id: p.id,
                key: p.key,
                name: p.name
            }));
        } catch (error) {
            console.error("Failed to fetch Jira projects", error);
            throw error;
        }
    }

    async fetchProjectData(projectKey) {
        try {
            const jql = `project=${projectKey} ORDER BY created ASC`;
            const response = await this.api.get(`/rest/api/3/search`, {
                params: {
                    jql: jql,
                    maxResults: 100, // Handle pagination in production
                    fields: 'summary,issuetype,status,assignee,created,duedate,issuelinks,parent,timeoriginalestimate'
                }
            });

            const issues = response.data.issues;
            const rawData = this._standardize(issues);
            return { rawData };
        } catch (error) {
            console.error(`Failed to fetch Jira project data for ${projectKey}`, error);
            throw error;
        }
    }

    _standardize(issues) {
        // Map Jira issues to our App's standard rawData array: 
        // { id, phase, milestone, task, dependency, assignee, startDate, endDate, status }

        const rawData = [];

        // Build a lookup for parent->epic mapping later if needed, but for simplicity:
        // Assume Epic = Phase, Story = Task
        // Alternatively, default Phase = "Jira Imports", Milestone = "Sprint or unassigned"

        issues.forEach(issue => {
            const fields = issue.fields;
            const issueType = fields.issuetype?.name || 'Task';

            // Map Dates
            const startDate = fields.created ? new Date(fields.created).toISOString().split('T')[0] : null;
            const endDate = fields.duedate ? new Date(fields.duedate).toISOString().split('T')[0] : null;

            // Map Dependencies (Outward links where type is blocks/depends on)
            let dependencyList = [];
            if (fields.issuelinks && fields.issuelinks.length > 0) {
                fields.issuelinks.forEach(link => {
                    if (link.outwardIssue && link.type.name === 'Blocks') {
                        dependencyList.push(link.outwardIssue.key);
                    }
                });
            }

            rawData.push({
                id: issue.key,
                phase: 'Imported', // Could map to Epic
                milestone: issueType, // Group by issue type e.g., Story, Bug
                task: fields.summary || issue.key,
                dependency: dependencyList.join(',') || '',
                assignee: fields.assignee?.displayName || 'Unassigned',
                duration: fields.timeoriginalestimate ? Math.ceil(fields.timeoriginalestimate / 86400) : 1, // converting seconds to days roughly
                startDate: startDate || '',
                endDate: endDate || '',
                status: fields.status?.name || 'To Do'
            });
        });

        return rawData;
    }
}

/**
 * Interface Skeleton for MS Project Integration
 */
export class MSProjectIntegration extends ProjectManagementIntegration {
    async authenticate() {
        // Implementation for Azure AD / MS Graph
        console.log("MS Project authentication placeholder");
        return true;
    }

    async fetchProjects() {
        // GET /_api/ProjectServer/Projects
        return [];
    }

    async fetchProjectData(projectId) {
        // GET /_api/ProjectServer/Projects('${projectId}')/Tasks
        // GET /_api/ProjectServer/Projects('${projectId}')/TaskLinks
        return { rawData: [], nodes: [], edges: [] };
    }
}
