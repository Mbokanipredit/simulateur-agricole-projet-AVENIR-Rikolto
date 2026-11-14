import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET || 'avenir-rikolto-rdc-kwilu-kwango-secret-key-2026',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'FACILITATOR',
        required: false,
      },
      organization: {
        type: 'string',
        defaultValue: 'Rikolto RDC - Projet AVENIR',
        required: false,
      },
      province: {
        type: 'string',
        defaultValue: 'Kwilu',
        required: false,
      },
    },
  },
});

