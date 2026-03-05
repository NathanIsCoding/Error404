import './SignIn.css';

function Signin() {

    function buttonClick() {
            var x = document.getElementById("Sign In");
            x.disabled = true;
        }

    return (
        
     
        
        <div className='slot'>
            <h3>Sign In </h3>
            <div>
                <div>
                    <label className='username'>Username</label>
                    <input type="text"/>
                </div>
                
                <div>
                    <label className='password'>password</label>
                    <input type="password"/>
                </div>
            </div>
            <button type="button" id="Sign In" onclick="buttonClick()">Sign In</button>
        </div>
        
    );}

    export default Signin;