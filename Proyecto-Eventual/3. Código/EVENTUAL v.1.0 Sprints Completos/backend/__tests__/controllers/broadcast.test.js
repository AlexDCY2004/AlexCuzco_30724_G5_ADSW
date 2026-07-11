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

describe('RF09 - Difundir Información del Evento', () => {
  const EV1 = '00000000-0000-4000-8000-000000000001';

  describe('POST /api/broadcast', () => {
    test('Difundir exitosamente retorna 201', async () => {
      chain.single.mockResolvedValue({ data: { id: EV1, estado: 'Registrado', fecha: '2026-12-25', nombre: 'Fiesta', lugar: 'Salón', hora: '18:00' }, error: null });
      chain.then
        .mockImplementationOnce(resolve => resolve({ data: [{ id_socio: 's1' }, { id_socio: 's2' }], error: null }))
        .mockImplementationOnce(resolve => resolve({ data: null, error: null }));
      const res = await request(app).post('/api/broadcast').set('Authorization', `Bearer ${secretarioToken}`)
        .send({ evento_id: EV1, mensaje: 'Evento confirmado', canales: ['app'], es_inmediata: true, recordatorios: [] });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('difundida');
    });

    test('Evento no encontrado retorna 404', async () => {
      const EV999 = '00000000-0000-4000-8000-000000000099';
      chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const res = await request(app).post('/api/broadcast').set('Authorization', `Bearer ${secretarioToken}`)
        .send({ evento_id: EV999, mensaje: 'Test', canales: ['app'], es_inmediata: true, recordatorios: [] });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/broadcast/events/:id/template', () => {
    test('Generar template retorna 200', async () => {
      chain.single.mockResolvedValue({ data: { id: EV1, nombre: 'Fiesta', fecha: '2026-12-25', hora: '18:00', lugar: 'Salón', tipo_evento: 'Social' }, error: null });
      const res = await request(app).get(`/api/broadcast/events/${EV1}/template`).set('Authorization', `Bearer ${secretarioToken}`);
      expect(res.status).toBe(200);
      expect(res.body.plantilla).toBeDefined();
    });
  });
});
