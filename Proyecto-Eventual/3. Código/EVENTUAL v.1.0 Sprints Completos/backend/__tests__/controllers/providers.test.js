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

describe('RF10 - Registrar Proveedores', () => {
  describe('POST /api/providers', () => {
    test('Crear proveedor exitosamente retorna 201', async () => {
      chain.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: { id: 1, nombre: 'Sonido Pro', categoria: 'Sonido', telefono: '0999000111' }, error: null });
      chain.then.mockImplementation(resolve => resolve({ data: null, error: null }));
      const res = await request(app).post('/api/providers').set('Authorization', `Bearer ${secretarioToken}`)
        .send({ nombre: 'Sonido Pro', categoria: 'Sonido', telefono: '0999000111', contacto: 'Juan', descripcion: 'Equipos de sonido' });
      expect(res.status).toBe(201);
      expect(res.body.proveedor.nombre).toBe('Sonido Pro');
    });

    test('Nombre duplicado retorna 409', async () => {
      chain.single.mockResolvedValue({ data: { id: 99 }, error: null });
      const res = await request(app).post('/api/providers').set('Authorization', `Bearer ${secretarioToken}`)
        .send({ nombre: 'Sonido Pro', categoria: 'Sonido' });
      expect(res.status).toBe(409);
    });

    test('Rol incorrecto (no Secretario) retorna 403', async () => {
      const res = await request(app).post('/api/providers').set('Authorization', `Bearer ${socioToken}`)
        .send({ nombre: 'Test', categoria: 'Sonido' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/providers', () => {
    test('Listar proveedores retorna 200', async () => {
      chain.data = [{ id: 1, nombre: 'LuzX', categoria: 'Iluminación' }];
      const res = await request(app).get('/api/providers').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
    });

    test('Filtrar por categoría retorna 200', async () => {
      chain.data = [{ id: 1, nombre: 'Sonido Pro', categoria: 'Sonido' }];
      const res = await request(app).get('/api/providers?categoria=Sonido').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
    });
  });
});
