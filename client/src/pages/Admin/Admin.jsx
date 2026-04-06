import { useState, useEffect } from 'react'
import Navbar from "../../components/Navbar/Navbar"
import './Admin.css'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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

    const handleToggleAdmin = async (userId) => {
        try {
            const response = await fetch(`/api/accounts/toggleAdmin/${userId}`, {
                method: 'PATCH',
                credentials: 'include'
            })
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            setAllUsers(prev => prev.map(u => u.userId === userId ? { ...u, isAdmin: data.isAdmin } : u))
        } catch (error) {
            console.error('Failed to toggle admin:', error)
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

    const PIE_COLORS = ['#65bacf', '#3335c0', '#ec4899', '#f59e0b', '#10b981']

    const jobTypeData = Object.entries(
        allJobs.reduce((acc, job) => { acc[job.jobType] = (acc[job.jobType] || 0) + 1; return acc; }, {})
    ).map(([name, value], i) => ({ name, value, fill: PIE_COLORS[i % PIE_COLORS.length] }))

    const industryData = Object.entries(
        allJobs.reduce((acc, job) => { acc[job.industry] = (acc[job.industry] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: PIE_COLORS[i % PIE_COLORS.length] }))

    const userStatusData = [
        { name: 'Active', value: allUsers.filter(u => !u.isDisabled && !u.isAdmin).length, fill: PIE_COLORS[0] },
        { name: 'Admin', value: allUsers.filter(u => u.isAdmin).length, fill: PIE_COLORS[1] },
        { name: 'Disabled', value: allUsers.filter(u => u.isDisabled).length, fill: PIE_COLORS[2] },
    ].filter(d => d.value > 0)

    const ticketStatusData = [
        { name: 'Open', value: allTickets.filter(t => !t.resolved).length, fill: PIE_COLORS[2] },
        { name: 'Resolved', value: allTickets.filter(t => t.resolved).length, fill: PIE_COLORS[4] },
    ].filter(d => d.value > 0)

    return(
        <main className="h-screen flex flex-col">
            <Navbar user={user} setUser={setUser} />
            <div className="flex flex-row justify-between items-end px-5 flex-1">
                <div className="mainPanel flex flex-col mr-3">
                    <div className="flex flex-row justify-between mb-5">

                        <div className="statCard bg-primary p-3 mr-3 flex flex-col">
                            <span className="logo">Jobs by Type</span>
                            <div className="bg-black rounded-lg flex-1">
                                {jobTypeData.length === 0 ? <p className="text-center py-10 opacity-50 text-white">No data</p> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={jobTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }} />
                                            <Legend iconSize={10} wrapperStyle={{ color: '#fff', fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="statCard bg-primary p-3 mr-3 flex flex-col">
                            <span className="logo">Top Industries</span>
                            <div className="bg-black rounded-lg flex-1">
                                {industryData.length === 0 ? <p className="text-center py-10 opacity-50 text-white">No data</p> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={industryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#fff' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} shape={(props) => <rect x={props.x} y={props.y} width={props.width} height={props.height} fill={props.fill} rx={4} />} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="statCard bg-primary p-3 mr-3 flex flex-col">
                            <span className="logo">User Status</span>
                            <div className="bg-black rounded-lg flex-1">
                                {userStatusData.length === 0 ? <p className="text-center py-10 opacity-50 text-white">No data</p> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={userStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }} />
                                            <Legend iconSize={10} wrapperStyle={{ color: '#fff', fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="statCard bg-primary p-3 flex flex-col">
                            <span className="logo">Ticket Status</span>
                            <div className="bg-black rounded-lg flex-1">
                                {ticketStatusData.length === 0 ? <p className="text-center py-10 opacity-50 text-white">No data</p> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={ticketStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }} />
                                            <Legend iconSize={10} wrapperStyle={{ color: '#fff', fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
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
                        onToggleAdmin={activeTab === 'users' ? handleToggleAdmin : undefined}
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