import { useState, useEffect } from 'react'
import ReportStat from '../ReportStat/ReportStat.jsx'

const RANGES = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '365d' },
    { label: 'All time', value: 'all' },
]

function ReportsPanel() {
    const [reportRange, setReportRange] = useState('30d')
    const [reportData, setReportData] = useState(null)
    const [reportLoading, setReportLoading] = useState(false)

    useEffect(() => {
        const fetchReports = async () => {
            setReportLoading(true)
            try {
                const response = await fetch(`/api/admin/reports?range=${reportRange}`, { credentials: 'include' })
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                setReportData(data)
            } catch (error) {
                console.error('Failed to fetch reports:', error)
            } finally {
                setReportLoading(false)
            }
        }
        fetchReports()
    }, [reportRange])

    return (
        <div className="p-3 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                {RANGES.map(r => (
                    <button
                        key={r.value}
                        className={reportRange === r.value ? 'tab-active' : 'tab'}
                        onClick={() => setReportRange(r.value)}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {reportLoading && <p className="text-white opacity-50 text-sm">Loading...</p>}

            {!reportLoading && reportData && (
                <div className="bg-black rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Users</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <ReportStat label="Total Users" value={reportData.users.total} />
                            <ReportStat label="New Sign-ups" value={reportData.users.new} sub="in selected range" />
                            <ReportStat label="Admins" value={reportData.users.admin} />
                            <ReportStat label="Disabled" value={reportData.users.disabled} />
                        </div>
                    </div>
                    <div className="p-4 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Jobs</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <ReportStat label="Total Jobs" value={reportData.jobs.total} />
                            <ReportStat label="New Postings" value={reportData.jobs.new} sub="in selected range" />
                            <ReportStat label="Active Listings" value={reportData.jobs.active} />
                        </div>
                    </div>
                    <div className="p-4 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Applications</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <ReportStat label="Total" value={reportData.applications.total} />
                            <ReportStat label="New" value={reportData.applications.new} sub="in selected range" />
                            <ReportStat label="Pending" value={reportData.applications.pending} />
                            <ReportStat label="Accepted" value={reportData.applications.accepted} />
                            <ReportStat label="Rejected" value={reportData.applications.rejected} />
                        </div>
                    </div>
                    <div className="p-4 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Profile Comments</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <ReportStat label="Total Comments" value={reportData.comments.total} />
                            <ReportStat label="New Comments" value={reportData.comments.new} sub="in selected range" />
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-white text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Support Tickets</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <ReportStat label="Total Tickets" value={reportData.tickets.total} />
                            <ReportStat label="New Tickets" value={reportData.tickets.new} sub="in selected range" />
                            <ReportStat label="Open" value={reportData.tickets.open} />
                            <ReportStat label="Resolved" value={reportData.tickets.resolved} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReportsPanel
