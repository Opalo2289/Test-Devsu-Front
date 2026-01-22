import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ExportService, ExportColumn } from './export.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Mock de file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// Mock parcial de XLSX
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn().mockReturnValue({}),
    book_new: jest.fn().mockReturnValue({}),
    book_append_sheet: jest.fn(),
    sheet_to_csv: jest.fn().mockReturnValue('col1;col2\nval1;val2')
  },
  write: jest.fn().mockReturnValue(new ArrayBuffer(8))
}));

describe('ExportService', () => {
  let service: ExportService;

  const mockData = [
    { id: '1', name: 'Producto 1', description: 'Descripción 1' },
    { id: '2', name: 'Producto 2', description: 'Descripción 2' }
  ];

  const mockColumns: ExportColumn[] = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Nombre', key: 'name', width: 20 },
    { header: 'Descripción', key: 'description', width: 30 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ExportService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(ExportService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('exportToExcel()', () => {
    it('debería exportar datos a Excel', () => {
      service.exportToExcel(mockData, 'test-file', mockColumns);

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalledWith(expect.anything(), {
        bookType: 'xlsx',
        type: 'array'
      });
      expect(saveAs).toHaveBeenCalled();
    });

    it('debería llamar saveAs con el nombre de archivo correcto', () => {
      service.exportToExcel(mockData, 'productos', mockColumns);

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'productos.xlsx'
      );
    });

    it('no debería exportar si el array está vacío', () => {
      service.exportToExcel([], 'empty-file');

      expect(XLSX.utils.json_to_sheet).not.toHaveBeenCalled();
      expect(saveAs).not.toHaveBeenCalled();
    });

    it('debería exportar sin columnas personalizadas', () => {
      service.exportToExcel(mockData, 'test-file');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockData);
    });

    it('debería mapear columnas correctamente', () => {
      service.exportToExcel(mockData, 'test-file', mockColumns);

      // Verificar que se llamó json_to_sheet con datos mapeados
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    });
  });

  describe('exportToCsv()', () => {
    it('debería exportar datos a CSV', () => {
      service.exportToCsv(mockData, 'test-file', mockColumns);

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });

    it('debería llamar saveAs con el nombre de archivo correcto', () => {
      service.exportToCsv(mockData, 'productos', mockColumns);

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'productos.csv'
      );
    });

    it('no debería exportar si el array está vacío', () => {
      service.exportToCsv([], 'empty-file');

      expect(XLSX.utils.json_to_sheet).not.toHaveBeenCalled();
      expect(saveAs).not.toHaveBeenCalled();
    });

    it('debería usar punto y coma como separador', () => {
      service.exportToCsv(mockData, 'test-file');

      expect(XLSX.utils.sheet_to_csv).toHaveBeenCalledWith(
        expect.anything(),
        { FS: ';' }
      );
    });
  });

  describe('generateFilename()', () => {
    it('debería generar nombre con timestamp', () => {
      const filename = service.generateFilename('productos');

      expect(filename).toMatch(/^productos_\d{4}-\d{2}-\d{2}$/);
    });

    it('debería incluir la fecha actual', () => {
      const today = new Date().toISOString().slice(0, 10);
      const filename = service.generateFilename('test');

      expect(filename).toBe(`test_${today}`);
    });
  });

  describe('Server-side rendering', () => {
    it('no debería ejecutar en plataforma servidor', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ExportService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const serverService = TestBed.inject(ExportService);
      
      // No debería lanzar error
      expect(() => {
        serverService.exportToExcel(mockData, 'test');
        serverService.exportToCsv(mockData, 'test');
      }).not.toThrow();

      // Pero no debería llamar a las funciones de exportación
      expect(saveAs).not.toHaveBeenCalled();
    });
  });
});
