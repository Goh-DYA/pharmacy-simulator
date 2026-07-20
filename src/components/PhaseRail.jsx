import {
  CaretDown,
  CaretUp,
  ChatCircleDots,
  Check,
} from "@phosphor-icons/react";

export function PhaseRail({ phases, activeTurn }) {
  return (
    <aside className="phase-rail" aria-label="Consultation phases">
      {phases.map(({ phase, status }, index) => {
        const isActive = status === "active";
        return (
          <div
            className={`phase-step phase-step--${status}`}
            key={phase}
            aria-current={isActive ? "step" : undefined}
          >
            <span className="phase-step__number" aria-hidden="true">
              {status === "complete" ? <Check weight="bold" /> : index + 1}
            </span>
            <span className="phase-step__body">
              <span className="phase-step__heading">
                <span>{phase}</span>
                {isActive ? <CaretUp /> : <CaretDown />}
              </span>
              {isActive ? (
                <span className="phase-step__detail">
                  <ChatCircleDots weight="fill" />
                  <span>
                    <strong>{activeTurn.railTitle ?? activeTurn.objective}</strong>
                    <small>{activeTurn.coachNote}</small>
                  </span>
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
