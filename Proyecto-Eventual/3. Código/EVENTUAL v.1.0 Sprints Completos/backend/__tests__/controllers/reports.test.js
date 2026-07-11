const request = require('supertest');
const { createTestApp } = require('../testApp');

const app = createTestApp();

jest.mock('../../src/config/supabase');
const supabase = require('../../src/config/supabase');

let chain;
beforeEach(() => {
  jest.clearAllMocks();
  chain = createMockChain();
  supabase.from.mockReturnValue(chain);
});

describe('RF13 - Generar Reportes', () => {
  describe('GET /api/reports/participation', () => {
    test('Reporte de participación con datos retorna 200', async () => {
      chain.data = [{ id: 1, nombre: 'Fiesta', tipo_evento: 'Social', estado: 'Cerrado', total_presentes: 40, tasa_participacion: 80, fecha: '2026-06-15', lugar: 'Salón' }];
      chain.then.mockImplementation(resolve => resolve({ count: 50 }));
      const res = await request(app).get('/api/reports/participation').set('Authorization', `Bearer ${presidenteToken}`)
        .query({ fecha_desde: '2026-01-01', fecha_hasta: '2026-12-31' });
      expect(res.status).toBe(200);
      expect(res.body.eventos).toBeDefined();
    });

    test('Participación sin datos retorna 200 con arrays vacíos', async () => {
      chain.data = [];
      const res = await request(app).get('/api/reports/participation').set('Authorization', `Bearer ${presidenteToken}`)
        .query({ fecha_desde: '2025-01-01', fecha_hasta: '2025-01-31' });
      expect(res.status).toBe(200);
      expect(res.body.eventos).toEqual([]);
    });
  });

  describe('GET /api/reports/history', () => {
    test('Reporte de historial retorna 200', async () => {
      chain.data = [{ id: 1, nombre: 'Fiesta', estado: 'Cerrado', fecha: '2026-06-15', tipo_evento: 'Social', hora: '18:00', lugar: 'Salón' }];
      chain.single.mockResolvedValue({ data: { nombres: 'Juan', apellidos: 'Pérez' }, error: null });
      const res = await request(app).get('/api/reports/history').set('Authorization', `Bearer ${presidenteToken}`)
        .query({ fecha_desde: '2026-01-01', fecha_hasta: '2026-12-31' });
      expect(res.status).toBe(200);
      expect(res.body.eventos).toBeDefined();
    });

    test('Historial filtrado por estado retorna 200', async () => {
      chain.data = [];
      const res = await request(app).get('/api/reports/history?estado=Cerrado').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/reports/liquidations', () => {
    test('Reporte de liquidaciones retorna 200', async () => {
      chain.data = [{ id: 1, nombre: 'Fiesta', tipo_evento: 'Social', fecha: '2026-06-15', estado: 'Cerrado', presupuesto_total: 500, total_gastos: 300, total_presentes: 40, tasa_participacion: 80, fecha_cierre: '2026-06-16' }];
      chain.then
        .mockImplementationOnce(resolve => resolve({ data: [{ categoria: 'Sonido', monto: 200 }], error: null }))
        .mockImplementationOnce(resolve => resolve({ data: [{ monto: 500 }], error: null }));
      const res = await request(app).get('/api/reports/liquidations').set('Authorization', `Bearer ${presidenteToken}`)
        .query({ fecha_desde: '2026-01-01', fecha_hasta: '2026-12-31' });
      expect(res.status).toBe(200);
      expect(res.body.liquidaciones).toBeDefined();
    });
  });
});
