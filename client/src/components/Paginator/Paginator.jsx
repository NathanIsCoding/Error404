import './Paginator.css'

function Paginator({ currentPage, totalPages, onPageChange }) {

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value)
        if (!isNaN(value) && value >= 1 && value <= totalPages) {
            onPageChange(value - 1)
        }
    }

    return (
        <div className="flex justify-center items-center gap-3">
            <div className='bg-black text-white rounded-full'>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}> 
                    {'<'} 
                </button>

                <input
                    name='currentpage'
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage + 1}
                    onChange={handleInputChange}
                    className="w-5 mr-1 text-center"
                />

                <span>/ {totalPages}</span>

                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}> 
                    {'>'} 
                </button>
            </div>
        </div>
    )
}

export default Paginator