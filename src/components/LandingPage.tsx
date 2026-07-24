import {
  ArrowRight,
  CheckCircle,
  CursorClick,
  Lightning,
  LockKey,
  Rows,
  Sparkle,
} from "@phosphor-icons/react";
import { BrandMark } from "./BrandMark";

interface LandingPageProps {
  navigate: (path: string) => void;
}

const previewColumns = [
  {
    title: "Ideas",
    tone: "violet",
    cards: [
      { title: "Shape the launch narrative", tag: "Research", priority: "High" },
      { title: "Audit competitor homepages", tag: "Strategy", priority: "Medium" },
    ],
  },
  {
    title: "In progress",
    tone: "amber",
    cards: [
      { title: "Responsive homepage wireframes", tag: "Product", priority: "Urgent" },
      { title: "Write conversion copy", tag: "Growth", priority: "High" },
    ],
  },
  {
    title: "Review",
    tone: "green",
    cards: [
      { title: "Component library foundations", tag: "Design", priority: "Medium" },
    ],
  },
];

export function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <button
          type="button"
          className="brand-link"
          onClick={() => navigate("/")}
          aria-label="Planeo home"
        >
          <BrandMark />
        </button>
        <nav aria-label="Main navigation">
          <a href="#workflow">Workflow</a>
          <a href="#features">Features</a>
          <a href="#security">Security</a>
        </nav>
        <div className="marketing-nav-actions">
          <button
            type="button"
            className="marketing-login"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
          <button
            type="button"
            className="marketing-cta small"
            onClick={() => navigate("/signup")}
          >
            Start planning
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">
              <Sparkle size={15} weight="fill" />
              Planning that keeps its momentum
            </p>
            <h1>Turn busy work into a clear path forward.</h1>
            <p className="hero-lede">
              Planeo gives teams one vivid, flexible place to plan projects,
              move work, and finish what matters.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="marketing-cta"
                onClick={() => navigate("/signup")}
              >
                Build your first board
                <ArrowRight size={18} weight="bold" />
              </button>
              <a className="text-link" href="#workflow">
                See how it works
              </a>
            </div>
            <div className="hero-proof" aria-label="Product benefits">
              <span><CheckCircle size={17} weight="fill" /> Free to start</span>
              <span><CheckCircle size={17} weight="fill" /> No credit card</span>
              <span><CheckCircle size={17} weight="fill" /> Secure cloud sync</span>
            </div>
          </div>

          <div className="hero-product" aria-label="Planeo board preview">
            <div className="preview-window">
              <div className="preview-sidebar">
                <BrandMark compact />
                <span className="preview-nav-dot is-active" />
                <span className="preview-nav-dot" />
                <span className="preview-nav-dot" />
              </div>
              <div className="preview-main">
                <div className="preview-topbar">
                  <strong>Website launch</strong>
                  <span className="preview-search">Search workspace</span>
                  <span className="preview-avatar">JO</span>
                </div>
                <div className="preview-board">
                  {previewColumns.map((column) => (
                    <div
                      className={`preview-column preview-${column.tone}`}
                      key={column.title}
                    >
                      <div className="preview-column-title">
                        <strong>{column.title}</strong>
                        <span>{column.cards.length}</span>
                      </div>
                      {column.cards.map((card) => (
                        <div className="preview-card" key={card.title}>
                          <span className="preview-label">{card.tag}</span>
                          <strong>{card.title}</strong>
                          <small>{card.priority}</small>
                        </div>
                      ))}
                      <button type="button" tabIndex={-1}>+ Add a card</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="preview-float preview-float-left">
              <CursorClick size={18} weight="duotone" />
              Drag work forward
            </div>
            <div className="preview-float preview-float-right">
              <Lightning size={18} weight="fill" />
              Rule completed
            </div>
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading">
            <p>From idea to done</p>
            <h2>A board that makes the next move obvious.</h2>
          </div>
          <div className="workflow-steps">
            <article>
              <span>01</span>
              <h3>Capture the work</h3>
              <p>Add context, owners, dates, labels, and checklists without leaving the card.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Move with clarity</h3>
              <p>Reorder priorities and move work between stages with tactile drag and drop.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Finish together</h3>
              <p>Comments, mentions, notifications, and automation keep the handoff moving.</p>
            </article>
          </div>
        </section>

        <section className="feature-band" id="features">
          <div className="feature-copy">
            <p>More than a board</p>
            <h2>See the same plan from every useful angle.</h2>
            <p>
              Switch between Kanban, calendar, and timeline views. Search across
              projects, filter by label, and let simple rules handle repetitive moves.
            </p>
            <button
              type="button"
              className="marketing-cta light"
              onClick={() => navigate("/signup")}
            >
              Try the full workspace
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
          <div className="feature-stack">
            <div className="feature-row">
              <Rows size={23} weight="duotone" />
              <span><strong>Three focused views</strong>Board, calendar, and timeline</span>
            </div>
            <div className="feature-row">
              <Lightning size={23} weight="duotone" />
              <span><strong>Useful automation</strong>Move completed work automatically</span>
            </div>
            <div className="feature-row" id="security">
              <LockKey size={23} weight="duotone" />
              <span><strong>Private by design</strong>Your workspace is protected with row-level security</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <BrandMark />
        <p>Plan clearly. Move confidently.</p>
        <button type="button" onClick={() => navigate("/login")}>Log in</button>
      </footer>
    </div>
  );
}
