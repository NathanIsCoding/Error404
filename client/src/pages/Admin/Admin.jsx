import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar/Navbar"
import './Admin.css'
import UserCard from '../../components/UserCard/UserCard.jsx'
import AdminJobCard from '../../components/AdminJobCard/AdminJobCard.jsx'
import AdminListPanel from '../../components/AdminListPanel/AdminListPanel.jsx'
import AdminSupportTicketPanel from '../../components/AdminSupportTicketPanel/AdminSupportTicketPanel.jsx'
import CreateJobListing from '../../components/CreateJobListing/CreateJobListing.jsx'

function Admin({ user, setUser }) { 

    const [allTickets, setAllTickets] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allJobs, setAllJobs] = useState([]);

    const [activeTab, setActiveTab] = useState('users')
    const [showCreateJobListing, setShowCreateJobListing] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/loadUsers')
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
                const response = await fetch('/api/loadJobs')
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                setAllJobs(data)
            } catch (error) {
                console.error('Failed to fetch jobs:', error)
            }
        }

        const fetchTickets = async () => { 
            try { 
                const response = await fetch('/api/loadTickets')
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
            const response = await fetch(`/api/deleteUser/${userId}`, { method: 'DELETE'})
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            setAllUsers(prev => prev.filter(user => user.userId !== userId))
        } catch (error) {
            console.error('Failed to delete user:', error)
        }
    }

    const handleToggleUser = async (userId) => {
        try {
            const response = await fetch(`/api/accounts/toggleUser/${userId}`, {
                method: 'PATCH',
                credentials: 'include'
            })
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            setAllUsers(prev => prev.map(u => u.userId === userId ? { ...u, isDisabled: data.isDisabled } : u))
        } catch (error) {
            console.error('Failed to toggle user:', error)
        }
    }

    const handleDeleteJob = async (jobId) => {
        try {
            const response = await fetch(`/api/deleteJob/${jobId}`, { method: 'DELETE'})
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            setAllJobs(prev => prev.filter(job => job.jobId !== jobId))
        } catch (error) {
            console.error('Failed to delete job:', error)
        }
    }

    const handleUpdateJob = async (jobId, updates) => {
        try {
            const response = await fetch(`/api/updateJob/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const updatedJob = await response.json()
            setAllJobs(prev => prev.map(job => job.jobId === jobId ? updatedJob : job))
        } catch (error) {
            console.error('Failed to update job:', error)
        }
    }

    const handleDeleteTicket = async (ticketId) => {
        try {
            const response = await fetch(`/api/deleteTicket/${ticketId}`, { method: 'DELETE'})
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            setAllTickets(prev => prev.filter(ticket => ticket.ticketId !== ticketId))
        } catch (error) {
            console.error('Failed to delete ticket:', error)
        }
    }

    const handleCreateJob = (newJob) => {
        setAllJobs(prev => [newJob, ...prev])
        setActiveTab('jobs')
    }

    return(
        <main className="h-screen flex flex-col">
            <Navbar user={user} setUser={setUser} />
            <div className="flex flex-row justify-between items-end px-5 flex-1">
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
                        onUpdate={activeTab === 'jobs' ? handleUpdateJob : undefined}
                        onCreateJob={() => setShowCreateJobListing(true)}
                        onToggle={activeTab === 'users' ? handleToggleUser : undefined}
                    />

                </div>

                <AdminSupportTicketPanel
                    items={allTickets}
                    filterFn={ticketFilterFn}
                    onDelete={handleDeleteTicket}
                />
            </div>

            {showCreateJobListing && (
                <CreateJobListing
                    onClose={() => setShowCreateJobListing(false)}
                    onCreated={handleCreateJob}
                />
            )}
        </main>
    )
}

export default Admin