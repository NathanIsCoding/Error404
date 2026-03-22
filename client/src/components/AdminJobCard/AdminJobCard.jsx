import './AdminJobCard.css'

function AdminJobCard({data: job}) { 

    return(
        <div className="usercard bg-black text-white items-center grid p-2" 
            style={{ gridTemplateColumns: '1.75fr 1.25fr 1.5fr 1fr 1fr 1fr 0.5fr' }}>
            <span className='ml-2'>{job.title}</span>
            <span className='ml-2'>{job.company}</span>
            <span className='ml-2'>{job.location}</span>
            <span className='ml-2'>{job.jobType}</span>
            <span className='ml-2'>${job.salary.toLocaleString()}</span>
            <label className='flex gap-1 ml-2'>
                <input type='checkbox' checked={job.isActive} readOnly />
                Active
            </label>
            <button className='justify-self-end'>Delete</button>
        </div>
    );
}

export default AdminJobCard