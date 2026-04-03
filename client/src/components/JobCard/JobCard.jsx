import './JobCard.css';
import reactLogo from '../../assets/react.svg'
import { useState, useEffect } from 'react';


function JobCard({ job, user, isApplied = false, onApplied, onRetracted, onEdit }) {

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
                    <img src={reactLogo} className='cardImg rounded-sm'></img>
                    <div className='textRow'>
                        <div className="Tags">
                                <span style={{backgroundColor: job.industry == "tech" ? "#cc2d4d" : job.industry == "software" ? "#d99d59"  : job.industry == "data-science" ? "#8c2dcc" :job.industry == "design" ? "#5366d4" :"#53d4ab"}}>{job.industry}</span> 
                                <span style={{backgroundColor: job.jobType == "full-time" ? "#45a35e" : job.jobType == "part-time" ? "#c9b938" : job.jobType == "contract" ? "#e0933a" :job.jobType == "internship" ? "#cf3ae0" :"#e02f35"}}>{job.jobType}</span> 
                        </div>
                        <p className='text-lg'>
                            {job.company} - {job.title}  
                            
                        </p>
                        <p className='text-gray-400'>{
                            new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format( job.salary)
                        }</p>
                        <div className="Tags2">
                            <span style={{backgroundColor: "#a3220f"}}>
                            </span>
                            <span style={{backgroundColor: job.salary > 40000 ? "#eb8109" :""}}>
                            </span>
                            <span style={{backgroundColor: job.salary > 60000 ? "#dcd61c" :""}}>
                            </span>
                            <span style={{backgroundColor: job.salary > 80000 ? "#0aa335" :""}}>
                            </span>
                            <span style={{backgroundColor: job.salary > 100000 ? "#0a9ba3" :""}}>
                            </span>
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
                            {user && (
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
                <div className='description text-black bg-tertiary'>
                    <p>
                        {job.description}
                    </p>
                </div>
            )}

            <div className='flex justify-end'>
                {isExpanded && (
                    <div className='flex gap-1'>
                        {user && (
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

