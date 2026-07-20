import { useState } from "react";
import {
  ArrowRight,
  ChatCircleDots,
  CheckCircle,
  PencilSimple,
  WarningCircle,
} from "@phosphor-icons/react";

function ChoiceFeedback({ choice, onContinue }) {
  const isStrong = choice.correct;
  return (
    <div
      className={`choice-feedback ${isStrong ? "choice-feedback--strong" : "choice-feedback--review"}`}
      role="status"
    >
      {isStrong ? (
        <CheckCircle weight="fill" aria-hidden="true" />
      ) : (
        <WarningCircle weight="fill" aria-hidden="true" />
      )}
      <div>
        <strong>{isStrong ? "Sound decision" : "Pause and review"}</strong>
        <p>{choice.feedback}</p>
      </div>
      <button type="button" onClick={onContinue} autoFocus>
        Continue
        <ArrowRight weight="bold" />
      </button>
    </div>
  );
}

export function DialoguePanel({
  patientName,
  turn,
  selectedChoice,
  onChoose,
  onContinue,
  onAskQuestion,
  freeformReply,
}) {
  const [customQuestion, setCustomQuestion] = useState("");

  function submitQuestion(event) {
    event.preventDefault();
    const question = customQuestion.trim();
    if (!question) return;
    onAskQuestion(question);
    setCustomQuestion("");
  }

  return (
    <section className="dialogue-panel" aria-label={`Conversation with ${patientName}`}>
      <div className="dialogue-panel__speaker">
        <span>{patientName}</span>
        <small>Patient</small>
      </div>
      <p className="dialogue-panel__line" aria-live="polite">
        {selectedChoice?.response || freeformReply || turn.patientLine}
      </p>

      {selectedChoice ? (
        <ChoiceFeedback choice={selectedChoice} onContinue={onContinue} />
      ) : (
        <div className="dialogue-panel__choices">
          {turn.choices.map((choice, index) => (
            <button
              className="dialogue-choice"
              key={choice.id}
              type="button"
              onClick={() => onChoose(choice)}
            >
              <span className="dialogue-choice__shortcut" aria-hidden="true">
                {index + 1}
              </span>
              <ChatCircleDots weight="fill" aria-hidden="true" />
              <span>{choice.label}</span>
              <ArrowRight weight="bold" aria-hidden="true" />
            </button>
          ))}

          <form className="custom-question" onSubmit={submitQuestion}>
            <PencilSimple aria-hidden="true" />
            <label className="visually-hidden" htmlFor="custom-question-input">
              Ask your own question
            </label>
            <input
              id="custom-question-input"
              type="text"
              value={customQuestion}
              placeholder="Ask your own question…"
              onChange={(event) => setCustomQuestion(event.target.value)}
            />
            <button type="submit" disabled={!customQuestion.trim()}>
              Ask
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
