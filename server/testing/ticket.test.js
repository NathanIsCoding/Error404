const express = require('express');
const request = require('supertest');

const ticketRouter = require('../routes/ticket');
const Ticket = require('../models/SupportTicket');
const db = require('./db');

const app = express();
app.use(express.json());
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
