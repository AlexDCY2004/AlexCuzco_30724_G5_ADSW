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

describe('RF04 - Proponer Evento', () => {
  describe('POST /api/proposals', () => {
    test('Propuesta creada exitosamente retorna 201 con código de seguimiento', async () => {
      chain.single.mockResolvedValue({ data: { id: 1, numero_seguimiento: 'PROP-20261225-1234', tipo_evento: 'Social', descripcion: 'X'.repeat(51), fecha_sugerida: '2026-12-25', justificacion: 'Fiesta anual', estado: 'Pendiente' }, error: null });
      const res = await request(app).post('/api/proposals').set('Authorization', `Bearer ${socioToken}`)
        .send({ tipo_evento: 'Social', descripcion: 'X'.repeat(51), fecha_sugerida: '2026-12-25', justificacion: 'Fiesta de fin de año' });
      expect(res.status).toBe(201);
      expect(res.body.propuesta.numero_seguimiento).toMatch(/^PROP-/);
    });

    test('Descripción menor a 50 caracteres retorna 400', async () => {
      const res = await request(app).post('/api/proposals').set('Authorization', `Bearer ${socioToken}`)
        .send({ tipo_evento: 'Social', descripcion: 'Corta', fecha_sugerida: '2026-12-25' });
      expect(res.status).toBe(400);
    });

    test('Socio no autenticado retorna 401', async () => {
      const res = await request(app).post('/api/proposals').send({ tipo_evento: 'Social', descripcion: 'X'.repeat(51) });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/proposals/mine', () => {
    test('Obtener mis propuestas retorna 200', async () => {
      chain.data = [{ id: 1, codigo_seguimiento: 'PROP-001', tipo_evento: 'Social', descripcion: 'Desc', estado: 'Pendiente' }];
      const res = await request(app).get('/api/proposals/mine').set('Authorization', `Bearer ${socioToken}`);
      expect(res.status).toBe(200);
      expect(res.body.propuestas).toHaveLength(1);
    });

    test('Sin propuestas retorna 200 con array vacío', async () => {
      chain.data = [];
      const res = await request(app).get('/api/proposals/mine').set('Authorization', `Bearer ${socioToken}`);
      expect(res.status).toBe(200);
      expect(res.body.propuestas).toEqual([]);
    });
  });
});
