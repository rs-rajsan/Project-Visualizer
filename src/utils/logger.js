import log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';

// Configure default log level
log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.WARN : log.levels.DEBUG);

/**
 * Enhanced Logger with Request Tracing.
 * Follows Singleton pattern for centralized application logging.
 */
class Logger {
    constructor() {
        this.traceId = null;
        this.context = {};
    }

    /**
     * Initialize a new trace for a specific operation or request flow
     * @param {Object} context - Optional context to attach to the trace
     * @returns {string} The newly generated trace ID
     */
    startTrace(context = {}) {
        this.traceId = uuidv4();
        this.context = { ...context };
        this.debug(`Trace started: [${this.traceId}]`);
        return this.traceId;
    }

    /**
     * End current trace
     */
    endTrace() {
        this.debug(`Trace ended: [${this.traceId}]`);
        this.traceId = null;
        this.context = {};
    }

    _formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const traceData = this.traceId ? ` [TraceID: ${this.traceId}]` : '';
        const metaData = Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}]${traceData} ${message}${metaData}`;
    }

    debug(message, meta = {}) {
        log.debug(this._formatMessage('debug', message, meta));
    }

    info(message, meta = {}) {
        log.info(this._formatMessage('info', message, meta));
    }

    warn(message, meta = {}) {
        log.warn(this._formatMessage('warn', message, meta));
    }

    error(message, error = null, meta = {}) {
        const errorMeta = error ? { ...meta, error: error.message, stack: error.stack } : meta;
        log.error(this._formatMessage('error', message, errorMeta));
    }
}

// Export singleton instance
export const logger = new Logger();
