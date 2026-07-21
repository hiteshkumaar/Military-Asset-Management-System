import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mocking Prisma Client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        email: 'admin@mams.mil',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789', // Example hash
        role: { name: 'Admin' },
        baseId: 1,
      }),
    },
    auditLog: {
      create: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth API', () => {
  it('should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mams.mil', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'admin@mams.mil');
  });

  it('should reject missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mams.mil' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });
});
