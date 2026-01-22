import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Exporta datos a un archivo Excel (.xlsx)
   * @param data Array de objetos a exportar
   * @param filename Nombre del archivo (sin extensión)
   * @param columns Configuración opcional de columnas
   */
  exportToExcel<T extends object>(
    data: T[],
    filename: string,
    columns?: ExportColumn[]
  ): void {
    if (!this.isBrowser || data.length === 0) return;

    try {
      // Preparar datos
      const exportData = this.prepareData(data, columns);
      
      // Crear workbook y worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      // Aplicar anchos de columna si se especificaron
      if (columns) {
        worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
      }
      
      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
      
      // Generar buffer y guardar
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('No se pudo exportar el archivo Excel');
    }
  }

  /**
   * Exporta datos a un archivo CSV
   * @param data Array de objetos a exportar
   * @param filename Nombre del archivo (sin extensión)
   * @param columns Configuración opcional de columnas
   */
  exportToCsv<T extends object>(
    data: T[],
    filename: string,
    columns?: ExportColumn[]
  ): void {
    if (!this.isBrowser || data.length === 0) return;

    try {
      // Preparar datos
      const exportData = this.prepareData(data, columns);
      
      // Crear worksheet y convertir a CSV
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
      
      // Agregar BOM para UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      saveAs(blob, `${filename}.csv`);
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      throw new Error('No se pudo exportar el archivo CSV');
    }
  }

  /**
   * Prepara los datos para exportación, aplicando mapeo de columnas si existe
   */
  private prepareData<T extends object>(
    data: T[],
    columns?: ExportColumn[]
  ): Record<string, unknown>[] {
    if (!columns) {
      return data as unknown as Record<string, unknown>[];
    }

    return data.map(item => {
      const row: Record<string, unknown> = {};
      const itemRecord = item as Record<string, unknown>;
      columns.forEach(col => {
        row[col.header] = itemRecord[col.key];
      });
      return row;
    });
  }

  /**
   * Genera un nombre de archivo con timestamp
   * @param baseName Nombre base del archivo
   */
  generateFilename(baseName: string): string {
    const date = new Date();
    const timestamp = date.toISOString().slice(0, 10);
    return `${baseName}_${timestamp}`;
  }
}
