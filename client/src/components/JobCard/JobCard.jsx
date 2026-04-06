import './JobCard.css';
import { useState, useEffect } from 'react';
import INDUSTRY_COLORS from '../../enums/Industries';
import JOB_TYPE_COLORS from '../../enums/JobTypes';

function JobCard({ job, user, isApplied = false, onApplied, onRetracted, onEdit }) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [applied, setApplied] = useState(isApplied);
    const [applyError, setApplyError] = useState('');
    const [imageError, setImageError] = useState(false);

    const creatorPhotoUrl = job?.createdByUserId
        ? `/api/accounts/${encodeURIComponent(job.createdByUserId)}/photo`
        : null;

    useEffect(() => {
        setApplied(isApplied);
    }, [isApplied]);

    useEffect(() => {
        setImageError(false);
    }, [job?.createdByUserId, job?.jobId, job?._id]);

    function getSalaryColor(salary) {
        if (salary > 200000) return '#c084fc';
        if (salary > 160000) return '#818cf8';
        if (salary > 130000) return '#0a9ba3';
        if (salary > 110000) return '#0aa335';
        if (salary > 90000)  return '#5db832';
        if (salary > 70000)  return '#a3c420';
        if (salary > 55000)  return '#dcd61c';
        if (salary > 42000)  return '#eb8109';
        if (salary > 30000)  return '#e06020';
        if (salary > 20000)  return '#cc3318';
        return '#b02010';
    }

    function getSalaryPosition(salary) {
        const stops = [0, 20000, 30000, 42000, 55000, 70000, 90000, 110000, 130000, 160000, 200000];
        if (salary <= 0) return 0;
        if (salary >= stops[stops.length - 1]) return 100;
        for (let i = 0; i < stops.length - 1; i++) {
            if (salary <= stops[i + 1]) {
                const t = (salary - stops[i]) / (stops[i + 1] - stops[i]);
                return ((i + t) / (stops.length - 1)) * 100;
            }
        }
        return 100;
    }

    function clicked(){
        setIsExpanded(!isExpanded);
    }

    async function handleApply() {
        if (!user) {
            setApplyError('Sign in to apply');
            return;
        }

        if (applied) {
            try {
                const res = await fetch(`/api/applications/${job._id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!res.ok) throw new Error('Failed to retract application');

                setApplied(false);
                setApplyError('');
                if (typeof onRetracted === 'function') onRetracted(job._id);
            } catch (err) {
                console.error(err);
                setApplyError('Failed to retract');
            }
            return;
        }

        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ jobId: job._id })
            });
            if (res.status === 409) {
                setApplied(true);
                setApplyError('');
                if (typeof onApplied === 'function') onApplied(job._id);
                return;
            }
            if (!res.ok) throw new Error('Failed to apply');
            setApplied(true);
            setApplyError('');
            if (typeof onApplied === 'function') onApplied(job._id);
        } catch (err) {
            console.error(err);
            setApplyError('Failed to apply');
        }
    }

    function handleEdit() {
        if (!user || typeof onEdit !== 'function') {
            return;
        }
        onEdit(job);
    }
    
    return(
        <div className='flex flex-col bg-black text-white card border-b-1 border-gray-400'>

            <div className='flex flex-col md:flex-row md:justify-between'>
                <div className='flex flex-row items-center'>
                    {creatorPhotoUrl && !imageError ? (
                        <img
                            src={creatorPhotoUrl}
                            className='cardImg'
                            alt={`${job.company} creator`}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className='cardImgPlaceholder'>
                            {(job.company || '?').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className='textRow'>
                        <div className="Tags">
                                <span className='items-center rounded-sm' style={{backgroundColor: INDUSTRY_COLORS[job.industry] ?? INDUSTRY_COLORS.default}}>{job.industry}</span>
                                <span className='items-center rounded-full' style={{backgroundColor: JOB_TYPE_COLORS[job.jobType] ?? JOB_TYPE_COLORS.default}}>{job.jobType?.replace(/\b\w/g, c => c.toUpperCase())}</span>
                        </div>
                        <p className='text-lg'>
                            {job.company} - {job.title}
                        </p>
                        <p style={{color: getSalaryColor(job.salary)}}>{
                            new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(job.salary)
                        }</p>
                        <div className='relative w-[5em] mt-1'>
                            <div className='h-1 rounded-sm' style={{backgroundImage: 'linear-gradient(to right, #6b0f0f, #a3220f, #cc5500, #eb8109, #dcd61c, #a3c420, #5db832, #0aa335, #0a9ba3, #818cf8, #c084fc)',}} />
                            <div className='absolute -top-[3px] -translate-x-1/2 w-0.5 h-2.5 bg-white rounded-sm' style={{left: `${getSalaryPosition(job.salary)}%`,}} />
                        </div>
                    </div>
                </div>

                <div className='flex flex-row md:flex-col justify-end items-center md:items-end gap-1 mt-2 md:mt-0'>
                    <div className='flex gap-1'>
                        {user?.isAdmin && (
                            <button className='applyButton !bg-blue-500 flex justify-center items-center' onClick={handleEdit}>
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        )}
                        {applied ? (
                            <button className='applyButton !bg-red-600 flex justify-center items-center' onClick={handleApply}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        ) : (
                            <button className='applyButton !bg-green-600 flex justify-center items-center !px-0' onClick={handleApply}>
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        )}
                    </div>
                    <button onClick={clicked} className='expandButton flex justify-center items-center !bg-black'>
                        <span className="material-symbols-outlined">{isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                    </button>
                </div>

            </div>
            {applyError && <p style={{color: 'red', fontSize: '0.85rem', marginTop: '4px'}}>{applyError}</p>}
            {isExpanded && (
                <div className='description text-tertiary bg-gray-800'>
                    <p>
                        {job.description}
                    </p>
                </div>
            )}


        </div>
    );

}

export default JobCard;

