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

describe('RF03 - Consultar Calendario de Eventos', () => {
  test('Listar eventos sin filtros retorna 200', async () => {
    chain.data = [{ id: 1, nombre: 'Fiesta', tipo_evento: 'Social', fecha: '2026-12-25', hora: '18:00', lugar: 'Salón', estado: 'Aprobado', descripcion: 'Desc' }];
    const res = await request(app).get('/api/events').set('Authorization', `Bearer ${socioToken}`);
    expect(res.status).toBe(200);
    expect(res.body.eventos).toBeDefined();
  });

  test('Filtrar por tipo retorna 200', async () => {
    chain.data = [{ id: 1, nombre: 'Deporte', tipo_evento: 'Deportivo' }];
    const res = await request(app).get('/api/events?tipo=Deportivo').set('Authorization', `Bearer ${socioToken}`);
    expect(res.status).toBe(200);
  });

  test('Sin eventos retorna 200 con array vacío', async () => {
    chain.data = [];
    const res = await request(app).get('/api/events?year=2099').set('Authorization', `Bearer ${socioToken}`);
    expect(res.status).toBe(200);
    expect(res.body.eventos).toEqual([]);
  });

  test('Detalle de evento retorna 200', async () => {
    chain.single.mockResolvedValue({ data: { id: 1, nombre: 'Fiesta', tipo_evento: 'Social', fecha: '2026-12-25', hora: '18:00', lugar: 'Salón', estado: 'Aprobado' }, error: null });
    const res = await request(app).get('/api/events/1').set('Authorization', `Bearer ${socioToken}`);
    expect(res.status).toBe(200);
    expect(res.body.evento.nombre).toBe('Fiesta');
  });

  test('Evento no encontrado retorna 404', async () => {
    chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
    const res = await request(app).get('/api/events/999').set('Authorization', `Bearer ${socioToken}`);
    expect(res.status).toBe(404);
  });
});
