import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { logger } from './logger';

export class ExportService {
    /**
     * Exports the project data to a CSV file.
     * @param {Array<Object>} data - Standardized rawData from state
     * @param {string} fileName - Base filename
     */
    static exportToCSV(data, fileName = 'project_export.csv') {
        const traceId = logger.startTrace({ action: 'export_csv', rowCount: data.length });
        try {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            logger.info('Project data exported to CSV successfully', { traceId });
        } catch (error) {
            logger.error('Failed to export CSV', error);
        } finally {
            logger.endTrace();
        }
    }

    /**
     * Exports the project data to an Excel (.xlsx) file.
     * @param {Array<Object>} data - Standardized rawData from state
     * @param {string} fileName - Base filename
     */
    static exportToExcel(data, fileName = 'project_export.xlsx') {
        const traceId = logger.startTrace({ action: 'export_excel', rowCount: data.length });
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

            // Generate buffer and trigger download
            XLSX.writeFile(workbook, fileName);

            logger.info('Project data exported to Excel successfully', { traceId });
        } catch (error) {
            logger.error('Failed to export Excel', error);
        } finally {
            logger.endTrace();
        }
    }
}
