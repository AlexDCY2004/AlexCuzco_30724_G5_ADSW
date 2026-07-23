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
  supabase.rpc = jest.fn();
});

describe('RF08 - Registrar Evento (código único)', () => {
  describe('PATCH /api/events/:id/register', () => {
    test('Registrar evento exitosamente retorna 200 con código EVT', async () => {
      chain.single
        .mockResolvedValueOnce({ data: { id: 1, estado: 'Definido' }, error: null })
        .mockResolvedValueOnce({ data: { id: 1, estado: 'Registrado', codigo_unico: 'EVT-2026-001' }, error: null });
      supabase.rpc.mockResolvedValue({ data: 1, error: null });

      const res = await request(app).patch('/api/events/1/register').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.codigo_evento).toMatch(/^EVT-/);
    });

    test('Evento en estado incorrecto retorna 400', async () => {
      chain.single.mockResolvedValue({ data: { id: 1, estado: 'Propuesta' }, error: null });
      const res = await request(app).patch('/api/events/1/register').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(400);
    });

    test('Evento no encontrado retorna 404', async () => {
      chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const res = await request(app).patch('/api/events/999/register').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(404);
    });

    test('Rol incorrecto (no Presidente) retorna 403', async () => {
      const res = await request(app).patch('/api/events/1/register').set('Authorization', `Bearer ${socioToken}`);
      expect(res.status).toBe(403);
    });
  });
});
