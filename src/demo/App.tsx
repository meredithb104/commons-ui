import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Alert,
  Button,
  Dialog,
  FormErrorSummary,
  LiveRegionProvider,
  ProgressMeter,
  SkipLink,
  Switch,
  Tabs,
  TextField,
  useAnnouncer,
  type FormError,
} from "../lib";
import { knowYourRights, resourceLanguages } from "./content";
import "./demo.css";

type Theme = "auto" | "light" | "dark" | "high-contrast";

export default function App() {
  return (
    <LiveRegionProvider>
      <Page />
    </LiveRegionProvider>
  );
}

function Page() {
  const [theme, setTheme] = useState<Theme>("auto");

  useEffect(() => {
    if (theme === "auto") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <SkipLink />
      <header className="site-header">
        <div className="wrap">
          <p className="eyebrow">Commons UI</p>
          <h1>Accessible-by-default React components for organizers, advocates, and mutual aid.</h1>
          <p className="lede">
            A small component library where accessibility is enforced by the build, not requested in code review. Every
            piece below works with a keyboard, a screen reader, a braille display, high contrast, and reduced motion.
            The content is real so you can judge the components on real work.
          </p>
          <p>
            <a href="https://github.com/meredithb104/commons-ui">Source on GitHub</a>
          </p>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="wrap">
        <ThemeControls theme={theme} setTheme={setTheme} />
        <KnowYourRights />
        <Petition />
        <MutualAidForm />
        <ReportBarrier />
        <Resources />
      </main>

      <footer className="site-footer wrap">
        <p>
          Built by <a href="https://www.linkedin.com/in/meredith-boyce/">Meredith Boyce</a>. MIT licensed. Nothing on this
          page is legal advice.
        </p>
      </footer>
    </>
  );
}

/* ---------------------------------------------------------------- */

function ThemeControls({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const { announce } = useAnnouncer();
  const options: Array<{ id: Theme; label: string }> = [
    { id: "auto", label: "Match system" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "high-contrast", label: "High contrast" },
  ];
  return (
    <section aria-labelledby="theme-h" className="section section--tools">
      <h2 id="theme-h">Theme</h2>
      <p>
        Three themes from one token file. Every text/background pair is contrast-checked when the tokens compile; a
        failing pair fails the build.
      </p>
      <fieldset className="theme-fieldset">
        <legend>Choose a theme</legend>
        {options.map((o) => (
          <label key={o.id} className="theme-option">
            <input
              type="radio"
              name="theme"
              value={o.id}
              checked={theme === o.id}
              onChange={() => {
                setTheme(o.id);
                announce(`Theme changed to ${o.label}`);
              }}
            />
            {o.label}
          </label>
        ))}
      </fieldset>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function KnowYourRights() {
  const [plain, setPlain] = useState(false);
  const { announce } = useAnnouncer();
  return (
    <section aria-labelledby="kyr-h" className="section">
      <h2 id="kyr-h">Know your rights</h2>
      <p className="component-tag">
        Components: <code>Accordion</code>, <code>Switch</code>. Pattern: WAI-ARIA accordion, arrow keys move between
        headers, Home/End jump. Headings inside are real headings.
      </p>
      <Switch
        checked={plain}
        onChange={(v) => {
          setPlain(v);
          announce(v ? "Showing plain language versions" : "Showing full versions");
        }}
        label="Plain language"
        description="Shorter sentences, everyday words, one idea at a time."
      />
      <Alert tone="info" title="Not legal advice">
        <p>General information only. Laws vary by state. Talk to a lawyer or a legal aid office about your situation.</p>
      </Alert>
      <Accordion defaultOpen={["stopped"]}>
        {knowYourRights.map((entry) => (
          <AccordionItem key={entry.id} id={entry.id} title={entry.title}>
            {(plain ? entry.plain : entry.full).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Petition() {
  const goal = 2000;
  const [count, setCount] = useState(1387);
  const [signed, setSigned] = useState(false);
  const [busy, setBusy] = useState(false);
  const { announce } = useAnnouncer();

  const sign = () => {
    setBusy(true);
    window.setTimeout(() => {
      const next = count + 1;
      setCount(next);
      setSigned(true);
      setBusy(false);
      const pct = Math.round((next / goal) * 100);
      announce(`Thank you. Your name was added. ${next.toLocaleString()} of ${goal.toLocaleString()} signatures, ${pct} percent.`);
    }, 600);
  };

  return (
    <section aria-labelledby="pet-h" className="section">
      <h2 id="pet-h">Petition: fix the curb cuts on Washington Street</h2>
      <p className="component-tag">
        Components: <code>ProgressMeter</code>, <code>Button</code>, <code>useAnnouncer</code>. The meter is a real{" "}
        <code>progressbar</code> with human value text. The button uses <code>aria-busy</code> instead of{" "}
        <code>disabled</code> so focus is never lost. The count change is announced once, politely.
      </p>
      <p>
        Twelve of the fourteen corners between Dudley and Melnea Cass have no ramp or a ramp with a lip over two inches.
        Wheelchair users, parents with strollers, and anyone using a white cane are forced into the street. We are asking
        the city to fund repairs in this fiscal year.
      </p>
      <ProgressMeter label="Signatures" value={count} max={goal} unit="signatures" />
      {signed ? (
        <Alert tone="success" title="Your name was added">
          <p>We will email you when the city responds.</p>
        </Alert>
      ) : (
        <Button onClick={sign} loading={busy} loadingLabel="Adding your name">
          Add my name
        </Button>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- */

type AidForm = { name: string; contact: string; need: string; canPickUp: boolean };

function MutualAidForm() {
  const [form, setForm] = useState<AidForm>({ name: "", contact: "", need: "", canPickUp: false });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { announce } = useAnnouncer();

  const errorFor = (id: string) => errors.find((e) => e.fieldId === id)?.message;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormError[] = [];
    if (!form.name.trim()) next.push({ fieldId: "aid-name", message: "Enter the name you want us to use" });
    if (!form.contact.trim()) next.push({ fieldId: "aid-contact", message: "Enter a phone number, email, or other way to reach you" });
    if (form.need.trim().length < 10) next.push({ fieldId: "aid-need", message: "Tell us what you need in a sentence or two" });
    setErrors(next);
    if (next.length === 0) {
      setSubmitted(true);
      announce("Request sent. A neighbor will reach out within a day.");
    }
  };

  if (submitted) {
    return (
      <section aria-labelledby="aid-h" className="section">
        <h2 id="aid-h">Mutual aid request</h2>
        <Alert tone="success" title="Request sent">
          <p>A neighbor will reach out within a day using the contact you gave us.</p>
        </Alert>
        <Button variant="secondary" onClick={() => { setSubmitted(false); setForm({ name: "", contact: "", need: "", canPickUp: false }); }}>
          Send another request
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="aid-h" className="section">
      <h2 id="aid-h">Mutual aid request</h2>
      <p className="component-tag">
        Components: <code>TextField</code>, <code>FormErrorSummary</code>, <code>Switch</code>. Submit with fields empty:
        focus moves to an error summary whose links focus each field; each field is <code>aria-invalid</code> with its
        error in <code>aria-describedby</code>. Try it with a screen reader.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <FormErrorSummary errors={errors} />
        <TextField
          id="aid-name"
          label="Your name"
          hint="First name or a nickname is fine."
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errorFor("aid-name")}
          autoComplete="given-name"
        />
        <TextField
          id="aid-contact"
          label="How can we reach you?"
          hint="Phone, email, Signal, or a neighbor who can pass a message."
          required
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          error={errorFor("aid-contact")}
        />
        <TextField
          id="aid-need"
          multiline
          rows={4}
          label="What do you need?"
          hint="Groceries, a ride, a prescription pickup, help with a form. Anything."
          required
          value={form.need}
          onChange={(e) => setForm({ ...form, need: e.target.value })}
          error={errorFor("aid-need")}
        />
        <Switch
          id="aid-pickup"
          checked={form.canPickUp}
          onChange={(v) => setForm({ ...form, canPickUp: v })}
          label="I can meet at a pickup point"
          description="Leave off if you need delivery to your door."
        />
        <Button type="submit">Send request</Button>
      </form>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function ReportBarrier() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const { announce } = useAnnouncer();
  return (
    <section aria-labelledby="rep-h" className="section">
      <h2 id="rep-h">Report an access barrier</h2>
      <p className="component-tag">
        Component: <code>Dialog</code> on the native <code>&lt;dialog&gt;</code> element. Focus moves in on open, the page
        behind is inert, Escape closes, and focus returns to the button that opened it.
      </p>
      <p>Found a broken elevator, a blocked ramp, a website you cannot use? Tell us and we will route it.</p>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Report a barrier
      </Button>
      {sent && (
        <Alert tone="success" title="Report received">
          <p>Thank you. Reports are reviewed every weekday.</p>
        </Alert>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Report a barrier"
        description="Two questions. Skip anything you do not want to share."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            setSent(true);
            announce("Report received. Thank you.");
          }}
        >
          <TextField id="rep-where" label="Where is it?" hint="An address, a building, or a web page." />
          <TextField id="rep-what" multiline rows={3} label="What is the barrier?" />
          <Button type="submit">Send report</Button>
        </form>
      </Dialog>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Resources() {
  return (
    <section aria-labelledby="res-h" className="section">
      <h2 id="res-h">Get help in your language</h2>
      <p className="component-tag">
        Component: <code>Tabs</code>. Roving tabindex, arrow keys, Home/End. Each tab and panel carries a{" "}
        <code>lang</code> attribute so screen readers switch pronunciation (WCAG 3.1.2).
      </p>
      <Tabs
        label="Language"
        tabs={resourceLanguages.map((r) => ({
          id: r.id,
          lang: r.lang,
          label: r.label,
          content: (
            <>
              <h3>{r.heading}</h3>
              {r.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </>
          ),
        }))}
      />
    </section>
  );
}
