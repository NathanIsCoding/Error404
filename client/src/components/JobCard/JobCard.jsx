import './JobCard.css';
import reactLogo from '../../assets/react.svg'
import { useState } from 'react';

function JobCard({job}) {

    const [isExpanded, setIsExpanded] = useState(false);

    function clicked(){ 
        setIsExpanded(!isExpanded);
    }
    
    return(
        <div className='flex flex-col bg-primary card'>
            <div className='flex flex-row'>
                <img src={reactLogo} className='cardImg'></img>
                <div className='textRow'>
                    <p className='text'>{job.company} - {job.title}</p>
                    <p className='text'>{job.salary}</p>
                </div>
                <button onClick={clicked} className='expandButton'>Expand</button>
                <button onClick={clicked}>Apply</button>
            </div>
            
            {isExpanded && (
                <div className=''>
                    <p>
                        LOREM IPSUM
                    </p>
                </div>
            )}
        </div>
    );

}

export default JobCard;

