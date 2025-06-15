import { AnimatePresence } from "framer-motion";

// Basic fade animation that transitions opacity from 0 to 1
// Useful for simple fade-in/fade-out effects on any element
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Slide up animation that combines vertical movement with fade
// Elements will slide up from 50px below while fading in
export const slideUp = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 50, opacity: 0 }
};

// Scale animation that combines size change with fade
// Elements will grow from 90% to 100% size while fading in
export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

// Page transition configuration for smooth page changes
// Uses tween animation with anticipate easing for natural feel
export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// Stagger effect configuration for animating multiple children
// Each child element will animate with a 0.1s delay after the previous
export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Form field animation that slides in from left and fades
// Useful for form elements appearing in sequence
export const formFieldVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

// Button interaction animations for hover and click states
// Provides subtle scale feedback for better user interaction
export const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};
