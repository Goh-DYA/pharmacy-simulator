import { ArrowSquareOut, ShieldCheck, X } from "@phosphor-icons/react";
import { CLINICAL_SOURCES } from "../game/scenarios.js";

export function SourceDrawer({ onClose }) {
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="source-drawer"
        aria-label="Clinical sources and limitations"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="source-drawer__header">
          <div>
            <span className="eyebrow">Evidence notes</span>
            <h2>Built for supervised learning</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <X weight="bold" />
            <span className="visually-hidden">Close evidence notes</span>
          </button>
        </header>

        <div className="source-drawer__notice">
          <ShieldCheck weight="fill" />
          <p>
            These fictional cases are educational prototypes, not clinical
            decision support. A Singapore-registered pharmacist should review
            all content before training deployment.
          </p>
        </div>

        <div className="source-list">
          {CLINICAL_SOURCES.map((source) => (
            <a href={source.href} key={source.href} target="_blank" rel="noreferrer">
              <span>{source.label}</span>
              <ArrowSquareOut weight="bold" />
            </a>
          ))}
        </div>

        <p className="source-drawer__footnote">
          Guidance snapshot reviewed 20 July 2026. Product classification and
          legal requirements can change; verify real products against current
          Health Sciences Authority records.
        </p>
      </aside>
    </div>
  );
}
