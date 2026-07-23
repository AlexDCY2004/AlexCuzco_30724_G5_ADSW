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

describe('RF11 - Cotizaciones', () => {
  const EV1 = '00000000-0000-4000-8000-000000000001';
  const PR1 = '00000000-0000-4000-8000-0000000000b1';

  describe('POST /api/quotations', () => {
    test('Crear cotización retorna 201', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { cupo_maximo: 50 }, error: null })
        .mockResolvedValueOnce({ data: { id: 1, evento_id: EV1, proveedor: 'Sonido Pro', monto: 300, categoria: 'Sonido' }, error: null });
      const res = await request(app).post('/api/quotations').set('Authorization', `Bearer ${presidenteToken}`)
        .send({ evento_id: EV1, proveedor_id: PR1, monto: 300, tipo_servicio: 'Sonido', descripcion: 'Equipo completo', fecha_validez: '2027-01-01' });
      expect(res.status).toBe(201);
    });
  });

  describe('PATCH /api/quotations/:id/preferred', () => {
    test('Marcar como preferida retorna 200', async () => {
      chain.data = null;
      chain.error = null;
      const res = await request(app).patch(`/api/quotations/${EV1}/preferred`).set('Authorization', `Bearer ${presidenteToken}`)
        .send({ es_preferida: true });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/quotations/:eventoId/evaluate', () => {
    test('Evaluar costos retorna 200 con semáforo', async () => {
      chain.single.mockResolvedValue({ data: { presupuesto_total: 1000, cupo_maximo: 50 }, error: null });
      chain.data = [{ id: 1, categoria: 'Sonido', monto: 300, es_preferida: true, tipo_servicio: 'Sonido' }];
      const res = await request(app).get(`/api/quotations/${EV1}/evaluate`).set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.semaforo).toBeDefined();
    });
  });
});
