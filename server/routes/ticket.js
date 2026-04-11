var express = require('express');
var router = express.Router();
const Ticket = require('../models/SupportTicket');
const { requireAuth } = require('../middleware/auth');
const crypto = require('crypto');

router.get('/api/loadTickets', async (req, res) => {
	try {
		const tickets = await Ticket.find();
		res.json(tickets);
	} catch (error) {
		console.error('Error fetching tickets:', error);
		res.status(500).json({ error: 'Failed to fetch tickets' });
	}
});

router.post('/api/createTicket', requireAuth, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        let ticketId = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        let existing = await Ticket.findOne({ ticketId });
        while (existing) {
            ticketId = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            existing = await Ticket.findOne({ ticketId });
        }

        const newTicket = await Ticket.create({
            ticketId,
            userId: req.user.userId,
            title,
            description: description || '',
            resolved: false
        });

        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

router.delete('/api/deleteTicket/:ticketId', async (req, res) => {
		try {
				const ticketId = req.params.ticketId;

				const deletedTicket = await Ticket.findOneAndDelete({ ticketId: ticketId });

				if (!deletedTicket) {
						return res.status(404).json({ message: 'Ticket not found' });
				}

				res.status(200).json({ message: 'Ticket deleted successfully' });
		} catch (error) {
				console.error('Error deleting ticket:', error);
				res.status(500).json({ message: 'Internal server error' });
		}
});

module.exports = router;
