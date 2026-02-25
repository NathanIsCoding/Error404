import { globalStyles } from "../GlobalComponentStyleSheets";
import { jobCardStyles } from "./JobCardStyle";

const styles = {
  bar: { ...globalStyles.bar, ...jobCardStyles.bar },
  left: { ...globalStyles.left },
  right: { ...globalStyles.right },
  label: { ...globalStyles.label, ...jobCardStyles.label },
  rightText: { ...jobCardStyles.rightText },
};

export default function JobCard() {
  return (
    <section style={styles.bar}>
      <div style={styles.left}>
        <p style={styles.label}>JobCard</p>
        <span style={{ color: "#fff" }}>left</span>
      </div>

      <div style={styles.right}>
        <span style={styles.rightText}>right</span>
      </div>
    </section>
  );
}