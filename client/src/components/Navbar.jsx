import {styles} from "./NavbarStyle.js";
export default function Navbar() {


  const onSignIn = (e) => {
    e.preventDefault();
    alert("Sign In clicked.");
  };

  const onCreateAccount = (e) => {
    e.preventDefault();
    alert("Create Account clicked.");
  };

  const onBrowseJobs = (e) => {
    e.preventDefault();
    alert("Browse Job Opportunities clicked.");
  };

  return (
    <nav style={styles.navbar}>
        <div>
            <span style={styles.logo}>JobSite</span>
        </div>
        <div style={styles.right}>
            <a href="#" onClick={onSignIn} style={styles.link}>Sign In</a>
            <a href="#" onClick={onCreateAccount} style={styles.link}>Create Account</a>
            <a href="#" onClick={onBrowseJobs} style={styles.link}>Browse Job Opportunities</a>
      </div>
    </nav>
  );
}