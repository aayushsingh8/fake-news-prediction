// Export utilities for CSV and PDF generation
import jsPDF from 'jspdf';

export interface AnalysisRecord {
  id: string;
  type: 'url' | 'text' | 'document';
  input: string;
  result: 'REAL' | 'FAKE' | 'UNKNOWN';
  confidence: number;
  timestamp: number;
  details?: string;
}

export function exportToCSV(records: AnalysisRecord[], filename: string = 'analysis-history'): void {
  const headers = ['ID', 'Type', 'Input', 'Result', 'Confidence', 'Date', 'Details'];
  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      record.id,
      record.type,
      `"${record.input.replace(/"/g, '""').substring(0, 200)}"`,
      record.result,
      `${(record.confidence * 100).toFixed(1)}%`,
      new Date(record.timestamp).toISOString(),
      `"${(record.details || '').replace(/"/g, '""').substring(0, 500)}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToPDF(records: AnalysisRecord[], title: string = 'Analysis Report'): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(128, 0, 255); // Purple
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Total Records: ${records.length}`, pageWidth / 2, 34, { align: 'center' });
  
  // Stats summary
  const realCount = records.filter(r => r.result === 'REAL').length;
  const fakeCount = records.filter(r => r.result === 'FAKE').length;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 128, 0);
  doc.text(`REAL: ${realCount}`, 20, 45);
  doc.setTextColor(255, 0, 0);
  doc.text(`FAKE: ${fakeCount}`, 70, 45);
  doc.setTextColor(100);
  doc.text(`UNKNOWN: ${records.length - realCount - fakeCount}`, 120, 45);
  
  // Records
  let yPos = 60;
  const lineHeight = 6;
  
  doc.setFontSize(9);
  records.forEach((record, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setTextColor(60);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${index + 1} - ${record.type.toUpperCase()}`, 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(record.result === 'REAL' ? 34 : record.result === 'FAKE' ? 255 : 100, 
                     record.result === 'REAL' ? 139 : 0, 
                     record.result === 'REAL' ? 34 : record.result === 'FAKE' ? 0 : 100);
    doc.text(`${record.result} (${(record.confidence * 100).toFixed(1)}%)`, 150, yPos);
    
    yPos += lineHeight;
    doc.setTextColor(80);
    const inputText = record.input.length > 80 ? record.input.substring(0, 80) + '...' : record.input;
    doc.text(inputText, 20, yPos);
    
    yPos += lineHeight;
    doc.setTextColor(120);
    doc.text(`Date: ${new Date(record.timestamp).toLocaleString()}`, 20, yPos);
    
    yPos += lineHeight + 4;
    doc.setDrawColor(200);
    doc.line(20, yPos - 2, pageWidth - 20, yPos - 2);
  });
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}
