import { globalStyles } from "../GlobalComponentStyleSheets";
import { navbarStyles } from "./NavbarStyle";

const styles = {
  bar: { ...globalStyles.bar, ...navbarStyles.bar },
  left: { ...globalStyles.left },
  right: { ...globalStyles.right },
  label: { ...globalStyles.label, ...navbarStyles.label },
  rightText: { ...navbarStyles.rightText },
};

export default function Navbar() {
  return (
    <header style={styles.bar}>
      <div style={styles.left}>
        <p style={styles.label}>Navbar</p>
        <span style={{ color: "#fff" }}>left</span>
      </div>

      <div style={styles.right}>
        <span style={styles.rightText}>right</span>
      </div>
    </header>
  );
}