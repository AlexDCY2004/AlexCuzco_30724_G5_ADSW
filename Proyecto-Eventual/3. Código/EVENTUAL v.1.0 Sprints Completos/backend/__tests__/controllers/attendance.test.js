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

describe('RF05 - Confirmar Asistencia a Evento', () => {
  const EV1 = '00000000-0000-4000-8000-000000000001';
  const EV999 = '00000000-0000-4000-8000-000000000099';

  describe('POST /api/attendance', () => {
    test('Confirmar asistencia exitosamente retorna 201', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: EV1, fecha: '2026-12-25', estado: 'Registrado', cupo_maximo: 100, plazas_confirmadas: 10 }, error: null })
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: { id: 10, evento_id: EV1, socio_id: '00000000-0000-4000-8000-000000000001', asiste: true }, error: null });
      const res = await request(app).post('/api/attendance').set('Authorization', `Bearer ${socioToken}`)
        .send({ evento_id: EV1, asiste: true, num_acompanantes: 2 });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('registrada');
    });

    test('Evento en estado no válido retorna 400', async () => {
      chain.single.mockResolvedValue({ data: { id: EV1, fecha: '2026-12-25', estado: 'Propuesta', cupo_maximo: 100 }, error: null });
      const res = await request(app).post('/api/attendance').set('Authorization', `Bearer ${socioToken}`)
        .send({ evento_id: EV1, asiste: true });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('no admite confirmaciones');
    });

    test('Evento no encontrado retorna 404', async () => {
      chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const res = await request(app).post('/api/attendance').set('Authorization', `Bearer ${socioToken}`)
        .send({ evento_id: EV999, asiste: true });
      expect(res.status).toBe(404);
    });

    test('Confirmación duplicada retorna 409', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: EV1, fecha: '2026-12-25', estado: 'Registrado', cupo_maximo: 100, plazas_confirmadas: 5 }, error: null })
        .mockResolvedValueOnce({ data: { id: 99 }, error: null });
      const res = await request(app).post('/api/attendance').set('Authorization', `Bearer ${socioToken}`)
        .send({ evento_id: EV1, asiste: true });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('ya ha registrado');
    });

    test('Cupo excedido retorna 400', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: EV1, fecha: '2026-12-25', estado: 'Registrado', cupo_maximo: 10, plazas_confirmadas: 10 }, error: null })
        .mockResolvedValueOnce({ data: null, error: null });
      const res = await request(app).post('/api/attendance').set('Authorization', `Bearer ${socioToken}`)
        .send({ evento_id: EV1, asiste: true, num_acompanantes: 1 });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('cupo');
    });
  });

  describe('GET /api/attendance/:eventoId/mine', () => {
    test('Obtener confirmación existente retorna 200', async () => {
      chain.single.mockResolvedValue({ data: { id: 10, evento_id: EV1, asiste: true }, error: null });
      const res = await request(app).get(`/api/attendance/${EV1}/mine`).set('Authorization', `Bearer ${socioToken}`);
      expect(res.status).toBe(200);
      expect(res.body.confirmacion.asiste).toBe(true);
    });
  });
});
