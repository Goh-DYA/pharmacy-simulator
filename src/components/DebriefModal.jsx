import {
  ArrowCounterClockwise,
  ArrowRight,
  CheckCircle,
  ListChecks,
  Sparkle,
} from "@phosphor-icons/react";

export function DebriefModal({
  trainingCase,
  scores,
  outcome,
  criticalErrors,
  history,
  onReplay,
  onChooseCase,
}) {
  const strongDecisions = history.filter((entry) => entry.correct).length;
  return (
    <div className="debrief-backdrop">
      <section className={`debrief debrief--${outcome.tone}`} aria-labelledby="debrief-title">
        <div className="debrief__badge">
          {outcome.tone === "excellent" ? (
            <Sparkle weight="fill" />
          ) : (
            <CheckCircle weight="fill" />
          )}
        </div>
        <span className="eyebrow">Encounter debrief</span>
        <h2 id="debrief-title">{outcome.label}</h2>
        <p>{outcome.summary}</p>

        <div className="debrief__case">
          <div>
            <small>Case</small>
            <strong>{trainingCase.title}</strong>
          </div>
          <div>
            <small>Sound decisions</small>
            <strong>
              {strongDecisions}/{trainingCase.turns.length}
            </strong>
          </div>
          <div>
            <small>Critical misses</small>
            <strong>{criticalErrors}</strong>
          </div>
        </div>

        <div className="debrief__scores">
          {Object.entries(scores).map(([skill, score]) => (
            <div key={skill}>
              <span>{skill}</span>
              <strong>{Math.max(0, score)}</strong>
            </div>
          ))}
        </div>

        <div className="debrief__learning">
          <ListChecks weight="fill" />
          <div>
            <strong>Learning goals</strong>
            <ul>
              {trainingCase.learningGoals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="debrief__actions">
          <button className="button button--secondary" type="button" onClick={onReplay}>
            <ArrowCounterClockwise weight="bold" /> Replay case
          </button>
          <button className="button button--primary" type="button" onClick={onChooseCase}>
            Choose another case <ArrowRight weight="bold" />
          </button>
        </div>
      </section>
    </div>
  );
}
