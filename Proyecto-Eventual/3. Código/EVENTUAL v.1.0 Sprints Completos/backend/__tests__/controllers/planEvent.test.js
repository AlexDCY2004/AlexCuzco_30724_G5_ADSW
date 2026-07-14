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

describe('RF11 - Definir Evento', () => {
  describe('GET /api/plan-event/proposals', () => {
    test('Listar propuestas pendientes retorna 200', async () => {
      chain.data = [{ id: 1, tipo_evento: 'Social', descripcion: 'Desc larga', estado: 'Pendiente' }];
      const res = await request(app).get('/api/plan-event/proposals').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.propuestas).toHaveLength(1);
    });

    test('Sin propuestas pendientes retorna 200 con array vacío', async () => {
      chain.data = [];
      const res = await request(app).get('/api/plan-event/proposals').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.propuestas).toEqual([]);
    });
  });

  const PID = '00000000-0000-4000-8000-00000000000a';

  describe('POST /api/plan-event/approve/:id', () => {
    test('Aprobar propuesta exitosamente retorna 201', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: PID, tipo_evento: 'Social', descripcion: 'Larga descripcion', estado: 'Pendiente' }, error: null })
        .mockResolvedValueOnce({ data: { id: PID, nombre: 'Evento Aprobado', estado: 'Definido' }, error: null });
      chain.data = [];
      const res = await request(app).post(`/api/plan-event/approve/${PID}`).set('Authorization', `Bearer ${presidenteToken}`)
        .send({ fecha: '2026-12-25', hora: '18:00', lugar: 'Salón Principal', presupuesto_total: 500, cupo_maximo: 50 });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('definido');
    });

    test('Conflicto de horario retorna 409', async () => {
      chain.single.mockResolvedValue({ data: { id: PID, tipo_evento: 'Social', descripcion: 'Larga', estado: 'Pendiente' }, error: null });
      chain.data = [{ id: 99 }];
      const res = await request(app).post(`/api/plan-event/approve/${PID}`).set('Authorization', `Bearer ${presidenteToken}`)
        .send({ fecha: '2026-12-25', hora: '18:00', lugar: 'Salón' });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('disponibles');
    });
  });

  describe('POST /api/plan-event/reject/:id', () => {
    test('Rechazar propuesta retorna 200', async () => {
      chain.update().eq().select().single.mockResolvedValue({ data: { id: PID, estado: 'Rechazada' }, error: null });
      const res = await request(app).post(`/api/plan-event/reject/${PID}`).set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('rechazada');
    });
  });
});
