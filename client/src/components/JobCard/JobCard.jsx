import './JobCard.css';
import reactLogo from '../../assets/react.svg'

function JobCard({job}) { 

    function clicked(){ 
        alert('CLICKED!');
    }
    
    return(
        <div className='bg-primary card'>
            <img src={reactLogo} className='cardImg'></img>
            <div className='textRow'>
                <p className='text'>{job.company} - {job.title}</p>
                <p className='text'>{job.salary}</p>
            </div>
            <button onClick={clicked} className='expandButton'>Expand</button>
            <button onClick={clicked}>Apply</button>
        </div>
    );

}

export default JobCard;

