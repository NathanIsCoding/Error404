import './AdminSupportTicketPanel.css'
import { useState } from 'react'
import Paginator from '../Paginator/Paginator'
import SupportTicketCard from '../SupportTicketCard/SupportTicketCard.jsx'

function AdminSupportTicketPanel({items, filterFn, onDelete, pageSize = 8}) {

     // When data loads, chunk it into pages
        function chunkData(data, size) {
            const matrix = []
            for (let i = 0; i < data.length; i += size) {
                matrix.push(data.slice(i, i + size))
            }
            return matrix
        }
    
        const [currentPage, setCurrentPage] = useState(0);
        const [searchTerm, setSearchTerm] = useState('');
    
        const filteredItems = items.filter(item => filterFn(item, searchTerm))
        const displayMatrix = chunkData(filteredItems, pageSize)
        
        const handleSearchChange = (e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(0)
        }

    return(
        <div className="sidePanel bg-primary p-3 flex flex-col">
            <div className='flex justify-between'>
                <span className="logo">Support Tickets</span>
                <input
                    name='search'
                    className='rounded-full pl-5'
                    type="text"
                    placeholder={`Search Tickets...`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            
                 <div className='overflow-auto scroll-box mt-3 bg-black rounded-lg h-[725px]'>
                    {displayMatrix[currentPage]?.map((item, index) => (
                        <SupportTicketCard key={index} data={item} onDelete={onDelete} />
                    ))}
                    {filteredItems.length === 0 && searchTerm && (
                        <p className="text-center text-black mt-4">No results found.</p>
                    )}
                </div>
    
                <Paginator
                    currentPage={currentPage}
                    totalPages={displayMatrix.length}
                    onPageChange={setCurrentPage}
                />
        </div>
    )
}

export default AdminSupportTicketPanel