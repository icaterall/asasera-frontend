# Optional classroom random wheel

The teacher chooses when to use an animated wheel. It is available in live class controls and as a teacher tool with a custom list of names, topics or questions. It defaults to no repeated selections; resetting picks starts a new round. In a live class, the server selects from connected participants and sends one immutable spin to teacher, students and projector. It never changes assessment or game scores.

The focal moment is one wheel rotation, accelerating into several turns and decelerating to a fixed pointer over 4.8 seconds. Controls acknowledge the request immediately and prevent overlapping spins. The winning label is announced and shown in full after the spin; the frozen draw survives reconnect. Only the SVG rotor moves, with no continuous effects or added animation dependencies. Paused/reduced motion uses a stationary result while preserving the selection and feedback. The wheel uses Asasera Blue, the existing bright quiz palette, bilingual labels, visible focus and a plain editable list.

## Superseding reference direction — 2026-09-15

Latest owner correction: the exit slides to the physical **right**, then fades out. This supersedes the leftward exit described in the earlier refinement below; timing, zoom, pointer position and reduced-motion behavior are unchanged.

Source: `/Users/ashrafqahman/Downloads/WhatsApp Video 2026-09-15 at 08.07.43 (1).mp4` (45.625 seconds). Frames across the entire clip and a denser opening sequence were inspected. Match its quiet background, blue/burgundy/orange slices, small white hub, left pointer, eased rotation, winner zoom and replacement of the wheel with the question. Preserve theme tokens, 5px control corners, responsive layouts, accessibility and server-authoritative outcomes rather than copying the video's fixed recording dimensions.

The shared 4.8-second sequence contains rotation, an 850ms camera zoom, then a 700ms exit: slide to the physical left first, then gradually fade out before the result replaces the wheel (owner refinement, 15 September). This direction stays left in Arabic as well as English. `WheelPlayback` is reused by the instructor tool, class wheel and question-wheel learner presentation. A visual -90-degree offset relocates the pointer without changing selection mathematics. The live scored presentation retains the explicit Begin action so the answer timer does not run during animation. Fullscreen must include the subsequent question, not just the wheel controls. Students-only, questions-only and paired student/question modes reuse existing server settings.

One 80ms click was extracted from the user-provided soundtrack and scheduled against actual rotor progress. Hidden tabs do not accumulate delayed ticks; mute, reduced motion and disposal stop playback. The environment cannot provide auditory perception: source waveform and spectrogram were reviewed, but exact perceived soundtrack parity is NOT certified. Do not describe this as a sample-perfect recreation of the entire video.

Browser verification is now available through the project's Playwright workflow. Earlier browser-blocked notes above are historical, not a current blocker. Evidence and reproducible commands: `/Users/ashrafqahman/MyWork/ReactAsas/Web-App/docs/evidence/interactive/wheel-video-reference-2026-09-15.md`.
