import './SupportTicketCard.css'

function SupportTicketCard({data: ticket, onDelete}){ 

    const formatCreatedAt = (createdAt) => {
        if (!createdAt) {
            return 'Unknown';
        }

        const parsedDate = new Date(createdAt);

        if (Number.isNaN(parsedDate.getTime())) {
            return createdAt;
        }

        return parsedDate.toLocaleString();
    };

    return(
       <div className="bg-black text-white p-3 border-b-1 flex flex-col gap-2">
    
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{ticket.ticketId}</span>
                <button onClick={() => onDelete(ticket.ticketId)} className='!bg-red-500 !p-1 flex justify-center'>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <span className="font-semibold text-sm">{ticket.title}</span>

            <span className="text-xs text-gray-300">{ticket.description}</span>

            <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={ticket.resolved} readOnly />
                    Resolved
                </label>
                <span className="text-xs text-gray-400">{formatCreatedAt(ticket.createdAt)}</span>
            </div>

        </div>
    );
}

export default SupportTicketCard;