import {
  Brain,
  Circle,
  Heart,
  ShieldCheck,
} from "@phosphor-icons/react";

const METERS = [
  { key: "rapport", label: "Rapport", icon: Heart, color: "coral" },
  { key: "safety", label: "Safety", icon: ShieldCheck, color: "mint" },
  { key: "reasoning", label: "Reasoning", icon: Brain, color: "amber" },
];

function getLevel(score) {
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  if (score >= 1) return 1;
  return 0;
}

export function SkillMeter({ scores }) {
  return (
    <aside className="skill-meter" aria-label="Live competency signals">
      {METERS.map(({ key, label, icon: Icon, color }) => {
        const level = getLevel(scores[key]);
        return (
          <div className="skill-meter__row" key={key}>
            <Icon className={`skill-meter__icon skill-meter__icon--${color}`} />
            <span>{label}</span>
            <span className="skill-meter__dots" aria-label={`${level} of 3`}>
              {[1, 2, 3].map((dot) => (
                <Circle
                  key={dot}
                  weight={dot <= level ? "fill" : "regular"}
                  aria-hidden="true"
                />
              ))}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
