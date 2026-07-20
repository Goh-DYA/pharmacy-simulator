import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowsOutSimple,
  BookOpenText,
  Briefcase,
  Buildings,
  Eye,
  EyeSlash,
  Info,
  List,
  SpeakerHigh,
  SpeakerSlash,
  Target,
} from "@phosphor-icons/react";
import { CaseDrawer } from "./components/CaseDrawer.jsx";
import { DebriefModal } from "./components/DebriefModal.jsx";
import { DialoguePanel } from "./components/DialoguePanel.jsx";
import { PhaseRail } from "./components/PhaseRail.jsx";
import { SkillMeter } from "./components/SkillMeter.jsx";
import { SourceDrawer } from "./components/SourceDrawer.jsx";
import {
  calculateOutcome,
  getPhaseProgress,
  getTrainingCase,
  TRAINING_CASES,
} from "./game/scenarios.js";

const INITIAL_SCORES = { rapport: 0, safety: 0, reasoning: 0 };
const PharmacyScene = lazy(() =>
  import("./game/PharmacyScene.jsx").then((module) => ({
    default: module.PharmacyScene,
  })),
);

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="world-fallback" role="img" aria-label="Community pharmacy interior">
          <img src="/assets/patient-daniel.png" alt="Daniel waiting at the consultation counter" />
          <p>3D view unavailable. The training interface remains playable.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function playInterfaceTone(isSoundOn, frequency = 420) {
  if (!isSoundOn || typeof window === "undefined") return;
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
  oscillator.addEventListener("ended", () => context.close());
}

function getFreeformPatientReply(trainingCase, question) {
  const { id: caseId, patientName } = trainingCase;
  const normalized = question.toLowerCase();

  if (caseId === "mei-lin-antibiotic") {
    if (normalized.includes("breath") || normalized.includes("swallow")) {
      return `${patientName}: No breathing or swallowing trouble, and no rash or neck swelling.`;
    }
    if (
      normalized.includes("medicine") ||
      normalized.includes("allerg") ||
      normalized.includes("take")
    ) {
      return `${patientName}: I use a day-and-night cold product. Its label includes paracetamol.`;
    }
    if (normalized.includes("temperature") || normalized.includes("fever")) {
      return `${patientName}: My ear temperature was 37.8°C.`;
    }
  }

  if (caseId === "raj-prescription") {
    if (
      normalized.includes("signature") ||
      normalized.includes("prescription")
    ) {
      return `${patientName}: The clinic printed it today, but I cannot see the doctor’s signature.`;
    }
    if (
      normalized.includes("identity") ||
      normalized.includes("name") ||
      normalized.includes("id")
    ) {
      return `${patientName}: My masked ID ends 482A, and the printed patient details are mine.`;
    }
    if (normalized.includes("change") || normalized.includes("medicine")) {
      return `${patientName}: The doctor said one blood-pressure medicine would change, but I need help understanding which one.`;
    }
    return `${patientName}: I’m happy to wait while you verify the prescription with the clinic.`;
  }

  if (normalized.includes("breath") || normalized.includes("swallow")) {
    return `${patientName}: I can breathe normally and swallow water, though my throat is sore.`;
  }
  if (
    normalized.includes("medicine") ||
    normalized.includes("allerg") ||
    normalized.includes("take")
  ) {
    return `${patientName}: I did take a cold-and-flu product earlier. I can show you the label.`;
  }
  if (normalized.includes("temperature") || normalized.includes("fever")) {
    return `${patientName}: I measured it this morning. It was 38.6°C.`;
  }
  return `${patientName}: I’m not sure how to answer that yet. Could you make the question more specific?`;
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="PharmaCity Academy">
      <span className="brand-mark__icon" aria-hidden="true">
        <Buildings weight="fill" />
      </span>
      <span>
        <strong>PharmaCity</strong>
        <small>Singapore training lab</small>
      </span>
    </div>
  );
}

export function App() {
  const [activeCaseId, setActiveCaseId] = useState(TRAINING_CASES[0].id);
  const [turnIndex, setTurnIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [criticalErrors, setCriticalErrors] = useState(0);
  const [history, setHistory] = useState([]);
  const [facts, setFacts] = useState([]);
  const [freeformReply, setFreeformReply] = useState("");
  const [isCaseDrawerOpen, setCaseDrawerOpen] = useState(false);
  const [isSourceDrawerOpen, setSourceDrawerOpen] = useState(false);
  const [isDebriefOpen, setDebriefOpen] = useState(false);
  const [isSoundOn, setSoundOn] = useState(true);
  const [focusMode, setFocusMode] = useState(true);
  const [patientPulse, setPatientPulse] = useState(false);

  const trainingCase = useMemo(
    () => getTrainingCase(activeCaseId),
    [activeCaseId],
  );
  const turn = trainingCase.turns[turnIndex];
  const phases = getPhaseProgress(trainingCase, turnIndex);
  const progress = Math.round(((turnIndex + 1) / trainingCase.turns.length) * 100);
  const outcome = calculateOutcome(scores, criticalErrors);

  const resetCase = useCallback((caseId = activeCaseId) => {
    setActiveCaseId(caseId);
    setTurnIndex(0);
    setSelectedChoice(null);
    setScores(INITIAL_SCORES);
    setCriticalErrors(0);
    setHistory([]);
    setFacts([]);
    setFreeformReply("");
    setDebriefOpen(false);
  }, [activeCaseId]);

  const chooseResponse = useCallback(
    (choice) => {
      if (selectedChoice) return;
      setSelectedChoice(choice);
      setFreeformReply("");
      setScores((current) => ({
        rapport: current.rapport + (choice.deltas.rapport ?? 0),
        safety: current.safety + (choice.deltas.safety ?? 0),
        reasoning: current.reasoning + (choice.deltas.reasoning ?? 0),
      }));
      if (choice.critical) setCriticalErrors((current) => current + 1);
      if (choice.facts?.length) {
        setFacts((current) => [...new Set([...current, ...choice.facts])]);
      }
      setHistory((current) => [
        ...current,
        {
          turn: turnIndex,
          phase: turn.phase,
          choiceId: choice.id,
          correct: Boolean(choice.correct),
          critical: Boolean(choice.critical),
        },
      ]);
      playInterfaceTone(isSoundOn, choice.correct ? 540 : 260);
    },
    [isSoundOn, selectedChoice, turn.phase, turnIndex],
  );

  const continueCase = useCallback(() => {
    if (!selectedChoice) return;
    playInterfaceTone(isSoundOn, 620);
    if (turnIndex >= trainingCase.turns.length - 1) {
      setDebriefOpen(true);
      return;
    }
    setTurnIndex((current) => current + 1);
    setSelectedChoice(null);
    setFreeformReply("");
  }, [isSoundOn, selectedChoice, trainingCase.turns.length, turnIndex]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (isCaseDrawerOpen || isSourceDrawerOpen || isDebriefOpen) return;
      if (!selectedChoice && ["1", "2", "3"].includes(event.key)) {
        const choice = turn.choices[Number(event.key) - 1];
        if (choice) chooseResponse(choice);
      }
      if (selectedChoice && event.key === "Enter") continueCase();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    chooseResponse,
    continueCase,
    isCaseDrawerOpen,
    isDebriefOpen,
    isSourceDrawerOpen,
    selectedChoice,
    turn.choices,
  ]);

  function handlePatientFocus() {
    setPatientPulse(true);
    playInterfaceTone(isSoundOn, 480);
    window.setTimeout(() => setPatientPulse(false), 620);
  }

  function handleAskQuestion(question) {
    setFreeformReply(getFreeformPatientReply(trainingCase, question));
    playInterfaceTone(isSoundOn, 460);
  }

  function handleCaseSelect(caseId) {
    resetCase(caseId);
    setCaseDrawerOpen(false);
  }

  return (
    <main className="simulator-shell">
      <a className="skip-link" href="#dialogue-panel">
        Skip to dialogue
      </a>

      <SceneErrorBoundary>
        <Suspense
          fallback={
            <div className="scene-loading" role="status">
              Preparing the pharmacy…
            </div>
          }
        >
          <PharmacyScene
            focusMode={focusMode}
            patientAvatar={trainingCase.avatar}
            onPatientFocus={handlePatientFocus}
          />
        </Suspense>
      </SceneErrorBoundary>
      <div className="world-vignette" aria-hidden="true" />

      <header className="topbar">
        <BrandMark />
        <div className="topbar__case">
          <Briefcase weight="fill" />
          <span>
            <small>{trainingCase.caseType}</small>
            <strong>{trainingCase.title}</strong>
          </span>
          <div className="topbar__progress" aria-label={`${progress}% case progress`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <nav className="topbar__actions" aria-label="Game tools">
          <button type="button" onClick={() => setCaseDrawerOpen(true)}>
            <List />
            <span>Cases</span>
          </button>
          <button type="button" onClick={() => setSourceDrawerOpen(true)}>
            <BookOpenText />
            <span>Evidence</span>
          </button>
          <button
            type="button"
            onClick={() => setSoundOn((current) => !current)}
            aria-pressed={isSoundOn}
          >
            {isSoundOn ? <SpeakerHigh /> : <SpeakerSlash />}
            <span>{isSoundOn ? "Sound on" : "Sound off"}</span>
          </button>
        </nav>
      </header>

      <PhaseRail phases={phases} activeTurn={turn} />

      <div className="objective-pill" role="status">
        <Target weight="fill" />
        <span>
          <small>Current objective</small>
          <strong>{turn.objective}</strong>
        </span>
      </div>

      <div className={`patient-focus-hint ${patientPulse ? "patient-focus-hint--pulse" : ""}`}>
        <span>{trainingCase.patientName}</span>
        <small>Click the patient to refocus</small>
      </div>

      <SkillMeter scores={scores} />

      {facts.length ? (
        <aside className="captured-facts" aria-label="Patient facts captured">
          <span>
            <Info weight="fill" /> Patient file · {facts.length}
          </span>
          <ul>
            {facts.slice(-3).map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <button
        className="world-control"
        type="button"
        onClick={() => setFocusMode((current) => !current)}
        aria-pressed={!focusMode}
      >
        {focusMode ? <Eye /> : <EyeSlash />}
        <span>{focusMode ? "Widen view" : "Focus consultation"}</span>
        <ArrowsOutSimple />
      </button>

      <div id="dialogue-panel" className={patientPulse ? "dialogue-pulse" : ""}>
        <DialoguePanel
          key={`${activeCaseId}-${turnIndex}`}
          patientName={trainingCase.patientName}
          turn={turn}
          selectedChoice={selectedChoice}
          onChoose={chooseResponse}
          onContinue={continueCase}
          onAskQuestion={handleAskQuestion}
          freeformReply={freeformReply}
        />
      </div>

      <div className="input-hints" aria-hidden="true">
        <span>
          <kbd>1–3</kbd> choose
        </span>
        <span>
          <kbd>Enter</kbd> continue
        </span>
        <span>Move pointer to look</span>
      </div>

      <div className="prototype-note">
        <Info weight="fill" /> Fictional training case · not clinical decision support
      </div>

      {isCaseDrawerOpen ? (
        <CaseDrawer
          activeCaseId={activeCaseId}
          onClose={() => setCaseDrawerOpen(false)}
          onSelectCase={handleCaseSelect}
        />
      ) : null}
      {isSourceDrawerOpen ? (
        <SourceDrawer onClose={() => setSourceDrawerOpen(false)} />
      ) : null}
      {isDebriefOpen ? (
        <DebriefModal
          trainingCase={trainingCase}
          scores={scores}
          outcome={outcome}
          criticalErrors={criticalErrors}
          history={history}
          onReplay={() => resetCase(activeCaseId)}
          onChooseCase={() => {
            setDebriefOpen(false);
            setCaseDrawerOpen(true);
          }}
        />
      ) : null}
    </main>
  );
}
