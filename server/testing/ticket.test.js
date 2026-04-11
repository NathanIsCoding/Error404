const express = require('express');
const request = require('supertest');

const ticketRouter = require('../routes/ticket');
const Ticket = require('../models/SupportTicket');
const db = require('./db');

const app = express();
app.use(express.json());
// Mock requireAuth middleware
jest.mock('../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid') {
      req.user = { userId: 'u-auth-1' };
      next();
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  }
}));

app.use(ticketRouter);

beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

describe('Ticket API', () => {
  describe('GET /api/loadTickets', () => {
    it('returns an empty list when there are no tickets', async () => {
      const res = await request(app).get('/api/loadTickets');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all tickets', async () => {
      await Ticket.create([
        {
          ticketId: 'ticket-1',
          userId: 'u-1',
          title: 'Cannot login',
          description: 'Login fails',
          resolved: false,
        },
        {
          ticketId: 'ticket-2',
          userId: 'u-2',
          title: 'UI bug',
          description: 'Button is broken',
          resolved: true,
        },
      ]);

      const res = await request(app).get('/api/loadTickets');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /api/createTicket', () => {
    it('creates a new support ticket successfully', async () => {
      const res = await request(app)
        .post('/api/createTicket')
        .set('Authorization', 'Bearer valid')
        .send({
          title: 'My new ticket',
          description: 'Something is broken'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('ticketId');
      expect(res.body.title).toBe('My new ticket');
      expect(res.body.description).toBe('Something is broken');
      expect(res.body.resolved).toBe(false);

      const savedTicket = await Ticket.findOne({ ticketId: res.body.ticketId });
      expect(savedTicket).toBeTruthy();
      expect(savedTicket.userId).toBe('u-auth-1');
    });

    it('returns 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/createTicket')
        .set('Authorization', 'Bearer valid')
        .send({
           description: 'Only description'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Title is required');
    });

    it('returns 401 if unauthenticated', async () => {
      const res = await request(app)
        .post('/api/createTicket')
        .send({ title: 'Auth test' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Not authenticated');
    });
  });

  describe('DELETE /api/deleteTicket/:ticketId', () => {
    it('deletes a ticket by ticketId', async () => {
      await Ticket.create({
        ticketId: 'ticket-delete',
        userId: 'u-1',
        title: 'Delete me',
        description: 'Please remove',
      });

      const res = await request(app).delete('/api/deleteTicket/ticket-delete');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Ticket deleted successfully');

      const stillThere = await Ticket.findOne({ ticketId: 'ticket-delete' });
      expect(stillThere).toBeNull();
    });

    it('returns 404 when ticket does not exist', async () => {
      const res = await request(app).delete('/api/deleteTicket/missing-ticket');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Ticket not found');
    });

    it('returns 404 when deleting an already-deleted ticket', async () => {
      await Ticket.create({
        ticketId: 'ticket-gone',
        userId: 'u-1',
        title: 'Gone',
        description: 'Already deleted',
      });

      await request(app).delete('/api/deleteTicket/ticket-gone');
      const res = await request(app).delete('/api/deleteTicket/ticket-gone');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Ticket not found');
    });
  });
});
