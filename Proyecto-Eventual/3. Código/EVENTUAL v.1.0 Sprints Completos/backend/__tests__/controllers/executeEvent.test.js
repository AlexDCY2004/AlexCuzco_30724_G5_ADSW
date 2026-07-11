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

describe('RF12 - Ejecutar Evento', () => {
  describe('GET /api/execute-event/active', () => {
    test('Listar eventos activos retorna 200', async () => {
      chain.data = [{ id: 1, nombre: 'Fiesta', estado: 'Difundido' }];
      const res = await request(app).get('/api/execute-event/active').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.eventos).toHaveLength(1);
    });

    test('Sin eventos activos retorna 200 con array vacío', async () => {
      chain.data = [];
      const res = await request(app).get('/api/execute-event/active').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.eventos).toEqual([]);
    });
  });

  const EV1 = '00000000-0000-4000-8000-000000000001';

  describe('POST /api/execute-event/:id/register-attendance', () => {
    test('Registrar asistencia manual retorna 200', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: EV1, estado: 'Difundido' }, error: null })
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: { id: 10, evento_id: EV1, socio_id: EV1 }, error: null });
      chain.then
        .mockImplementationOnce(resolve => resolve({ data: null, error: null }))
        .mockImplementationOnce(resolve => resolve({ count: 1 }))
        .mockImplementationOnce(resolve => resolve({ data: null, error: null }));
      const res = await request(app).post(`/api/execute-event/${EV1}/register-attendance`).set('Authorization', `Bearer ${presidenteToken}`)
        .send({ socio_id: EV1, tipo_registro: 'Manual', num_acompanantes_presentes: 0 });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('registrada');
    });
  });

  describe('PATCH /api/execute-event/:id/close', () => {
    test('Cerrar evento exitosamente retorna 200 con estado Cerrado', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: EV1, estado: 'Ejecutado', total_presentes: 10 }, error: null });
      chain.then
        .mockImplementationOnce(resolve => resolve({ count: 3 }))
        .mockImplementationOnce(resolve => resolve({ count: 5 }))
        .mockImplementationOnce(resolve => resolve({ data: null, error: null }));

      const res = await request(app).patch(`/api/execute-event/${EV1}/close`).set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cerrado');
    });

    test('Cerrar sin asistentes retorna 400', async () => {
      chain.single.mockResolvedValueOnce({ data: { id: EV1, estado: 'Ejecutado', total_presentes: 0 }, error: null });
      chain.then.mockImplementationOnce(resolve => resolve({ count: 0 }));
      const res = await request(app).patch(`/api/execute-event/${EV1}/close`).set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('asistencia');
    });
  });
});
