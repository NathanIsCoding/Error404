function ReportStat({ label, value, sub }) {
    return (
        <div className="bg-black rounded-xl p-4 flex flex-col gap-1 border border-gray-600">
            <span className="text-white text-xs opacity-60 uppercase tracking-wide">{label}</span>
            <span className="text-white font-bold" style={{ fontSize: '2.2rem', lineHeight: 1 }}>
                {value ?? '—'}
            </span>
            {sub && <span className="text-white text-xs opacity-50">{sub}</span>}
        </div>
    )
}

export default ReportStat
