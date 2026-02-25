import { globalStyles } from "../GlobalComponentStyleSheets";
import { signInStyles } from "./SignInStyle";

const styles = {
  bar: { ...globalStyles.bar, ...signInStyles.bar },
  left: { ...globalStyles.left },
  right: { ...globalStyles.right },
  label: { ...globalStyles.label, ...signInStyles.label },
  rightText: { ...signInStyles.rightText },
};

export default function SignIn() {
  return (
    <section style={styles.bar}>
      <div style={styles.left}>
        <p style={styles.label}>SignIn</p>
        <span style={{ color: "#fff" }}>left</span>
      </div>

      <div style={styles.right}>
        <span style={styles.rightText}>right</span>
      </div>
    </section>
  );
}