import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChatCircleDots,
  CheckCircle,
  PencilSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

function ChoiceFeedback({ choice, disabled, onContinue }) {
  const isStrong = choice.correct;
  const continueButtonRef = useRef(null);

  useEffect(() => {
    if (!disabled) continueButtonRef.current?.focus({ preventScroll: true });
  }, [disabled]);

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
      <button
        ref={continueButtonRef}
        type="button"
        onClick={onContinue}
        disabled={disabled}
      >
        {disabled ? "Listening…" : "Continue"}
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
  isSpeaking = false,
  interactionLocked = false,
  patientReaction = "neutral",
  playerLine = "",
  playerSpeaking = false,
  onLeave,
}) {
  const [customQuestion, setCustomQuestion] = useState("");

  function submitQuestion(event) {
    event.preventDefault();
    const question = customQuestion.trim();
    if (!question || interactionLocked) return;
    onAskQuestion(question);
    setCustomQuestion("");
  }

  const activeSpeaker = playerSpeaking ? "You" : patientName;
  const activeRole = playerSpeaking ? "Pharmacist" : "Patient";
  const patientState =
    playerSpeaking || isSpeaking
      ? "Speaking"
      : patientReaction === "positive"
        ? "Reassured"
        : patientReaction === "negative"
          ? "Concerned"
          : "Listening";

  return (
    <section
      className={`dialogue-panel ${isSpeaking || playerSpeaking ? "dialogue-panel--speaking" : ""} ${playerSpeaking ? "dialogue-panel--player-speaking" : ""}`}
      aria-label={`Conversation with ${patientName}`}
    >
      <div className="dialogue-panel__heading">
        <div className="dialogue-panel__speaker">
          <span>{activeSpeaker}</span>
          <small>{activeRole}</small>
          <span
            className={`dialogue-panel__speech-state dialogue-panel__speech-state--${patientReaction}`}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            {patientState}
          </span>
        </div>
        <button
          className="dialogue-panel__leave"
          type="button"
          onClick={onLeave}
          aria-label="Step away from the conversation"
          title="Step away (Esc)"
        >
          <X weight="bold" />
        </button>
      </div>
      <p className="dialogue-panel__line" aria-live="polite">
        {playerSpeaking
          ? playerLine
          : selectedChoice?.response || freeformReply || turn.patientLine}
      </p>

      {selectedChoice ? (
        <ChoiceFeedback
          choice={selectedChoice}
          disabled={interactionLocked}
          onContinue={onContinue}
        />
      ) : (
        <div className="dialogue-panel__choices">
          {turn.choices.map((choice, index) => (
            <button
              className="dialogue-choice"
              key={choice.id}
              type="button"
              onClick={() => onChoose(choice)}
              disabled={interactionLocked}
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
              disabled={interactionLocked}
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || interactionLocked}
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
