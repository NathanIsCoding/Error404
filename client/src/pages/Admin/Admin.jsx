import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar/Navbar"
import './Admin.css'
import UserCard from '../../components/UserCard/UserCard.jsx'
import AdminJobCard from '../../components/AdminJobCard/AdminJobCard.jsx'
import AdminListPanel from '../../components/AdminListPanel/AdminListPanel.jsx'
import AdminSupportTicketPanel from '../../components/AdminSupportTicketPanel/AdminSupportTicketPanel.jsx'

function Admin({ user, setUser }) { 

    const [allTickets, setAllTickets] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allJobs, setAllJobs] = useState([]);

    const [activeTab, setActiveTab] = useState('users')

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/loadUsers')
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                //Change this to modify how many jobs are being displayed per page.
                setAllUsers(data)
            } catch (error) {
                console.error('Failed to fetch users:', error)
            }
        }

        const fetchJobs = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/loadJobs')
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                setAllJobs(data)
            } catch (error) {
                console.error('Failed to fetch jobs:', error)
            }
        }

        const fetchTickets = async () => { 
            try { 
                const response = await fetch('http://localhost:3000/api/loadTickets')
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                setAllTickets(data)
            } catch (error) { 
                console.error('Failed to fetch tickets:', error)
            }
        }

        fetchTickets()
        fetchJobs()
        fetchUsers()
    }, [])

    const userFilterFn = (user, term) =>
        user.username?.toLowerCase().includes(term.toLowerCase()) ||
        user.email?.toLowerCase().includes(term.toLowerCase())

    const jobFilterFn = (job, term) =>
        job.title?.toLowerCase().includes(term.toLowerCase()) ||
        job.company?.toLowerCase().includes(term.toLowerCase())

    const ticketFilterFn = (ticket, term) =>
        ticket.title?.toLowerCase().includes(term.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(term.toLowerCase())

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/deleteUser/${userId}`, { method: 'DELETE'})
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            setAllUsers(prev => prev.filter(user => user.userId !== userId))
        } catch (error) {
            console.error('Failed to delete user:', error)
        }
    }

    const handleDeleteJob = async (jobId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/deleteJob/${jobId}`, { method: 'DELETE'})
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            setAllJobs(prev => prev.filter(job => job.jobId !== jobId))
        } catch (error) {
            console.error('Failed to delete job:', error)
        }
    }

    const handleDeleteTicket = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/deleteTicket/${ticketId}`, { method: 'DELETE'})
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            setAllTickets(prev => prev.filter(ticket => ticket.ticketId !== ticketId))
        } catch (error) {
            console.error('Failed to delete ticket:', error)
        }
    }

    return(
        <main>
            <Navbar user={user} setUser={setUser} />
            <div className="flex flex-row justify-between px-5">
                <div className="mainPanel flex flex-col mr-3">
                    <div className="flex flex-row justify-between mb-5">

                        <div className="statCard bg-primary p-3 mr-3">
                            <span className="logo">Total Users</span>
                            <h1 className='statCardValues'>{allUsers.length}</h1>
                        </div>

                        <div className="statCard bg-primary p-3 mr-3">
                            <span className="logo">Total Jobs</span>
                            <h1 className='statCardValues'>{allJobs.length}</h1>
                        </div>

                        <div className="statCard bg-primary p-3 mr-3">
                            <span className="logo">Total Support Tickets</span>
                            <h1 className='statCardValues'>{allTickets.length}</h1>
                        </div>
                        
                        <div className="statCard bg-primary p-3">
                            <span className="logo">card 4</span>
                            <h1 className='statCardValues'>60</h1>
                        </div>

                    </div>

                   <AdminListPanel
                        title={activeTab === 'users' ? 'User List' : 'Job List'}
                        items={activeTab === 'users' ? allUsers : allJobs}
                        CardComponent={activeTab === 'users' ? UserCard : AdminJobCard}
                        filterFn={activeTab === 'users' ? userFilterFn : jobFilterFn}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onDelete={activeTab === 'users' ? handleDeleteUser : handleDeleteJob}
                    />

                </div>

                <AdminSupportTicketPanel
                    items={allTickets}
                    filterFn={ticketFilterFn}
                    onDelete={handleDeleteTicket}
                />
            </div>
        </main>
    )
}

export default Admin