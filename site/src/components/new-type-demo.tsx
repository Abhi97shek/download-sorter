import { Check, FolderPlus } from "lucide-react";
import { Button, Card, Field, Stage, Text, Toast, type Act } from "@/stageshow/kit";
import "./new-type-demo.css";

/**
 * The popup Hopper shows for a file type it hasn't seen: a folder name is typed,
 * Create Folder & Move is pressed, and a note confirms where the file went.
 * Plays once when it scrolls into view; reduced motion shows the finished state.
 */
type S = { name: string; focus: boolean; moved: boolean };
const NAME = "SKETCH Files";

async function script(a: Act<S>) {
  await a.wait(700);
  a.mark("type");
  await a.type("name", NAME, { interval: 60 });
  await a.wait(500);
  a.mark("press");
  await a.click({ at: "create", x: 0.5, y: 0.5 });
  a.put({ focus: false, moved: true });
  await a.wait(2200);
}

export function NewTypeDemo() {
  return (
    <Stage<S>
      width={520}
      height={430}
      compact={{ below: 480, width: 358, height: 430 }}
      initial={{ name: "", focus: true, moved: false }}
      poster={{ name: NAME, focus: false, moved: true }}
      play="once"
      script={script}
      accent="#c2410c"
      greys="cool"
      cursor={{ at: { x: 440, y: 380 } }}
      className="nt"
    >
      {(s) => (
        <>
          <Card className="nt-alert" pad="large" lift>
            <span className="nt-icon"><FolderPlus size={22} strokeWidth={1.8} /></span>
            <Text className="nt-title">New file type: .sketch</Text>
            <Text className="nt-body" wrap>
              “design.sketch” was downloaded, and there is no folder for .sketch files yet. Type a name for a new folder.
            </Text>
            <Field label="Folder name" value={s.name} focused={s.focus} />
            <Button variant="primary" size="large" data-target="create" data-cursor="pointer">Create Folder &amp; Move</Button>
            <div className="nt-more">
              <Button size="large">Skip for Now</Button>
              <Button size="large">Never Sort .sketch</Button>
            </div>
          </Card>
          <Toast className="nt-toast" show={s.moved} icon={<Check size={14} strokeWidth={3} />}>
            design.sketch moved to SKETCH Files
          </Toast>
        </>
      )}
    </Stage>
  );
}
