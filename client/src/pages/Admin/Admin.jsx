import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar/Navbar"
import './Admin.css'
import UserCard from '../../components/UserCard/UserCard'

function Admin() { 

    const [userMatrix, setUserMatrix] = useState([])
    const [currentPage, setCurrentPage] = useState(0)

    // When users load, chunk them into pages
    function chunkUsers(users, size) {
        const matrix = []
        for (let i = 0; i < users.length; i += size) {
            matrix.push(users.slice(i, i + size))
        }
        return matrix
    }

    
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/loadUsers')
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                //Change this to modify how many jobs are being displayed per page.
                setUserMatrix(chunkUsers(data, 6))
            } catch (error) {
                console.error('Failed to fetch jobs:', error)
            }
        }

        fetchJobs()
    }, [])

    return(
        <main>
            <Navbar/>
            <div className="flex flex-row justify-between px-5">
                <div className="mainPanel flex flex-col mr-3">
                    <div className="flex flex-row justify-between mb-5">
                        <div className="statCard bg-primary p-3 mr-3">
                            <span className="logo">card 1</span>
                        </div>

                        <div className="statCard bg-primary p-3 mr-3">
                            <span className="logo">card 2</span>
                        </div>

                        <div className="statCard bg-primary p-3 mr-3">
                            <span className="logo">card 3</span>
                        </div>

                        <div className="statCard bg-primary p-3">
                            <span className="logo">card 4</span>
                        </div>
                    </div>

                    <div className="userList bg-primary p-3">
                        <p className="logo">User List</p>

                        <div className='overflow-auto h-95 scroll-box'>
                            {userMatrix[currentPage]?.map((user, index) => (
                                <UserCard key={index} user={user} />
                            ))}
                        </div>

                        {/* Paginator */}
                        <div>
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>Prev</button>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === userMatrix.length - 1}>Next</button>
                        </div>
                    </div>
                </div>

                <div className="sidePanel bg-primary p-3">
                    side panel
                </div>
            </div>

        </main>
    )
}

export default Admin