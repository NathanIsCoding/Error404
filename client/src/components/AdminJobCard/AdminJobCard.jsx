import './AdminJobCard.css'

function AdminJobCard({data: job, onDelete}) { 

    return(
        <div className="jobcard bg-black text-white items-center grid p-3" 
            style={{ gridTemplateColumns: '1.75fr 1.25fr 1.5fr 1fr 1fr 1fr 0.2fr' }}>
            <span className='ml-2'>{job.title}</span>
            <span className='ml-2'>{job.company}</span>
            <span className='ml-2'>{job.location}</span>
            <span className='ml-2'>{job.jobType}</span>
            <span className='ml-2'>${job.salary.toLocaleString()}</span>
            <label className='flex gap-1 ml-2'>
                <input type='checkbox' checked={job.isActive} readOnly />
                Active
            </label>
            <button onClick={() => onDelete(job.jobId)} className='!bg-red-500 !p-1 flex justify-center'>
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
    );
}

export default AdminJobCard