# PharmaCity

PharmaCity is a browser-based 3D training simulator for community-pharmacy professionals in Singapore. Players move through a fully modelled pharmacy, approach life-like patients, gather clinical information through branching conversations, make safety-critical decisions, and receive structured competency feedback.

## At a glance

![Context view of the pharmacist approaching Daniel inside the fully modelled 3D pharmacy](docs/screenshots/fever-sore-throat.png)

The simulator uses an elevated, over-the-shoulder perspective with a restrained coaching interface. The current objective, **Explore → Assess → Plan** progression, patient proximity, and live Rapport, Safety, and Reasoning signals remain visible while the player moves through the environment.

## What is playable

- Explore a complete real-time 3D pharmacy with a tiled floor, architectural shell, ceiling lights, stocked timber shelving, dispensary cabinets, consultation equipment, glazing, and a Singapore streetscape beyond the storefront.
- Move with the keyboard, click-to-walk, touch controls, or the contextual auto-walk action.
- Shift between Guided, Patient, and Context camera angles without leaving the simulation.
- Approach patients naturally and start conversations only when they are within consultation range.
- Watch the pharmacist and patients idle, walk, breathe, speak, and react as the consultation develops.
- Hear gender-appropriate patient voices and a consistent pharmacist voice through browser speech synthesis.
- Choose from scored responses or ask a deterministic free-text question without sending data to an external service.
- Identify red flags, reconcile medicines, validate prescriptions, communicate recommendations, and receive an end-of-case debrief.

## Scenario gallery

| Demanding customer | Prescription supply |
| --- | --- |
| ![Mei Lin waiting at the consultation counter in the strongest-antibiotic case](docs/screenshots/antibiotic-request.png) | ![Mr Raj presenting an unsigned prescription at the consultation counter](docs/screenshots/unsigned-prescription.png) |
| De-escalate an inappropriate antibiotic request while gathering the clinical story and preventing duplicate-ingredient use. | Validate an incomplete prescription, reconcile medicines, clarify the omission, and counsel with teach-back. |

## Playable cases

- **Fever and sore throat** — triage, red-flag screening, medication reconciliation, referral, self-care, and safety-netting.
- **The strongest antibiotic** — de-escalation, appropriate antibiotic counselling, duplicate-ingredient prevention, and symptom relief.
- **The unsigned prescription** — identity checks, prescription validation, clarification, labelling, counselling, and teach-back.

Cases can be changed from the in-game library without leaving the simulation.

## Controls

| Action | Keyboard and mouse | Touch or interface |
| --- | --- | --- |
| Move | `WASD` or arrow keys | On-screen movement pad |
| Brisk walk | Hold `Shift` | — |
| Walk to a point | Click the pharmacy floor | Tap the pharmacy floor |
| Approach patient | Contextual auto-walk button | Contextual auto-walk button |
| Start conversation | `E` when the patient is in range | Start button |
| Change camera | `V` | Camera button |
| Choose a response | `1`–`3` or click | Tap a response |
| Continue after feedback | `Enter` | Continue button |
| Step away | `Esc` | Close conversation button |

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Production and scenario checks:

```powershell
npm.cmd test
npm.cmd run build
```

## Stack

- React and Vite
- Three.js through React Three Fiber and Drei
- Phosphor icons
- Local Manrope and DM Serif Display fonts
- Project-bound generated character assets
- Procedural 3D environment geometry with instanced pharmacy stock and an optimized oak material

## Clinical-use boundary

This is an educational prototype, not clinical decision support. The cases use fictional patients and masked identifiers. Before training deployment, all clinical, legal, medicine-classification, and workflow content must be reviewed and signed off by a Singapore-registered pharmacist. Real product classifications must be checked against current Health Sciences Authority records.

The in-game Evidence drawer links to the Singapore Pharmacy Council Code of Ethics, HealthHub guidance, Singapore therapeutic-product regulations, and Ministry of Health emergency-care guidance.
