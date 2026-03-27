import './JobCard.css';
import reactLogo from '../../assets/react.svg'
import { useState } from 'react';

function JobCard({job, user}) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [applied, setApplied] = useState(false);
    const [applyError, setApplyError] = useState('');

    function clicked(){ 
        setIsExpanded(!isExpanded);
    }

    async function handleApply() {
        if (!user) {
            setApplyError('Sign in to apply');
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
                setApplyError('Already applied');
                return;
            }
            if (!res.ok) throw new Error('Failed to apply');
            setApplied(true);
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
                        <p className='text-lg'>{job.company} - {job.title}</p>
                        <p className='text-gray-400'>{
                            new Intl.NumberFormat("en-IN", { style: "currency", currency: "CAD" }).format( job.salary)
                        }</p>
                    </div>
                </div>
               

                <div className='flex flex-col'>
                    {!isExpanded ? (
                            <button onClick={clicked} className='expandButton flex !bg-black justify-center'>
                                <span className="material-symbols-outlined">keyboard_arrow_down</span>
                            </button>
                        ) : (
                            <button onClick={clicked} className='expandButton flex !bg-black justify-center'>
                                <span className="material-symbols-outlined">keyboard_arrow_up</span>
                            </button>
                        )
                    }

                    {!isExpanded && (
                        applied ? (
                            <button className='applyButton !bg-red-600' onClick={handleApply}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        ) : (
                            <button className='applyButton !bg-green-600 !px-0' onClick={handleApply}>
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
                        <button className='applyButton !bg-red-600 mt-1' onClick={handleApply}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    ) : (
                        <button className='applyButton !bg-green-600 !px-0 mt-1' onClick={handleApply}>
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    )
                )}
            </div>

        </div>
    );

}

export default JobCard;

