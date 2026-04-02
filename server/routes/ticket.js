var express = require('express');
var router = express.Router();
const Ticket = require('../models/SupportTicket');

const sendSuccess = (res, data, message = 'OK', status = 200) => {
    return res.status(status).json({ success: true, data, message });
};

const sendError = (res, message = 'Request failed', status = 500, data = null) => {
    return res.status(status).json({ success: false, data, message });
};

router.get('/api/loadTickets', async (req, res) => {
        try {
                const tickets = await Ticket.find();
                return sendSuccess(res, tickets, 'Tickets fetched successfully');
        } catch (error) {
                console.error('Error fetching tickets:', error);
                return sendError(res, 'Failed to fetch tickets');
        }
});

router.delete('/api/deleteTicket/:ticketId', async (req, res) => {
                try {
                                const ticketId = req.params.ticketId;

                                const deletedTicket = await Ticket.findOneAndDelete({ ticketId: ticketId });

                                if (!deletedTicket) {
                                                return sendError(res, 'Ticket not found', 404);
                                }

                                return sendSuccess(res, deletedTicket, 'Ticket deleted successfully');
                } catch (error) {
                                console.error('Error deleting ticket:', error);
                                return sendError(res, 'Internal server error');
                }
});

module.exports = router;
