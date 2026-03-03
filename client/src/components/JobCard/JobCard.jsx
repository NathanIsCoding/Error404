import './JobCard.css';
import reactLogo from '../../assets/react.svg'

export function JobCard() { 

    function clicked(){ 
        alert('CLICKED!');
    }
    
    return(
        <div className='card'>
            <img src={reactLogo} className='cardImg'></img>
            <div className='textRow'>
                <p className='text'>Company Title - Position Name</p>
                <p className='text'>Salary/Hourly Wage</p>
            </div>
            <button onClick={clicked} className='expandButton'>Expand</button>
            <button onClick={clicked}>Apply</button>
        </div>
    );

}

