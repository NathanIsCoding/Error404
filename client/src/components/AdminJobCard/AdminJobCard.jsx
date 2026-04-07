import './AdminJobCard.css'
import { useState } from 'react'
import { JOB_TYPES } from '../../enums/JobTypes'

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
            <div className="jobcard bg-gray-900 text-white p-3">
                <div className="flex flex-col lg:grid lg:items-center gap-2"
                    style={{ gridTemplateColumns: '1.75fr 1.25fr 1.5fr 1fr 1fr 1fr 0.4fr' }}>
                    <div className='flex flex-col lg:contents'>
                        <label className='text-gray-400 text-xs lg:hidden'>Title</label>
                        <input className='edit-input' value={form.title} onChange={e => handleChange('title', e.target.value)} />
                    </div>
                    <div className='flex flex-col lg:contents'>
                        <label className='text-gray-400 text-xs lg:hidden'>Company</label>
                        <input className='edit-input' value={form.company} onChange={e => handleChange('company', e.target.value)} />
                    </div>
                    <div className='flex flex-col lg:contents'>
                        <label className='text-gray-400 text-xs lg:hidden'>Location</label>
                        <input className='edit-input' value={form.location} onChange={e => handleChange('location', e.target.value)} />
                    </div>
                    <div className='flex flex-col lg:contents'>
                        <label className='text-gray-400 text-xs lg:hidden'>Job Type</label>
                        <select className='edit-input' value={form.jobType} onChange={e => handleChange('jobType', e.target.value)}>
                            {JOB_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex flex-col lg:contents'>
                        <label className='text-gray-400 text-xs lg:hidden'>Salary</label>
                        <input className='edit-input' type='number' value={form.salary} onChange={e => handleChange('salary', e.target.value)} />
                    </div>
                    <label className='flex gap-1 items-center'>
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
            </div>
        );
    }

    return(
        <div className="jobcard bg-black text-white p-3">
            <div className="flex flex-col lg:grid lg:items-center gap-2"
                style={{ gridTemplateColumns: '1.75fr 1.25fr 1.5fr 1fr 1fr 1fr 0.4fr' }}>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Title</span>
                    <span>{job.title}</span>
                </div>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Company</span>
                    <span>{job.company}</span>
                </div>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Location</span>
                    <span>{job.location}</span>
                </div>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Job Type</span>
                    <span>{job.jobType}</span>
                </div>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Salary</span>
                    <span>${job.salary.toLocaleString()}</span>
                </div>
                <label className='flex gap-1 items-center'>
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
        </div>
    );
}

export default AdminJobCard
