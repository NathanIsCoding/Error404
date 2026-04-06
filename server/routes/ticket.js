var express = require('express');
var router = express.Router();
const Ticket = require('../models/SupportTicket');

router.get('/api/loadTickets', async (req, res) => {
	try {
		const tickets = await Ticket.find();
		res.json(tickets);
	} catch (error) {
		console.error('Error fetching tickets:', error);
		res.status(500).json({ error: 'Failed to fetch tickets' });
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
