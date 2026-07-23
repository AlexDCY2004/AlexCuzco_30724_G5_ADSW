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

describe('RF06 - Registrar Gastos del Evento', () => {
  const EV1 = '00000000-0000-4000-8000-000000000001';

  describe('POST /api/expenses', () => {
    test('Registrar gasto exitosamente retorna 201', async () => {
      chain.single.mockResolvedValue({ data: { id: EV1, presupuesto_total: 500, total_gastos: 100 }, error: null });
      const res = await request(app).post('/api/expenses').set('Authorization', `Bearer ${tesoreroToken}`)
        .send({ evento_id: EV1, concepto: 'Decoración', monto: 200, categoria: 'Logística', fecha_gasto: '2026-07-01', metodo_pago: 'Efectivo', responsable: 'Tesorería', descripcion: 'Decoración del salón' });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('registrado');
    });

    test('Presupuesto excedido retorna 400', async () => {
      chain.single.mockResolvedValue({ data: { id: EV1, presupuesto_total: 500, total_gastos: 480 }, error: null });
      const res = await request(app).post('/api/expenses').set('Authorization', `Bearer ${tesoreroToken}`)
        .send({ evento_id: EV1, concepto: 'Extra', monto: 50, categoria: 'Logística', fecha_gasto: '2026-07-01', metodo_pago: 'Efectivo', responsable: 'Test', descripcion: 'Gasto extra' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Presupuesto');
    });

    test('Rol incorrecto (no Tesorero) retorna 403', async () => {
      const res = await request(app).post('/api/expenses').set('Authorization', `Bearer ${socioToken}`)
        .send({ evento_id: EV1, concepto: 'Test', monto: 10, categoria: 'Logística', fecha_gasto: '2026-07-01', metodo_pago: 'Efectivo', responsable: 'Test', descripcion: 'Gasto test' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/expenses/:eventoId', () => {
    test('Listar gastos de un evento retorna 200', async () => {
      chain.data = [{ id: 1, concepto: 'Comida', monto: 100 }];
      const res = await request(app).get(`/api/expenses/${EV1}`).set('Authorization', `Bearer ${tesoreroToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.gastos)).toBe(true);
    });

    test('Evento sin gastos retorna 200 con array vacío', async () => {
      chain.data = [];
      const res = await request(app).get(`/api/expenses/${EV1}`).set('Authorization', `Bearer ${tesoreroToken}`);
      expect(res.status).toBe(200);
      expect(res.body.gastos).toEqual([]);
    });
  });
});
