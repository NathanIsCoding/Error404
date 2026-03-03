import "./App.css";



function Signin() {

    function buttonClick() {
            var x = document.getElementById("Sign In");
            x.disabled = true;
        }

    return (
        
     
        
        <div style="background-color:gray;">
            <h3>Sign In </h3>
            <div>
                <div>
                    <label style="color:blue;">Username</label>
                    <input type="text"/>
                </div>
                
                <div>
                    <label style="color:red;">password</label>
                    <input type="password"/>
                </div>
            </div>
            <button type="button" id="Sign In" onclick="buttonClick()">Sign In</button>
        </div>
        
    );}