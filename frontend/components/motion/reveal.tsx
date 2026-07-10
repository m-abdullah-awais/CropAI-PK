"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import {
  fadeUp,
  inViewOnce,
  staggerContainer,
  staggerItem,
} from "./motion-presets";

// Single element that fades/rises into view once. Reduced motion is handled globally
// by <MotionConfig reducedMotion="user"> so these resolve to instant + static.
export function Reveal({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Container that reveals its <StaggerItem> children in sequence.
export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

// Plays immediately on mount (for content that appears after an action, e.g. results).
export function MountReveal({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" {...props}>
      {children}
    </motion.div>
  );
}
