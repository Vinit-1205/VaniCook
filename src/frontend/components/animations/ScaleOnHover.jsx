import React from 'react';
import { motion } from 'framer-motion';

export const ScaleOnHover = ({
  children,
  scale = 1.02,
  tapScale = 0.98,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

