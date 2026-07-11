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

describe('RF07 - Registrar Aportes Económicos', () => {
  const S1 = '00000000-0000-4000-8000-0000000000a1';

  describe('POST /api/contributions', () => {
    test('Registrar aporte exitosamente retorna 201', async () => {
      chain.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: { id: 1, socio_id: S1, monto: 20, periodo: '2026-07' }, error: null });
      const res = await request(app).post('/api/contributions').set('Authorization', `Bearer ${tesoreroToken}`)
        .send({ socio_id: S1, monto: 20, periodo: '2026-07', metodo_pago: 'Efectivo', fecha_pago: '2026-07-01', estado: 'Validado' });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('registrado');
    });

    test('Monto mínimo no cumplido retorna 400', async () => {
      chain.single.mockResolvedValue({ data: null, error: null });
      const res = await request(app).post('/api/contributions').set('Authorization', `Bearer ${tesoreroToken}`)
        .send({ socio_id: S1, monto: 5, periodo: '2026-07', metodo_pago: 'Efectivo', fecha_pago: '2026-07-01', estado: 'Validado' });
      expect(res.status).toBe(400);
    });

    test('Rol incorrecto (no Tesorero) retorna 403', async () => {
      const res = await request(app).post('/api/contributions').set('Authorization', `Bearer ${socioToken}`)
        .send({ socio_id: S1, monto: 20, periodo: '2026-07' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/contributions/pending', () => {
    test('Listar socios pendientes retorna 200', async () => {
      chain.data = [{ id: 's-1', cedula: '123', nombres: 'A', apellidos: 'B' }];
      const res = await request(app).get('/api/contributions/pending').set('Authorization', `Bearer ${tesoreroToken}`);
      expect(res.status).toBe(200);
      expect(res.body.pendientes).toHaveLength(1);
    });

    test('Todos al día retorna 200 con array vacío', async () => {
      chain.data = [];
      const res = await request(app).get('/api/contributions/pending').set('Authorization', `Bearer ${tesoreroToken}`);
      expect(res.status).toBe(200);
      expect(res.body.pendientes).toEqual([]);
    });
  });
});
