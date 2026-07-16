import { motion } from "motion/react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function TypewriterText({ text, speed = 10, className = "" }: TypewriterTextProps) {
  // Split text into characters to allow precise framer-motion stagger
  const characters = Array.from(text);

  // Dynamic stagger duration - smaller values mean a snappier terminal printout
  const staggerDuration = speed ? speed / 1000 : 0.012;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDuration,
      },
    },
  };

  const charVariants = {
    hidden: { 
      opacity: 0,
      y: 1,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.span
      key={text} // Re-trigger animation when text changes!
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${className} inline`}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          className="inline"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
