import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpenText,
  Briefcase,
  Buildings,
  ChatCircleDots,
  Eye,
  Info,
  List,
  PersonSimpleWalk,
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
  DEFAULT_CAMERA_PRESET,
  getCameraPreset,
  getNextCameraPreset,
} from "./game/camera.js";
import {
  calculateOutcome,
  getPhaseProgress,
  getTrainingCase,
  TRAINING_CASES,
} from "./game/scenarios.js";
import {
  SCENE_CONTROL_EVENT,
  getPatientSpeechDuration,
  shouldIgnoreMovementInput,
} from "./game/movement.js";
import {
  getPatientVoiceProfile,
  getPlayerVoiceProfile,
  selectSpeechVoice,
} from "./game/voices.js";

const INITIAL_SCORES = { rapport: 0, safety: 0, reasoning: 0 };
const INITIAL_WORLD_STATE = {
  canInteract: false,
  distance: 2.8,
  isAutoWalking: false,
  isMoving: false,
};
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

  componentDidCatch() {
    this.props.onSceneFailure?.();
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="world-fallback" role="img" aria-label="Community pharmacy interior">
          <img
            src={this.props.patientAvatar}
            alt={`${this.props.patientName} waiting at the consultation counter`}
          />
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

function dispatchSceneControl(action, active = true) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SCENE_CONTROL_EVENT, { detail: { action, active } }),
  );
}

function useCharacterSpeech({
  cue,
  enabled,
  line,
  onComplete,
  pitch = 1,
  rate = 0.96,
  soundOn,
  speakerPrefix = "",
  voiceProfile,
}) {
  const [isSpeaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const playedCueRef = useRef(null);
  const soundOnRef = useRef(soundOn);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    soundOnRef.current = soundOn;
    if (!soundOn && utteranceRef.current) {
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
  }, [soundOn]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const speech = window.speechSynthesis;
    const spokenLine = speakerPrefix && line.startsWith(speakerPrefix)
      ? line.slice(speakerPrefix.length).trim()
      : line.trim();

    if (!enabled || !spokenLine) {
      if (utteranceRef.current) {
        speech?.cancel();
        utteranceRef.current = null;
      }
      setSpeaking(false);
      return undefined;
    }

    if (playedCueRef.current === cue) {
      setSpeaking(false);
      return undefined;
    }
    playedCueRef.current = cue;

    let finished = false;
    let handleVoicesChanged = null;
    const finish = () => {
      if (finished) return;
      finished = true;
      utteranceRef.current = null;
      setSpeaking(false);
      onCompleteRef.current?.();
    };
    setSpeaking(true);
    const fallbackTimer = window.setTimeout(
      finish,
      getPatientSpeechDuration(spokenLine),
    );

    if (soundOnRef.current && speech && window.SpeechSynthesisUtterance) {
      speech.cancel();
      const speakWithAvailableVoices = () => {
        if (finished) return;
        const voices = speech.getVoices();
        if (!voices.length) return;

        const utterance = new window.SpeechSynthesisUtterance(spokenLine);
        utterance.voice = selectSpeechVoice(voices, voiceProfile);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 0.86;
        utterance.onend = finish;
        utterance.onerror = finish;
        utteranceRef.current = utterance;
        speech.speak(utterance);
      };

      if (speech.getVoices().length) {
        speakWithAvailableVoices();
      } else {
        handleVoicesChanged = speakWithAvailableVoices;
        speech.addEventListener?.("voiceschanged", handleVoicesChanged, {
          once: true,
        });
      }
    }

    return () => {
      finished = true;
      window.clearTimeout(fallbackTimer);
      if (handleVoicesChanged) {
        speech?.removeEventListener?.("voiceschanged", handleVoicesChanged);
      }
      if (utteranceRef.current) {
        speech?.cancel();
        utteranceRef.current = null;
      }
    };
  }, [cue, enabled, line, pitch, rate, speakerPrefix, voiceProfile]);

  return isSpeaking;
}

function InteractionPrompt({ buttonRef, onActivate, patientName, worldState }) {
  const isReady = worldState.canInteract || Boolean(onActivate);
  const actionLabel = isReady
    ? `Talk to ${patientName}`
    : worldState.isAutoWalking
      ? `Walking to ${patientName}`
      : worldState.isMoving
        ? "Exploring the pharmacy"
      : `Approach ${patientName}`;

  return (
    <aside
      id="simulation-action"
      className={`interaction-prompt ${isReady ? "interaction-prompt--ready" : ""}`}
      aria-label="Patient interaction"
      tabIndex={-1}
    >
      <span className="interaction-prompt__icon" aria-hidden="true">
        {isReady ? (
          <ChatCircleDots weight="fill" />
        ) : (
          <PersonSimpleWalk weight="fill" />
        )}
      </span>
      <span className="interaction-prompt__copy">
        <small>
          {isReady
            ? onActivate
              ? "3D view unavailable · dialogue remains playable"
              : "Patient in range"
            : `${worldState.distance.toFixed(1)} m to consultation point`}
        </small>
        <strong>{actionLabel}</strong>
      </span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() =>
          onActivate ? onActivate() : dispatchSceneControl("interact")
        }
        aria-label={
          isReady
            ? `Start conversation with ${patientName}`
            : `Walk to ${patientName}`
        }
      >
        <kbd>{isReady ? "E" : "GO"}</kbd>
        <span>{isReady ? "Start" : "Auto-walk"}</span>
      </button>
    </aside>
  );
}

function MovementPad() {
  function hold(action) {
    return {
      onBlur: () => dispatchSceneControl(action, false),
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dispatchSceneControl(action, true);
        }
      },
      onKeyUp: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dispatchSceneControl(action, false);
        }
      },
      onPointerCancel: () => dispatchSceneControl(action, false),
      onPointerDown: (event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        dispatchSceneControl(action, true);
      },
      onPointerLeave: () => dispatchSceneControl(action, false),
      onPointerUp: () => dispatchSceneControl(action, false),
    };
  }

  return (
    <div className="movement-pad" role="group" aria-label="Movement controls">
      <button className="movement-pad__up" type="button" aria-label="Move forward" {...hold("forward")}>
        <ArrowUp weight="bold" />
      </button>
      <button className="movement-pad__left" type="button" aria-label="Move left" {...hold("left")}>
        <ArrowLeft weight="bold" />
      </button>
      <button className="movement-pad__talk" type="button" aria-label="Approach patient" onClick={() => dispatchSceneControl("interact")}>
        <ChatCircleDots weight="fill" />
      </button>
      <button className="movement-pad__right" type="button" aria-label="Move right" {...hold("right")}>
        <ArrowRight weight="bold" />
      </button>
      <button className="movement-pad__down" type="button" aria-label="Move backward" {...hold("backward")}>
        <ArrowDown weight="bold" />
      </button>
    </div>
  );
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
  const [cameraPreset, setCameraPreset] = useState(DEFAULT_CAMERA_PRESET);
  const [patientPulse, setPatientPulse] = useState(false);
  const [isConsulting, setConsulting] = useState(false);
  const [pendingTurn, setPendingTurn] = useState(null);
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const [worldState, setWorldState] = useState(INITIAL_WORLD_STATE);
  const [sceneFailed, setSceneFailed] = useState(false);
  const dialogueShellRef = useRef(null);
  const interactionButtonRef = useRef(null);
  const patientPulseTimerRef = useRef(null);
  const wasConsultingRef = useRef(false);

  const trainingCase = useMemo(
    () => getTrainingCase(activeCaseId),
    [activeCaseId],
  );
  const cameraView = getCameraPreset(cameraPreset);
  const nextCameraPreset = getNextCameraPreset(cameraPreset);
  const nextCameraView = getCameraPreset(nextCameraPreset);
  const turn = trainingCase.turns[turnIndex];
  const phases = getPhaseProgress(trainingCase, turnIndex);
  const progress = Math.round(((turnIndex + 1) / trainingCase.turns.length) * 100);
  const outcome = calculateOutcome(scores, criticalErrors);
  const activePatientLine =
    selectedChoice?.response || freeformReply || turn.patientLine;
  const patientReaction = selectedChoice
    ? selectedChoice.correct
      ? "positive"
      : "negative"
    : "neutral";
  const patientSpeechCue = `${activeCaseId}:${turnIndex}:${selectedChoice?.id ?? "opening"}:${freeformReply}`;
  const controlsEnabled = !(
    isCaseDrawerOpen ||
    isSourceDrawerOpen ||
    isDebriefOpen
  );
  const patientPitch =
    activeCaseId === "raj-prescription"
      ? 0.88
      : activeCaseId === "mei-lin-antibiotic"
        ? 1.06
        : 0.98;
  const patientVoiceProfile = useMemo(
    () => getPatientVoiceProfile(trainingCase.patientGender),
    [trainingCase.patientGender],
  );
  const isPatientSpeaking = useCharacterSpeech({
    cue: patientSpeechCue,
    enabled: isConsulting && controlsEnabled,
    line: activePatientLine,
    pitch: patientPitch,
    soundOn: isSoundOn,
    speakerPrefix: `${trainingCase.patientName}:`,
    voiceProfile: patientVoiceProfile,
  });

  const resetCase = useCallback((caseId = activeCaseId) => {
    setActiveCaseId(caseId);
    setTurnIndex(0);
    setSelectedChoice(null);
    setScores(INITIAL_SCORES);
    setCriticalErrors(0);
    setHistory([]);
    setFacts([]);
    setFreeformReply("");
    setPendingTurn(null);
    setCameraPreset(DEFAULT_CAMERA_PRESET);
    setDebriefOpen(false);
    setConsulting(false);
    setWorldState(INITIAL_WORLD_STATE);
    setSceneResetKey((current) => current + 1);
  }, [activeCaseId]);

  const applyChoice = useCallback(
    (choice) => {
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
    [isSoundOn, turn.phase, turnIndex],
  );

  const chooseResponse = useCallback(
    (choice) => {
      if (selectedChoice || pendingTurn || isPatientSpeaking) return;
      setPendingTurn({
        id: `choice:${choice.id}`,
        kind: "choice",
        line: choice.label,
        choice,
      });
      playInterfaceTone(isSoundOn, 430);
    },
    [isPatientSpeaking, isSoundOn, pendingTurn, selectedChoice],
  );

  const handlePlayerSpeechComplete = useCallback(() => {
    if (!pendingTurn) return;
    if (pendingTurn.kind === "choice") {
      applyChoice(pendingTurn.choice);
    } else {
      setSelectedChoice(null);
      setFreeformReply(pendingTurn.reply);
      playInterfaceTone(isSoundOn, 460);
    }
    setPendingTurn(null);
  }, [applyChoice, isSoundOn, pendingTurn]);

  const isPlayerSpeaking = useCharacterSpeech({
    cue: pendingTurn
      ? `${activeCaseId}:${turnIndex}:${pendingTurn.id}`
      : "",
    enabled: Boolean(pendingTurn) && isConsulting,
    line: pendingTurn?.line ?? "",
    onComplete: handlePlayerSpeechComplete,
    pitch: 0.92,
    rate: 1.02,
    soundOn: isSoundOn && controlsEnabled,
    voiceProfile: getPlayerVoiceProfile(),
  });

  const continueCase = useCallback(() => {
    if (!selectedChoice || isPatientSpeaking || isPlayerSpeaking) return;
    playInterfaceTone(isSoundOn, 620);
    if (turnIndex >= trainingCase.turns.length - 1) {
      setDebriefOpen(true);
      return;
    }
    setTurnIndex((current) => current + 1);
    setSelectedChoice(null);
    setFreeformReply("");
  }, [
    isPatientSpeaking,
    isPlayerSpeaking,
    isSoundOn,
    selectedChoice,
    trainingCase.turns.length,
    turnIndex,
  ]);

  const handleConsultationChange = useCallback(
    (nextState) => {
      if (isConsulting === nextState) return;
      playInterfaceTone(isSoundOn, nextState ? 520 : 320);
      if (!nextState) setPendingTurn(null);
      setConsulting(nextState);
    },
    [isConsulting, isSoundOn],
  );

  const handleWorldState = useCallback((nextState) => {
    setWorldState((current) => {
      if (
        current.canInteract === nextState.canInteract &&
        current.distance === nextState.distance &&
        current.isAutoWalking === nextState.isAutoWalking &&
        current.isMoving === nextState.isMoving
      ) {
        return current;
      }
      return nextState;
    });
  }, []);

  const handleSceneFailure = useCallback(() => {
    setSceneFailed(true);
    setConsulting(true);
  }, []);

  const cycleCameraView = useCallback(() => {
    setCameraPreset((current) => getNextCameraPreset(current));
  }, []);

  useEffect(() => {
    const shouldRestorePrompt = wasConsultingRef.current && !isConsulting;
    wasConsultingRef.current = isConsulting;
    const frame = window.requestAnimationFrame(() => {
      if (isConsulting) {
        dialogueShellRef.current?.focus({ preventScroll: true });
      } else if (shouldRestorePrompt) {
        interactionButtonRef.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isConsulting]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (isCaseDrawerOpen || isSourceDrawerOpen || isDebriefOpen) return;
      if (
        event.key.toLowerCase() === "v" &&
        !sceneFailed &&
        !shouldIgnoreMovementInput(event.target)
      ) {
        event.preventDefault();
        cycleCameraView();
        return;
      }
      if (!isConsulting || shouldIgnoreMovementInput(event.target)) return;
      if (
        !selectedChoice &&
        !pendingTurn &&
        !isPatientSpeaking &&
        ["1", "2", "3"].includes(event.key)
      ) {
        const choice = turn.choices[Number(event.key) - 1];
        if (choice) chooseResponse(choice);
      }
      if (
        selectedChoice &&
        !isPatientSpeaking &&
        !isPlayerSpeaking &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        continueCase();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    chooseResponse,
    continueCase,
    cycleCameraView,
    isCaseDrawerOpen,
    isDebriefOpen,
    isConsulting,
    isPatientSpeaking,
    isPlayerSpeaking,
    isSourceDrawerOpen,
    pendingTurn,
    sceneFailed,
    selectedChoice,
    turn.choices,
  ]);

  const handlePatientFocus = useCallback((mode = "engaged") => {
    setPatientPulse(true);
    playInterfaceTone(isSoundOn, mode === "engaged" ? 480 : 410);
    if (patientPulseTimerRef.current) {
      window.clearTimeout(patientPulseTimerRef.current);
    }
    patientPulseTimerRef.current = window.setTimeout(
      () => setPatientPulse(false),
      720,
    );
  }, [isSoundOn]);

  useEffect(
    () => () => {
      if (patientPulseTimerRef.current) {
        window.clearTimeout(patientPulseTimerRef.current);
      }
    },
    [],
  );

  function handleAskQuestion(question) {
    if (selectedChoice || pendingTurn || isPatientSpeaking) return;
    setPendingTurn({
      id: `question:${Date.now()}`,
      kind: "question",
      line: question,
      reply: getFreeformPatientReply(trainingCase, question),
    });
    playInterfaceTone(isSoundOn, 430);
  }

  function handleCaseSelect(caseId) {
    resetCase(caseId);
    setCaseDrawerOpen(false);
  }

  return (
    <main className="simulator-shell">
      <a className="skip-link" href="#simulation-action">
        Skip to primary action
      </a>

      <SceneErrorBoundary
        onSceneFailure={handleSceneFailure}
        patientAvatar={trainingCase.avatar}
        patientName={trainingCase.patientName}
      >
        <Suspense
          fallback={
            <div className="scene-loading" role="status">
              Preparing the pharmacy…
            </div>
          }
        >
          <PharmacyScene
            cameraPreset={cameraPreset}
            patientAvatar={trainingCase.avatar}
            patientName={trainingCase.patientName}
            patientSpeaking={isPatientSpeaking}
            playerSpeaking={isPlayerSpeaking}
            patientReaction={patientReaction}
            consulting={isConsulting}
            controlsEnabled={controlsEnabled}
            resetKey={sceneResetKey}
            onConsultationChange={handleConsultationChange}
            onPatientFocus={handlePatientFocus}
            onWorldState={handleWorldState}
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
          <small>{isConsulting ? "Current objective" : "Navigation"}</small>
          <strong>
            {isConsulting
              ? turn.objective
              : sceneFailed
                ? `Open the conversation with ${trainingCase.patientName}`
                : `Approach ${trainingCase.patientName} to begin`}
          </strong>
        </span>
      </div>

      <div className={`patient-focus-hint ${patientPulse ? "patient-focus-hint--pulse" : ""}`}>
        <span>{trainingCase.patientName}</span>
        <small>
          {isConsulting
            ? isPlayerSpeaking
              ? "Pharmacist speaking"
              : isPatientSpeaking
                ? "Patient speaking"
                : "Conversation focused"
            : worldState.isMoving
              ? "Walking through the consultation bay"
              : "Waiting at the consultation counter"}
        </small>
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

      {sceneFailed ? null : (
        <button
          className="world-control"
          type="button"
          onClick={cycleCameraView}
          aria-label={`Camera view: ${cameraView.label}. Activate to switch to ${nextCameraView.label} view`}
          title="Change camera angle (V)"
          data-camera-preset={cameraPreset}
        >
          <Eye weight="bold" />
          <span>{cameraView.label} view</span>
          <kbd>V</kbd>
          <ArrowRight weight="bold" />
        </button>
      )}

      {isConsulting ? (
        <div
          id="simulation-action"
          className={`dialogue-panel-shell ${patientPulse ? "dialogue-pulse" : ""}`}
          ref={dialogueShellRef}
          tabIndex={-1}
        >
          <DialoguePanel
            key={`${activeCaseId}-${turnIndex}`}
            patientName={trainingCase.patientName}
            turn={turn}
            selectedChoice={selectedChoice}
            onChoose={chooseResponse}
            onContinue={continueCase}
            onAskQuestion={handleAskQuestion}
            freeformReply={freeformReply}
            isSpeaking={isPatientSpeaking}
            interactionLocked={
              isPatientSpeaking || isPlayerSpeaking || Boolean(pendingTurn)
            }
            patientReaction={patientReaction}
            playerLine={pendingTurn?.line ?? ""}
            playerSpeaking={isPlayerSpeaking}
            onLeave={() => handleConsultationChange(false)}
          />
        </div>
      ) : (
        <>
          <InteractionPrompt
            buttonRef={interactionButtonRef}
            onActivate={
              sceneFailed ? () => handleConsultationChange(true) : undefined
            }
            patientName={trainingCase.patientName}
            worldState={worldState}
          />
          {sceneFailed ? null : <MovementPad />}
        </>
      )}

      <div className="input-hints" aria-hidden="true">
        {isConsulting ? (
          <>
            <span>
              <kbd>1–3</kbd> choose
            </span>
            <span>
              <kbd>Enter</kbd> continue
            </span>
            <span>
              <kbd>Esc</kbd> step away
            </span>
          </>
        ) : (
          <>
            <span>
              <kbd>WASD</kbd> move
            </span>
            <span>
              <kbd>Shift</kbd> brisk walk
            </span>
            <span>
              Click floor to walk · <kbd>E</kbd> talk
            </span>
          </>
        )}
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
