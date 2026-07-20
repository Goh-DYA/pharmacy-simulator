# Design QA

## Final comparison target

- Source visual truth: `design-reference/option-2-guided-practice.png`
- Final desktop implementation: `design-reference/implementation-1440x1024.png`
- Desktop viewport and state: 1440 x 1024, Daniel, first Explore turn, no drawer or modal open
- Final full-view comparison: `design-reference/comparison-pass-3.png`
- Final dialogue comparison: `design-reference/comparison-dialogue-pass-3.png`
- Final phase-rail comparison: `design-reference/comparison-rail-pass-3.png`
- Responsive evidence: `design-reference/implementation-mobile-390x844.png`

## Findings and resolution

### Pass 1

- [P1, fixed] Daniel's opening patient statement was missing because an empty free-text reply masked the scripted opening line. The dialogue now falls through to `turn.patientLine`.
- [P1, fixed] The first WebGL environment was a clean blockout but did not match the selected visual's warm, detailed heartland pharmacy. A generated Singapore pharmacy environment plate is now layered inside the real-time scene with the 3D counter, interactive characters, camera motion, lighting, and foreground depth retained.
- [P2, fixed] The first-turn coaching hierarchy repeated one objective. Scenario data now separates the rail title, "Open the conversation", from the objective, "Check for urgent symptoms".

Evidence: `comparison-pass-1.png`, `comparison-dialogue-pass-1.png`, and `comparison-rail-pass-1.png`.

### Pass 2

- Replaced the blockout background with the final pharmacy plate and retuned counter, ceiling, and sprite integration.
- Confirmed that the opening line, phase title, and objective match the selected design.
- Confirmed the final forest-teal, mint, amber, cream, and coral visual system; editorial serif headings; rounded icon family; and anchored phase/dialogue composition.

Evidence: `comparison-pass-2.png`, `comparison-dialogue-pass-2.png`, and `comparison-rail-pass-2.png`.

### Pass 3

- Increased Daniel's scale and adjusted his placement to restore the source design's strong facial presence while preserving a reusable full-body NPC layer.
- Rechecked the full view and both focused fidelity surfaces side by side.
- No actionable P0, P1, or P2 fidelity issue remains.

Evidence: `comparison-pass-3.png`, `comparison-dialogue-pass-3.png`, and `comparison-rail-pass-3.png`.

## Required fidelity surfaces

- Fonts and typography: DM Serif Display and Manrope reproduce the source's editorial phase/patient headings and clean humanist interface. Hierarchy, weights, and line lengths are consistent at desktop and mobile sizes.
- Spacing and layout rhythm: the phase rail, objective, competency panel, and dialogue panel retain the same corner anchors and proportions as the source. The compact top toolbar and third response branch are intentional functional additions for case navigation, evidence access, and scored decision-making.
- Colors and visual tokens: forest teal, mint, amber, cream, and coral closely map to the reference with accessible foreground contrast. Feedback and review states add restrained semantic colors required by the working game.
- Image quality and asset fidelity: three patients, the pharmacist, and the pharmacy environment are project-bound generated raster assets. Characters use validated transparent edges; no placeholder avatars, emoji, handcrafted SVG, or CSS illustration substitutes are used.
- Copy and content: the visible opening line and coaching copy match the reference. Each turn has preferred, incomplete, and unsafe branches so the simulator can assess judgment rather than offer a binary quiz.
- Icons: Phosphor supplies one consistent rounded icon family close to the selected mock.
- Intentional pose deviation: the source shows Daniel leaning on the counter, while the implementation uses a reusable standing NPC pose so the same WebGL consultation framing works across three cases. The enlarged final placement preserves comparable visual emphasis.

## Browser verification

- Desktop layout: 1440 x 1024 viewport, document, and body all report 1440 x 1024 with no overflow.
- Mobile layout: 390 x 844 viewport, document, and body all report 390 x 844 with no overflow; response choices remain visible and practical to tap.
- Primary interactions tested: preferred response, feedback state, Continue progression, full five-turn safe path, competency scoring, patient-fact capture, practice-ready debrief, replay/next-case controls, case switching with NPC swap, custom-question input, evidence drawer, sound toggle, and wide-camera toggle.
- Latest interaction check: selecting Daniel's preferred opening question reveals the measured temperature and duration, increments all three competency signals, and exposes the Continue control.
- Accessibility checks: semantic controls, keyboard response shortcuts, visible focus treatment, labelled regions, skip link, and reduced-motion handling are present.
- Browser console errors: none.
- Non-blocking dependency notes: upstream Three.js currently reports deprecation notices for `Clock` and soft shadow-map compatibility.

## Final assessment

The selected option's composition, hierarchy, palette, typography, imagery, and guided-practice tone are faithfully represented. The functional additions are visually restrained and serve the simulator's core training loop. All blocking and medium-priority comparison findings were fixed and rechecked.

final result: passed
