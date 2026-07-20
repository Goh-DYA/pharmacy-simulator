export const PHASES = ["Explore", "Assess", "Plan"];

export const TRAINING_CASES = [
  {
    id: "daniel-sore-throat",
    patientName: "Daniel",
    avatar: "/assets/patient-daniel.png",
    title: "Fever and sore throat",
    caseType: "Minor ailment",
    difficulty: "Guided",
    duration: "6–8 min",
    summary:
      "A young adult asks for relief for a sore throat and measured fever.",
    openingLine: "My throat hurts and I have a fever.",
    learningGoals: [
      "Elicit time course and measured temperature",
      "Screen for breathing and swallowing red flags",
      "Recognise when self-treatment is not enough",
      "Prevent duplicate paracetamol exposure",
    ],
    turns: [
      {
        phase: "Explore",
        objective: "Check for urgent symptoms",
        railTitle: "Open the conversation",
        patientLine: "My throat hurts and I have a fever.",
        coachNote: "Understand the patient’s concerns in their own words.",
        choices: [
          {
            id: "temperature",
            label: "How high was the fever, and when did it start?",
            response:
              "It was 38.6°C this morning. The sore throat started yesterday evening.",
            feedback:
              "Good opening. You established a measured fever above 38°C and a clear time course.",
            deltas: { rapport: 1, safety: 1, reasoning: 1 },
            correct: true,
            facts: ["Temperature: 38.6°C", "Duration: since yesterday"],
          },
          {
            id: "other-symptoms",
            label: "Are you experiencing any other symptoms?",
            response:
              "Mostly the throat pain and feeling hot. I’m not sure what else matters.",
            feedback:
              "Open questions help, but the measured temperature and onset still need to be established.",
            deltas: { rapport: 1, safety: 0, reasoning: 0 },
            facts: ["Main concern: throat pain and fever"],
          },
          {
            id: "product-first",
            label: "I can show you our strongest sore-throat products.",
            response: "Okay… but is it normal to feel this feverish?",
            feedback:
              "Product selection is premature. Assess severity and referral cues before recommending treatment.",
            deltas: { rapport: 0, safety: -1, reasoning: -1 },
            critical: true,
          },
        ],
      },
      {
        phase: "Explore",
        objective: "Check for urgent symptoms",
        patientLine:
          "It was 38.6°C this morning. The sore throat started yesterday evening.",
        coachNote:
          "A focused red-flag screen should come before discussing products.",
        choices: [
          {
            id: "airway-screen",
            label:
              "Any trouble breathing, swallowing fluids, or controlling saliva?",
            response:
              "Breathing is fine. Swallowing hurts, but I can drink water and I’m not drooling.",
            feedback:
              "Strong safety screen. Daniel has no airway emergency features, but his fever still warrants medical assessment.",
            deltas: { rapport: 1, safety: 2, reasoning: 1 },
            correct: true,
            facts: [
              "Breathing: normal",
              "Can swallow fluids",
              "No drooling",
            ],
          },
          {
            id: "pain-score",
            label: "How painful is it from zero to ten?",
            response: "About a six. It hurts most when I swallow.",
            feedback:
              "Pain severity is useful, but it does not replace an airway and swallowing safety screen.",
            deltas: { rapport: 1, safety: 0, reasoning: 1 },
            facts: ["Throat pain: 6/10"],
          },
          {
            id: "assume-flu",
            label: "It sounds like flu. Do you want lozenges?",
            response: "I’m not sure. Should I be worried about the fever?",
            feedback:
              "Avoid diagnostic assumptions. Ask targeted questions and establish whether referral is needed.",
            deltas: { rapport: -1, safety: -1, reasoning: -1 },
            critical: true,
          },
        ],
      },
      {
        phase: "Explore",
        objective: "Reconcile current medicines",
        patientLine:
          "Breathing is fine. Swallowing hurts, but I can still drink water.",
        coachNote:
          "Ask about health conditions, allergies, and everything already taken.",
        choices: [
          {
            id: "medicine-history",
            label:
              "What have you taken so far, and do you have medicine allergies or health conditions?",
            response:
              "I took two cold-and-flu sachets. The box says paracetamol. No allergies or long-term conditions.",
            feedback:
              "Good medicines reconciliation. You found an ingredient that must not be duplicated.",
            deltas: { rapport: 1, safety: 2, reasoning: 1 },
            correct: true,
            facts: [
              "Already used: cold-and-flu sachet",
              "Contains paracetamol",
              "No known medicine allergies",
            ],
          },
          {
            id: "allergy-only",
            label: "Are you allergic to any medicines?",
            response:
              "No allergies. I did take a cold-and-flu sachet earlier, though.",
            feedback:
              "You checked allergies, but a full medicine history is needed to detect duplicate ingredients.",
            deltas: { rapport: 1, safety: 0, reasoning: 0 },
            facts: ["No known medicine allergies"],
          },
          {
            id: "skip-history",
            label: "You look healthy, so we can move on.",
            response: "Should I mention the cold-and-flu sachets I already took?",
            feedback:
              "Appearance cannot replace medication and medical history. This misses a preventable duplication risk.",
            deltas: { rapport: -1, safety: -2, reasoning: -1 },
            critical: true,
          },
        ],
      },
      {
        phase: "Assess",
        objective: "Choose the safest disposition",
        patientLine: "Can I just take something strong and get back to work?",
        coachNote:
          "Bring the fever, negative airway screen, and current product use together.",
        choices: [
          {
            id: "refer",
            label:
              "Explain that the fever needs medical assessment and avoid adding another paracetamol product.",
            response:
              "I understand. I didn’t realise the sachet mattered. I can see a doctor today.",
            feedback:
              "Correct. The fever is a referral cue in this case, while medication reconciliation prevents duplication.",
            deltas: { rapport: 2, safety: 2, reasoning: 2 },
            correct: true,
          },
          {
            id: "self-care-only",
            label: "Recommend self-care only and review if it lasts a week.",
            response: "Even with the temperature above 38°C?",
            feedback:
              "The measured fever already crosses the scenario’s referral threshold. Do not defer assessment for a week.",
            deltas: { rapport: 0, safety: -2, reasoning: -1 },
            critical: true,
          },
          {
            id: "antibiotic",
            label: "Offer an antibiotic so the infection clears quickly.",
            response: "I don’t have a prescription. Is that allowed?",
            feedback:
              "No. Do not supply a prescription-only antibiotic without a valid legal route, and do not assume a bacterial infection.",
            deltas: { rapport: -1, safety: -2, reasoning: -2 },
            critical: true,
          },
        ],
      },
      {
        phase: "Plan",
        objective: "Close the consultation safely",
        patientLine: "What should I do while I arrange the appointment?",
        coachNote:
          "Give a clear next step, a safety net, and check understanding.",
        choices: [
          {
            id: "safe-close",
            label:
              "Arrange prompt medical review, avoid duplicate paracetamol, and seek emergency help for breathing difficulty.",
            response:
              "I’ll see a doctor today, check every label, and get urgent help if breathing becomes difficult.",
            feedback:
              "Excellent close. You gave an actionable referral, prevented duplication, safety-netted, and used teach-back.",
            deltas: { rapport: 2, safety: 2, reasoning: 1 },
            correct: true,
          },
          {
            id: "vague-close",
            label: "Take it easy and see how you feel tomorrow.",
            response: "So I don’t need to see anyone today?",
            feedback:
              "The plan is ambiguous and contradicts the referral decision. State timing and escalation advice clearly.",
            deltas: { rapport: 0, safety: -1, reasoning: -1 },
          },
          {
            id: "no-teach-back",
            label: "Hand over a leaflet and end the consultation.",
            response: "Wait—which product am I supposed to avoid doubling up?",
            feedback:
              "Written information can support counselling, but it does not confirm understanding on its own.",
            deltas: { rapport: -1, safety: -1, reasoning: 0 },
          },
        ],
      },
    ],
  },
  {
    id: "mei-lin-antibiotic",
    patientName: "Mei Lin",
    avatar: "/assets/patient-mei-lin.png",
    title: "The strongest antibiotic",
    caseType: "Demanding customer",
    difficulty: "Intermediate",
    duration: "5–7 min",
    summary:
      "A customer with mild cold symptoms insists that only an antibiotic will help.",
    openingLine: "I need your strongest antibiotic. I can’t afford to be sick.",
    learningGoals: [
      "De-escalate a demanding request",
      "Avoid unsupported diagnosis",
      "Identify duplicate active ingredients",
      "Counsel with empathy and teach-back",
    ],
    turns: [
      {
        phase: "Explore",
        objective: "Listen before correcting",
        patientLine: "I need your strongest antibiotic. I can’t afford to be sick.",
        coachNote: "Acknowledge the concern, then gather the clinical story.",
        choices: [
          {
            id: "empathic-history",
            label:
              "I hear that you need to recover quickly. Can I check your symptoms and what you have taken?",
            response:
              "Thanks. It’s a scratchy throat, mild cough and runny nose for two days. My temperature was 37.8°C.",
            feedback:
              "Empathy lowered the temperature of the conversation and opened a focused assessment.",
            deltas: { rapport: 2, safety: 1, reasoning: 1 },
            correct: true,
            facts: [
              "Duration: 2 days",
              "Temperature: 37.8°C",
              "Mild cough and runny nose",
            ],
          },
          {
            id: "flat-refusal",
            label: "No prescription, no antibiotic. Next customer.",
            response: "That’s not very helpful. Can you at least explain why?",
            feedback:
              "The legal boundary matters, but a dismissive refusal misses assessment, counselling, and de-escalation.",
            deltas: { rapport: -2, safety: 0, reasoning: 0 },
          },
          {
            id: "promise-antibiotic",
            label: "Let me find an antibiotic that does not need a prescription.",
            response: "Great—I knew there would be one.",
            feedback:
              "Critical failure: do not promise an inappropriate or unlawful supply route.",
            deltas: { rapport: 0, safety: -2, reasoning: -2 },
            critical: true,
          },
        ],
      },
      {
        phase: "Explore",
        objective: "Check red flags and current products",
        patientLine:
          "It’s a scratchy throat, mild cough and runny nose. My temperature was 37.8°C.",
        coachNote:
          "Confirm the absence of referral cues, then inspect every current product.",
        choices: [
          {
            id: "red-flags-and-meds",
            label:
              "Any breathing or swallowing trouble, rash, neck swelling—and what have you already used?",
            response:
              "None of those. I’ve been taking a day-and-night cold product. It contains paracetamol.",
            feedback:
              "Complete and efficient. You screened referral cues and found a duplication risk.",
            deltas: { rapport: 1, safety: 2, reasoning: 2 },
            correct: true,
            facts: [
              "No current referral cues disclosed",
              "Cold product contains paracetamol",
            ],
          },
          {
            id: "symptoms-only",
            label: "Any rash or breathing difficulty?",
            response:
              "No. I have been using a day-and-night cold product, if that matters.",
            feedback:
              "The red-flag check helps, but current medicines must be actively reconciled.",
            deltas: { rapport: 1, safety: 1, reasoning: 0 },
          },
          {
            id: "no-more-questions",
            label: "That sounds minor, so no more questions are needed.",
            response: "Does the paracetamol in my cold product matter?",
            feedback:
              "Yes. Skipping medicine history can lead to accidental duplicate therapy.",
            deltas: { rapport: 0, safety: -2, reasoning: -1 },
            critical: true,
          },
        ],
      },
      {
        phase: "Assess",
        objective: "Explain the recommendation",
        patientLine: "So why can’t an antibiotic make this clear faster?",
        coachNote: "Explain without diagnosing or sounding dismissive.",
        choices: [
          {
            id: "explain-antibiotics",
            label:
              "Most sore throats are viral-like and antibiotics do not treat viruses; your current story supports self-care with monitoring.",
            response:
              "That makes sense. I mainly want something safe that helps me manage the symptoms.",
            feedback:
              "Clear, respectful reasoning protects the patient and supports informed choice without claiming a diagnosis.",
            deltas: { rapport: 2, safety: 1, reasoning: 2 },
            correct: true,
          },
          {
            id: "resistance-only",
            label: "Because antibiotic resistance is bad.",
            response: "I’ve heard that, but what does it mean for me today?",
            feedback:
              "The statement is true but incomplete. Connect it to the patient’s presentation and safe next steps.",
            deltas: { rapport: 0, safety: 1, reasoning: 0 },
          },
          {
            id: "diagnose-cold",
            label: "You definitely have a viral cold, so there is nothing to worry about.",
            response: "Definitely? You haven’t examined me.",
            feedback:
              "Avoid certainty and unsupported diagnosis. Safety-net advice still matters.",
            deltas: { rapport: -1, safety: -1, reasoning: -1 },
          },
        ],
      },
      {
        phase: "Plan",
        objective: "Create a safe self-care plan",
        patientLine: "What can I do instead?",
        coachNote: "Combine non-drug advice, ingredient safety, and escalation cues.",
        choices: [
          {
            id: "self-care-plan",
            label:
              "Recommend rest and fluids, follow product labels, avoid duplicate paracetamol, and explain when to seek care.",
            response:
              "I’ll check the ingredients, use only one paracetamol-containing product, and seek care if I worsen or don’t improve.",
            feedback:
              "A complete self-care close: non-drug care, medicine safety, safety-netting, and teach-back.",
            deltas: { rapport: 2, safety: 2, reasoning: 1 },
            correct: true,
          },
          {
            id: "sell-two-products",
            label: "Sell a second cold product as well so she can alternate them.",
            response: "Both boxes list paracetamol. Is alternating them safe?",
            feedback:
              "No. This creates a duplicate-ingredient risk and fails the medicine-supply duty.",
            deltas: { rapport: 0, safety: -2, reasoning: -1 },
            critical: true,
          },
          {
            id: "rest-only",
            label: "Recommend rest, with no further counselling.",
            response: "When should I worry, and can I keep taking my cold product?",
            feedback:
              "Non-drug advice alone leaves medication and escalation questions unanswered.",
            deltas: { rapport: 0, safety: -1, reasoning: 0 },
          },
        ],
      },
    ],
  },
  {
    id: "raj-prescription",
    patientName: "Mr Raj",
    avatar: "/assets/patient-mr-raj.png",
    title: "The unsigned prescription",
    caseType: "Prescription supply",
    difficulty: "Intermediate",
    duration: "5–7 min",
    summary:
      "A regular patient presents a new prescription with an important omission.",
    openingLine:
      "The doctor changed one of my tablets. Can you help me understand why?",
    learningGoals: [
      "Confirm patient identity and intended change",
      "Verify legal prescription particulars",
      "Resolve ambiguity before dispensing",
      "Apply complete labelling and counselling checks",
    ],
    turns: [
      {
        phase: "Explore",
        objective: "Identify the patient and intended change",
        patientLine:
          "The doctor changed one of my tablets. Can you help me understand why?",
        coachNote:
          "Use masked identifiers and reconcile the prescription against the patient’s medicines.",
        choices: [
          {
            id: "verify-identity",
            label:
              "Let’s confirm your identity and compare this prescription with your current medicines.",
            response:
              "Sure. My masked ID ends 482A. The doctor said one blood-pressure tablet would change.",
            feedback:
              "Good. You protected privacy while establishing the intended medicine change.",
            deltas: { rapport: 1, safety: 1, reasoning: 1 },
            correct: true,
            facts: ["Masked ID confirmed", "One intended medicine change"],
          },
          {
            id: "recognise-face",
            label: "I recognise you, so we can skip the identity check.",
            response: "You don’t need to check anything else?",
            feedback:
              "Familiarity is not a substitute for identity and prescription verification.",
            deltas: { rapport: 0, safety: -2, reasoning: -1 },
            critical: true,
          },
          {
            id: "explain-immediately",
            label: "I’ll explain the new tablet before checking the document.",
            response: "All right—but are you sure this prescription is complete?",
            feedback:
              "Counselling comes after confirming that the prescription is authentic, complete, and clinically coherent.",
            deltas: { rapport: 1, safety: -1, reasoning: 0 },
          },
        ],
      },
      {
        phase: "Assess",
        objective: "Inspect the prescription",
        patientLine: "Is everything on the prescription in order?",
        coachNote:
          "Check prescriber, patient, medicine, directions, date, signature, and repeat particulars.",
        choices: [
          {
            id: "spot-signature",
            label:
              "Pause supply: the prescriber’s signature is missing, so I need to clarify and document it.",
            response: "Please call the clinic. I’m happy to wait.",
            feedback:
              "Correct. A missing signature is a legal and safety defect that must be resolved before dispensing.",
            deltas: { rapport: 1, safety: 2, reasoning: 2 },
            correct: true,
            facts: ["Prescription defect: missing prescriber signature"],
          },
          {
            id: "dispense-because-known",
            label: "Dispense because the clinic and patient are familiar.",
            response: "Shouldn’t the clinic confirm it first?",
            feedback:
              "Familiarity does not cure a missing legal particular. Clarify before supply.",
            deltas: { rapport: 0, safety: -2, reasoning: -2 },
            critical: true,
          },
          {
            id: "ask-patient-sign",
            label: "Ask the patient to sign where the prescriber should have signed.",
            response: "I don’t think I’m allowed to sign for my doctor.",
            feedback:
              "Correct—the patient cannot substitute for the prescriber. Contact the clinic.",
            deltas: { rapport: -1, safety: -2, reasoning: -2 },
            critical: true,
          },
        ],
      },
      {
        phase: "Plan",
        objective: "Complete the dispensing check",
        patientLine:
          "The clinic has confirmed and corrected it. What will you check before I go?",
        coachNote:
          "Close the loop with labelling, counselling, and understanding—not just product selection.",
        choices: [
          {
            id: "complete-dispense",
            label:
              "Verify the corrected order, label with required particulars, counsel on the change, and use teach-back.",
            response:
              "I can explain which medicine changed and how I will follow the new label. Thank you.",
            feedback:
              "Complete. You resolved the defect, labelled appropriately, counselled, and confirmed understanding.",
            deltas: { rapport: 2, safety: 2, reasoning: 2 },
            correct: true,
          },
          {
            id: "label-only",
            label: "Print the label and hand over the medicine without discussion.",
            response: "I still don’t understand what changed.",
            feedback:
              "A compliant label does not replace patient counselling and confirmation of understanding.",
            deltas: { rapport: -1, safety: -1, reasoning: 0 },
          },
          {
            id: "verbal-only",
            label: "Explain the change but omit the dispensing label to save time.",
            response: "How will I know the directions when I get home?",
            feedback:
              "Verbal counselling cannot replace required dispensing particulars on the label.",
            deltas: { rapport: 0, safety: -2, reasoning: -1 },
            critical: true,
          },
        ],
      },
    ],
  },
];

export const CLINICAL_SOURCES = [
  {
    label: "Singapore Pharmacy Council · Code of Ethics",
    href: "https://www.spc.gov.sg/for-professionals/regulations-guidelines/code-of-ethics/",
  },
  {
    label: "HealthHub · Sore throat",
    href: "https://www.healthhub.sg/health-conditions/sore-throat",
  },
  {
    label: "HealthHub · Paracetamol (oral)",
    href: "https://www.healthhub.sg/medication-devices-and-treatment/medications/paracetamol-oral",
  },
  {
    label: "HealthHub · Consume antibiotics responsibly",
    href: "https://www.healthhub.sg/programmes/use-antibiotics-right",
  },
  {
    label: "Singapore Statutes Online · Therapeutic Products Regulations",
    href: "https://sso.agc.gov.sg/SL/HPA2007-S329-2016",
  },
  {
    label: "Ministry of Health · Getting medical help",
    href: "https://www.moh.gov.sg/seeking-healthcare/getting-medical-help/",
  },
];

export function getTrainingCase(caseId) {
  return (
    TRAINING_CASES.find((trainingCase) => trainingCase.id === caseId) ??
    TRAINING_CASES[0]
  );
}

export function getPhaseProgress(trainingCase, turnIndex) {
  const currentTurn = trainingCase.turns[turnIndex];
  const completedPhases = new Set(
    trainingCase.turns.slice(0, turnIndex).map((turn) => turn.phase),
  );

  return PHASES.map((phase) => ({
    phase,
    status:
      phase === currentTurn?.phase
        ? "active"
        : completedPhases.has(phase)
          ? "complete"
          : "upcoming",
  }));
}

export function calculateOutcome(scores, criticalErrors) {
  const total = scores.rapport + scores.safety + scores.reasoning;

  if (criticalErrors > 0 || scores.safety < 3) {
    return {
      label: "Review required",
      tone: "review",
      summary:
        "A safety-critical decision needs another attempt before this case is complete.",
    };
  }

  if (total >= 18) {
    return {
      label: "Practice ready",
      tone: "excellent",
      summary:
        "You combined rapport, clinical reasoning, and a clear safety net throughout the encounter.",
    };
  }

  return {
    label: "Case complete",
    tone: "complete",
    summary:
      "The patient reached a safe outcome. Replaying can strengthen consistency and communication.",
  };
}
