import {
  ArrowRight,
  BookOpenText,
  CheckCircle,
  Clock,
  X,
} from "@phosphor-icons/react";
import { TRAINING_CASES } from "../game/scenarios.js";

export function CaseDrawer({ activeCaseId, onClose, onSelectCase }) {
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="case-drawer"
        aria-label="Choose a training case"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="case-drawer__header">
          <div>
            <span className="eyebrow">Case library</span>
            <h2>Choose the next encounter</h2>
            <p>Each case practises a different community-pharmacy decision.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <X weight="bold" />
            <span className="visually-hidden">Close case library</span>
          </button>
        </header>

        <div className="case-drawer__list">
          {TRAINING_CASES.map((trainingCase) => {
            const isActive = trainingCase.id === activeCaseId;
            return (
              <article className="case-card" key={trainingCase.id}>
                <div className="case-card__topline">
                  <span>{trainingCase.caseType}</span>
                  {isActive ? (
                    <span className="case-card__active">
                      <CheckCircle weight="fill" /> Active
                    </span>
                  ) : null}
                </div>
                <h3>{trainingCase.title}</h3>
                <p>{trainingCase.summary}</p>
                <div className="case-card__meta">
                  <span>
                    <BookOpenText /> {trainingCase.difficulty}
                  </span>
                  <span>
                    <Clock /> {trainingCase.duration}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectCase(trainingCase.id)}
                  disabled={isActive}
                >
                  {isActive ? "In progress" : "Start case"}
                  {!isActive ? <ArrowRight weight="bold" /> : null}
                </button>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
