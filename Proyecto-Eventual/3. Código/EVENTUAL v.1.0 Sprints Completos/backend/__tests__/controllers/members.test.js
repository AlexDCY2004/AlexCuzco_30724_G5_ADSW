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
  supabase.auth = { admin: { createUser: jest.fn(), deleteUser: jest.fn() } };
});

describe('RF02 - Gestión de Miembros', () => {
  describe('GET /api/members', () => {
    test('Listar todos los miembros retorna 200', async () => {
      chain.data = [{ id: '1', cedula: '123', nombres: 'A', apellidos: 'B', telefono: '0999', direccion: 'Dir', estado: 'Activo', rol_id: 3, fecha_ingreso: '2026-01-01', roles: { nombre: 'Socio' } }];
      const res = await request(app).get('/api/members').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.members).toHaveLength(1);
    });

    test('Lista vacía retorna 200 con array vacío', async () => {
      chain.data = [];
      const res = await request(app).get('/api/members').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.members).toEqual([]);
    });
  });

  describe('POST /api/members', () => {
    test('Crear socio exitosamente retorna 201', async () => {
      supabase.auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'new-id' } }, error: null });
      chain.insert.mockResolvedValue({ error: null });
      const res = await request(app).post('/api/members').set('Authorization', `Bearer ${presidenteToken}`)
        .send({ cedula: '0987654321', nombres: 'María', apellidos: 'García', email: 'maria@test.com', password: 'password123', rol_id: 3 });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('creado');
    });

    test('Email duplicado retorna 409', async () => {
      supabase.auth.admin.createUser.mockResolvedValue({ data: null, error: { message: 'already exists' } });
      const res = await request(app).post('/api/members').set('Authorization', `Bearer ${presidenteToken}`)
        .send({ cedula: '1111111111', nombres: 'Dup', apellidos: 'User', email: 'dup@test.com', password: 'password123', rol_id: 3 });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('correo ya está registrado');
    });
  });

  describe('PUT /api/members/:id', () => {
    test('Actualizar socio exitosamente retorna 200', async () => {
      chain.update().eq().select().single.mockResolvedValue({
        data: { id: '00000000-0000-4000-8000-000000000001', cedula: '123', nombres: 'Actualizado', apellidos: 'Pérez', telefono: '0999', direccion: 'Nueva', estado: 'Activo', rol_id: 3, roles: { nombre: 'Socio' } },
        error: null,
      });
      const res = await request(app).put('/api/members/00000000-0000-4000-8000-000000000001').set('Authorization', `Bearer ${presidenteToken}`)
        .send({ nombres: 'Actualizado', telefono: '0999000000' });
      expect(res.status).toBe(200);
      expect(res.body.member.nombres).toBe('Actualizado');
    });

    test('Socio no encontrado retorna 404', async () => {
      chain.update().eq().select().single.mockResolvedValue({ data: null, error: null });
      const res = await request(app).put('/api/members/00000000-0000-4000-8000-000000000099').set('Authorization', `Bearer ${presidenteToken}`)
        .send({ nombres: 'Nadie' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/members/:id/role', () => {
    test('Asignar rol exitosamente retorna 200', async () => {
      chain.update().eq().select().single.mockResolvedValue({
        data: { id: '00000000-0000-4000-8000-000000000001', nombres: 'Test', apellidos: 'User', rol_id: 2, roles: { nombre: 'Secretario' } },
        error: null,
      });
      const res = await request(app).patch('/api/members/00000000-0000-4000-8000-000000000001/role').set('Authorization', `Bearer ${presidenteToken}`)
        .send({ rol_id: 2 });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Secretario');
    });
  });

  describe('PATCH /api/members/:id/deactivate', () => {
    test('Desactivar socio exitosamente retorna 200', async () => {
      chain.update().eq().select().single.mockResolvedValue({
        data: { id: '00000000-0000-4000-8000-000000000002', nombres: 'Otro', apellidos: 'User', estado: 'Inactivo' },
        error: null,
      });
      const res = await request(app).patch('/api/members/00000000-0000-4000-8000-000000000002/deactivate').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(200);
    });

    test('Auto-desactivación retorna 400', async () => {
      const res = await request(app).patch('/api/members/00000000-0000-4000-8000-000000000001/deactivate').set('Authorization', `Bearer ${presidenteToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No puede desactivar');
    });
  });

  describe('Acceso sin rol Presidente', () => {
    test('Token de Socio retorna 403', async () => {
      const res = await request(app).get('/api/members').set('Authorization', `Bearer ${socioToken}`);
      expect(res.status).toBe(403);
    });
  });
});
