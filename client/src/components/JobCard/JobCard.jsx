import './JobCard.css';
import reactLogo from '../../assets/react.svg'
import { useState, useEffect } from 'react';

function JobCard({ job, user, isApplied = false, onApplied, onRetracted }) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [applied, setApplied] = useState(isApplied);
    const [applyError, setApplyError] = useState('');

    useEffect(() => {
        setApplied(isApplied);
    }, [isApplied]);

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
    
    return(
        <div className='flex flex-col bg-black text-white card border-b-1 border-gray-400'>

            <div className='flex flex-row justify-between'>
                <div className='flex flex-row items-center'>
                    <img src={reactLogo} className='cardImg rounded-sm'></img>
                    <div className='textRow'>
                        <p className='text-lg'>
                            {job.company} - {job.title}  
                            <div className="Tags"><table>
                                <th><p id='industry'>{job.industry}</p></th> 
                                <th><p id='type'>{job.jobType}</p></th> 
                                <th><p style={{backgroundColor: job.salary < 40000 ? "red" : job.salary < 70000 ? "orange" : "green"}}>{job.salary} </p>
                                </th></table>
                            </div>
                        </p>
                        <p className='text-gray-400'>{
                            new Intl.NumberFormat("en-IN", { style: "currency", currency: "CAD" }).format( job.salary)
                        }</p>
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
                        applied ? (
                            <button className='applyButton flex justify-center items-center  !bg-red-600' onClick={handleApply}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        ) : (
                            <button className='applyButton !bg-green-600 flex justify-center items-center !px-0' onClick={handleApply}>
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        )
                    )}


                </div>

            </div>
            {applyError && <p style={{color: 'red', fontSize: '0.85rem', marginTop: '4px'}}>{applyError}</p>}
            {isExpanded && (
                <div className='description text-black bg-tertiary'>
                    <p>
                        {job.description}
                    </p>
                </div>
            )}

            <div className='flex justify-end'>
                {isExpanded && (
                    applied ? (
                        <button className='applyButton !bg-red-600 flex justify-center items-center mt-1' onClick={handleApply}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    ) : (
                        <button className='applyButton !bg-green-600 flex justify-center items-center !px-0 mt-1' onClick={handleApply}>
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    )
                )}
            </div>

        </div>
    );

}

export default JobCard;

