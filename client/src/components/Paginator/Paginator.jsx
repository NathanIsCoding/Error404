import './Paginator.css'
import { useState, useEffect } from 'react'

function Paginator({ currentPage, totalPages, onPageChange }) {

    const [inputValue, setInputValue] = useState(currentPage + 1)

    // Keep input in sync when page changes
    useEffect(() => {
        setInputValue(currentPage + 1)
    }, [currentPage])

    const handleInputChange = (e) => {
        setInputValue(e.target.value)
    }

    const commitChange = () => {
        const value = parseInt(inputValue)
        if (!isNaN(value) && value >= 1 && value <= totalPages) {
            onPageChange(value - 1)
        } else {
            // Reset to current page if invalid
            setInputValue(currentPage + 1)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') commitChange()
    }

    return (
        <div className="flex justify-center items-center gap-3 mt-3">
            <div className='paginator bg-black text-white rounded-full'>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
                    {'<'}
                </button>

                <input
                    name='currentpage'
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={commitChange}
                    onKeyDown={handleKeyDown}
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