"use client";

import { motion } from "framer-motion";
import { useFormStatus } from "react-dom";

const VARIANT_STYLES: Record<"primary" | "success" | "danger", string> = {
  primary: "bg-slate-900 hover:bg-slate-700",
  success: "bg-emerald-600 hover:bg-emerald-700",
  danger: "bg-red-600 hover:bg-red-700",
};

const SIZE_STYLES: Record<"xs" | "sm" | "md", string> = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
  className = "",
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "success" | "danger";
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={pending ? undefined : { scale: 1.03 }}
      whileTap={pending ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`rounded-md font-medium text-white transition-colors disabled:opacity-50 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
    >
      {pending ? (pendingLabel ?? label) : label}
    </motion.button>
  );
}
