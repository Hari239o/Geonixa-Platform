export interface PDFExportOptions {
  filename?: string;
  title?: string;
  subject?: string;
}

/**
 * Export HTML content to PDF using the browser's print functionality
 * @param htmlContent - HTML content to export
 * @param options - Export options
 */
export async function exportToPDF(
  htmlContent: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'report.pdf',
    title = 'Report',
    subject = 'Exam Report',
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Set document metadata
      if (printWindow.document.title !== title) {
        printWindow.document.title = title;
      }

      // Wait for content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          resolve();
        }, 250);
      };

      // Fallback if onload doesn't fire
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve();
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download HTML content as a file
 * @param htmlContent - HTML content to download
 * @param filename - Filename for download
 */
export function downloadHTML(htmlContent: string, filename: string = 'report.html'): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download JSON data as a file
 * @param data - Data to download
 * @param filename - Filename for download
 */
export function downloadJSON(data: any, filename: string = 'data.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download CSV data as a file
 * @param data - Array of objects to convert to CSV
 * @param filename - Filename for download
 */
export function downloadCSV(
  data: Record<string, any>[],
  filename: string = 'data.csv'
): void {
  if (!data || data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
