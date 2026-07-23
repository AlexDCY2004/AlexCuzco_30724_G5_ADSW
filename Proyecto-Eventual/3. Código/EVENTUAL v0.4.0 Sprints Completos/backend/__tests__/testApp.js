const express = require('express');
const cors = require('cors');

const authRoutes = require('../src/routes/auth');
const membersRoutes = require('../src/routes/members');
const eventsRoutes = require('../src/routes/events');
const proposalsRoutes = require('../src/routes/proposals');
const attendanceRoutes = require('../src/routes/attendance');
const contributionsRoutes = require('../src/routes/contributions');
const expensesRoutes = require('../src/routes/expenses');
const providersRoutes = require('../src/routes/providers');
const quotationsRoutes = require('../src/routes/quotations');
const planEventRoutes = require('../src/routes/planEvent');
const broadcastRoutes = require('../src/routes/broadcast');
const executeEventRoutes = require('../src/routes/executeEvent');
const reportsRoutes = require('../src/routes/reports');

function createTestApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/members', membersRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/proposals', proposalsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/contributions', contributionsRoutes);
  app.use('/api/expenses', expensesRoutes);
  app.use('/api/providers', providersRoutes);
  app.use('/api/quotations', quotationsRoutes);
  app.use('/api/plan-event', planEventRoutes);
  app.use('/api/broadcast', broadcastRoutes);
  app.use('/api/execute-event', executeEventRoutes);
  app.use('/api/reports', reportsRoutes);

  app.use((err, req, res, next) => {
    console.error('[Test Error]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createTestApp };
