import { globalStyles } from "../GlobalComponentStyleSheets"; //Imports global as default. If you edit this style sheet all components are changed.
import { filterBlockStyles } from "./FilterBlockStyle"; //Imports specific style sheets for this component.

//Later spreads overide earlier one:
//{ ...a, ...b }    b wins if keys collide
const styles = {
  bar: { ...globalStyles.bar, ...filterBlockStyles.bar }, //Takes everything from globalStyle.bar, then overides it with css in filterBlockStyles.bar.
  left: { ...globalStyles.left },
  right: { ...globalStyles.right },
  label: { ...globalStyles.label, ...filterBlockStyles.label },
  rightText: { ...filterBlockStyles.rightText },
};

export default function FilterBlock() {
  return (
    <section style={styles.bar}>
      <div style={styles.left}>
        <p style={styles.label}>FilterBlock</p>
        <span style={{ color: "#fff" }}>left</span>
      </div>

      <div style={styles.right}>
        <span style={styles.rightText}>right</span>
      </div>
    </section>
  );
}