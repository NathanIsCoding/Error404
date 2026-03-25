import './AdminJobCard.css'
import { useState } from 'react'

function AdminJobCard({data: job, onDelete, onUpdate}) { 

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary,
        isActive: job.isActive,
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(job.jobId, { ...form, salary: Number(form.salary) });
        setEditing(false);
    };

    const handleCancel = () => {
        setForm({ title: job.title, company: job.company, location: job.location, jobType: job.jobType, salary: job.salary, isActive: job.isActive });
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="jobcard bg-gray-900 text-white items-center grid p-3 gap-1"
                style={{ gridTemplateColumns: '1.75fr 1.25fr 1.5fr 1fr 1fr 1fr 0.4fr' }}>
                <input className='edit-input ml-2' value={form.title} onChange={e => handleChange('title', e.target.value)} />
                <input className='edit-input ml-2' value={form.company} onChange={e => handleChange('company', e.target.value)} />
                <input className='edit-input ml-2' value={form.location} onChange={e => handleChange('location', e.target.value)} />
                <select className='edit-input ml-2' value={form.jobType} onChange={e => handleChange('jobType', e.target.value)}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                </select>
                <input className='edit-input ml-2' type='number' value={form.salary} onChange={e => handleChange('salary', e.target.value)} />
                <label className='flex gap-1 ml-2'>
                    <input type='checkbox' checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} />
                    Active
                </label>
                <div className='flex gap-1'>
                    <button onClick={handleSave} className='!bg-green-600 !p-1 flex justify-center'>
                        <span className="material-symbols-outlined">check</span>
                    </button>
                    <button onClick={handleCancel} className='!bg-gray-500 !p-1 flex justify-center'>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="jobcard bg-black text-white items-center grid p-3" 
            style={{ gridTemplateColumns: '1.75fr 1.25fr 1.5fr 1fr 1fr 1fr 0.4fr' }}>
            <span className='ml-2'>{job.title}</span>
            <span className='ml-2'>{job.company}</span>
            <span className='ml-2'>{job.location}</span>
            <span className='ml-2'>{job.jobType}</span>
            <span className='ml-2'>${job.salary.toLocaleString()}</span>
            <label className='flex gap-1 ml-2'>
                <input type='checkbox' checked={job.isActive} readOnly />
                Active
            </label>
            <div className='flex gap-1'>
                <button onClick={() => setEditing(true)} className='!bg-blue-500 !p-1 flex justify-center'>
                    <span className="material-symbols-outlined">edit</span>
                </button>
                <button onClick={() => onDelete(job.jobId)} className='!bg-red-500 !p-1 flex justify-center'>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
}

export default AdminJobCard