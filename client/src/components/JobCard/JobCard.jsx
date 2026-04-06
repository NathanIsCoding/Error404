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
        if (salary > 120000) return '#0a9ba3';
        if (salary > 100000) return '#0aa335';
        if (salary > 80000)  return '#5db832';
        if (salary > 60000)  return '#dcd61c';
        if (salary > 45000)  return '#eb8109';
        if (salary > 30000)  return '#cc5500';
        return '#a3220f';
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

            <div className='flex flex-row justify-between'>
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
                            {job.company} - {job.title}  {job.industry} {job.jobType} {job.salary}  
                            
                        </p>
                        <p style={{color: getSalaryColor(job.salary)}}>{
                            new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(job.salary)
                        }</p>
                        <div>
                            <div style={{
                                height: '4px',
                                width: '5em',
                                backgroundImage: 'linear-gradient(to right, #a3220f, #eb8109, #dcd61c, #0aa335, #0a9ba3)',
                                borderRadius: '2px',
                            }} />
                        </div>
                    </div>
                </div>
               

                <div className='flex flex-col'>
                    {!isExpanded ? (
                            <button onClick={clicked} className='expandButton flex justify-center items-center !bg-black'>
                                <span className="material-symbols-outlined">keyboard_arrow_down</span>
                            </button>
                        ) : (
                            <button onClick={clicked} className='expandButton flex justify-center items-center !bg-black'>
                                <span className="material-symbols-outlined">keyboard_arrow_up</span>
                            </button>
                        )
                    }

                    {!isExpanded && (
                        <div className='flex gap-1'>
                            {user?.isAdmin && (
                                <button className='applyButton !bg-blue-500 flex justify-center items-center mt-1' onClick={handleEdit}>
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                            )}
                            {applied ? (
                                <button className='applyButton !bg-red-600 flex justify-center items-center mt-1' onClick={handleApply}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            ) : (
                                <button className='applyButton !bg-green-600 flex justify-center items-center !px-0 mt-1' onClick={handleApply}>
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            )}
                        </div>
                    )}


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

            <div className='flex justify-end'>
                {isExpanded && (
                    <div className='flex gap-1'>
                        {user?.isAdmin && (
                            <button className='applyButton !bg-blue-500 flex justify-center items-center mt-1' onClick={handleEdit}>
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        )}
                        {applied ? (
                            <button className='applyButton !bg-red-600 flex justify-center items-center mt-1' onClick={handleApply}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        ) : (
                            <button className='applyButton !bg-green-600 flex justify-center items-center !px-0 mt-1' onClick={handleApply}>
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

        </div>
    );

}

export default JobCard;

