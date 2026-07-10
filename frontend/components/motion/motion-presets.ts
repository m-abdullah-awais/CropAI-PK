import type { Transition, Variants } from "motion/react";

// Premium easing: a soft ease-out that feels expensive without being bouncy.
export const easeOut: Transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };
export const softSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.9,
};

const viewport = { once: true, margin: "-10% 0px" } as const;
export const inViewOnce = viewport;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
};

// Shared hover/tap feedback for interactive surfaces (transform-only).
export const cardHover = { y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } };
export const tapScale = { scale: 0.97 };
