/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/interactive-motion.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
/** Contract §21 starting tokens. Motion projects a committed outcome; it never awards it. */
export const interactiveMotion={
 // Supplied wheel-video reference: accelerate, coast, decelerate, then zoom
 // into the committed segment. The final 850 ms belongs to the reveal camera.
 duration:{press:80,focus:140,panel:200,flip:260,deal:280,box:300,placement:180,feedback:160,challenge:360,spin:4800,result:240,completion:800},
 easing:{standard:'cubic-bezier(.2,0,0,1)',enter:'cubic-bezier(.16,1,.3,1)',exit:'cubic-bezier(.4,0,1,1)',spin:'cubic-bezier(.2,.05,.16,1)'},
 wheelTurns:4,wheelLeadMs:250,
} as const
