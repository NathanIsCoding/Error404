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
            const res = await fetch('http://localhost:3000/api/applications', {
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
        <div className='flex flex-col bg-primary card'>
            <div className='flex flex-row'>
                <img src={reactLogo} className='cardImg'></img>
                <div className='textRow'>
                    <p className=''>{job.company} - {job.title}</p>
                    <p className=''>{job.salary}</p>
                </div>
                <button onClick={clicked} className='expandButton'>Expand</button>
                <button onClick={handleApply} disabled={applied}>
                    {applied ? 'Applied' : 'Apply'}
                </button>
            </div>
            {applyError && <p style={{color: 'red', fontSize: '0.85rem', marginTop: '4px'}}>{applyError}</p>}
            {isExpanded && (
                <div className='description bg-tertiary'>
                    <p>
                        {job.description}
                    </p>
                </div>
            )}
        </div>
    );

}

export default JobCard;

