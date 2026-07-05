"use client";

import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const LIST_COMPONENTS = {
  ul: motion.ul,
  div: motion.div,
  tbody: motion.tbody,
};

export function StaggerList({
  children,
  className,
  as = "ul",
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof LIST_COMPONENTS;
}) {
  const Component = LIST_COMPONENTS[as];
  return (
    <Component className={className} variants={containerVariants} initial="hidden" animate="show">
      {children}
    </Component>
  );
}

const ITEM_COMPONENTS = {
  li: motion.li,
  div: motion.div,
  tr: motion.tr,
};

export function StaggerItem({
  children,
  className,
  hover = true,
  as = "li",
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: keyof typeof ITEM_COMPONENTS;
}) {
  const Component = ITEM_COMPONENTS[as];
  return (
    <Component
      variants={itemVariants}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={className}
    >
      {children}
    </Component>
  );
}
