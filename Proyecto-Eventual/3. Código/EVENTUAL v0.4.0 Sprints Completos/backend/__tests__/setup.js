const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

function generateTestToken(overrides = {}) {
  const base = {
    id: overrides.id || '00000000-0000-4000-8000-000000000001',
    cedula: overrides.cedula || '1234567890',
    rol: overrides.rol || 'Socio',
    rolId: overrides.rolId || 3,
  };
  return jwt.sign(base, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

function generateExpiredToken() {
  return jwt.sign(
    { id: '00000000-0000-4000-8000-000000000001', cedula: '1234567890', rol: 'Socio', rolId: 3 },
    process.env.JWT_SECRET,
    { expiresIn: '-1h' }
  );
}

function createMockChain() {
  var chain = {
    data: null,
    error: null,
    count: null,
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };

  // then() makes the chain thenable so `await chain` resolves to { data, error }
  chain.then = jest.fn(function (resolve) {
    resolve({ data: chain.data, error: chain.error, count: chain.count });
  });

  // All chainable Supabase query methods
  var chainable = [
    'select', 'eq', 'order', 'gte', 'lte',
    'insert', 'update', 'delete',
    'neq', 'like', 'ilike', 'is', 'limit', 'range',
    'textSearch', 'filter', 'or',
    'contains', 'containedBy', 'overlaps', 'match', 'gt', 'lt',
  ];
  chainable.forEach(function (m) {
    chain[m] = jest.fn(function () { return chain; });
  });

  // `in` is a reserved keyword, set via bracket notation
  chain['in'] = jest.fn(function () { return chain; });

  return chain;
}

global.createMockChain = createMockChain;

global.generateTestToken = generateTestToken;
global.generateExpiredToken = generateExpiredToken;

global.presidenteToken = generateTestToken({ rol: 'Presidente', rolId: 1 });
global.secretarioToken = generateTestToken({ rol: 'Secretario', rolId: 2 });
global.tesoreroToken = generateTestToken({ rol: 'Tesorero', rolId: 4 });
global.socioToken = generateTestToken({ rol: 'Socio', rolId: 3 });
