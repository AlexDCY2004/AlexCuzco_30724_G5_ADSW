const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createTestApp } = require('../testApp');

const app = createTestApp();

jest.mock('../../src/config/supabase');
const supabase = require('../../src/config/supabase');

let chain;
function freshChain() {
  chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  supabase.from.mockReturnValue(freshChain());
  supabase.auth = {
    admin: { getUserById: jest.fn() },
    signInWithPassword: jest.fn(),
  };
});

describe('RF01 - Acceso al Software', () => {
  describe('POST /api/auth/login', () => {
    test('Login exitoso retorna 200 con token JWT', async () => {
      chain.single.mockResolvedValue({
        data: { id: 'user-001', cedula: '1111111111', nombres: 'Juan', apellidos: 'Pérez', estado: 'Activo', rol_id: 3, roles: { nombre: 'Socio' }, telefono: '0999000111', direccion: 'Av Siempre Viva' },
        error: null,
      });
      supabase.auth.admin.getUserById.mockResolvedValue({
        data: { user: { email: 'juan@example.com' } },
        error: null,
      });
      supabase.auth.signInWithPassword.mockResolvedValue({ error: null });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '1111111111', password: 'correctPassword' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.nombres).toBe('Juan');
      expect(res.body.user.rol).toBe('Socio');
    });

    test('Cédula no registrada retorna 401', async () => {
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '2222222222', password: 'any' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Intento 1 de 3');
    });

    test('3 intentos fallidos bloquean la cuenta', async () => {
      chain.single.mockResolvedValue({
        data: { id: 'user-blocked', cedula: '3333333333', nombres: 'Test', estado: 'Activo', rol_id: 3, roles: { nombre: 'Socio' } },
        error: null,
      });
      supabase.auth.admin.getUserById.mockResolvedValue({
        data: { user: { email: 'blocked@test.com' } },
        error: null,
      });
      supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid' } });

      await request(app).post('/api/auth/login').send({ cedula: '3333333333', password: 'w1' });
      await request(app).post('/api/auth/login').send({ cedula: '3333333333', password: 'w2' });
      const res = await request(app).post('/api/auth/login').send({ cedula: '3333333333', password: 'w3' });

      expect(res.status).toBe(423);
      expect(res.body.error).toContain('bloqueada');
    });

    test('Cuenta inactiva retorna 403', async () => {
      chain.single.mockResolvedValue({
        data: { id: 'user-inactive', cedula: '4444444444', nombres: 'Test', estado: 'Inactivo', rol_id: 3, roles: { nombre: 'Socio' } },
        error: null,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '4444444444', password: 'any' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('inactiva');
    });
  });

  describe('Token JWT en rutas protegidas', () => {
    test('Ruta sin token retorna 401', async () => {
      const res = await request(app).get('/api/members');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Token');
    });

    test('Token expirado retorna 401', async () => {
      const expiredToken = generateExpiredToken();
      const res = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
    });
  });
});
