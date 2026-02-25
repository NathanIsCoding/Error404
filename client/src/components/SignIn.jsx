export default function SignIn() {

    function buttonClick() {
            var x = document.getElementById("Sign In");
            x.disabled = true;
        }

    return (
        // style={{}}
        <div style="background-color:gray;">
            <h3>Sign In </h3>
            <div>
                <div>
                    <label>Username</label>
                    <input type="text"/>
                </div>

                <div>
                    <label>password</label>
                    <input type="password"/>
                </div>
            </div>
            <button type="button" id="Sign In" onClick={buttonClick}>Sign In</button>
        </div>

);}
