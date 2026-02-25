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

/**
 * Interface Skeleton for Jira Integration
 */
export class JiraIntegration extends ProjectManagementIntegration {
    async authenticate() {
        // Implementation for OAuth2 or API Token
        console.log("Jira authentication placeholder");
        return true;
    }

    async fetchProjects() {
        // GET /rest/api/3/project/search
        return [];
    }

    async fetchProjectData(projectId) {
        // GET /rest/api/3/search?jql=project=${projectId}
        // Map issues -> tasks and link dependencies
        return { rawData: [], nodes: [], edges: [] };
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
