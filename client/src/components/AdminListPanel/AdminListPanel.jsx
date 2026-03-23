import './AdminListPanel.css'
import Paginator from '../Paginator/Paginator';
import { useState } from 'react';

function AdminListPanel({title, items, CardComponent, filterFn, activeTab, onTabChange, onDelete, pageSize = 6}) {
    
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
        <div className="userList bg-primary p-3">
            <div className='flex justify-between mb-3'>
                <div className="flex items-center gap-3">
                    <p className="logo">{title}</p>
                    <button className={activeTab === 'users' ? 'tab-active' : 'tab'}onClick={() => onTabChange('users')}>
                        Users
                    </button>
                    <button className={activeTab === 'jobs' ? 'tab-active' : 'tab'} onClick={() => onTabChange('jobs')}>
                        Jobs
                    </button>
                </div>
                <input
                    name='search'
                    className='rounded-full pl-5 w-100'
                    type="text"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className='h-95'>
                {displayMatrix[currentPage]?.map((item, index) => (
                    <CardComponent key={index} data={item} onDelete={onDelete} />
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
    );
}

export default AdminListPanel