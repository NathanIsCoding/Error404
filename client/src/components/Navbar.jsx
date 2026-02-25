export default function Navbar() {
  return (
    <header style={styles.bar}>
      <div style={styles.brand}>ERROR 404 Job Not Found:</div>

      <nav style={styles.navLink}>
        <a href="#signin" style={styles.link}>Sign In</a>
        <a href="#createAccount" style={styles.link}>Create Account</a>
        <a href="#jobs" style={styles.link}>Browse Job Opportunites</a>
      </nav>
    </header>
  );
}

const styles = {
  bar: {
    backgroundColor: "#135379",
    color: "white",

    display: "flex",
    justifyContent: "space-between",
    padding: "12px 22px",
    width: "100%",
  },

  brand: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },

  navLink: {
    display: "flex",
    gap: 90,
  },

  link: {
    textDecoration: "none",
    color:"#bfb8b9",
  },
};