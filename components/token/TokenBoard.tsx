import React from "react";

interface TokenBoardProps {
  code: string;
  size?: "lg" | "md" | "sm";
  sublabel?: string;
}

const SIZE_CLASSES = {
  lg: "text-[clamp(3.5rem,12vw,6.5rem)]",
  md: "text-4xl",
  sm: "text-2xl",
};

export function TokenBoard({ code, size = "lg", sublabel = "Token" }: TokenBoardProps) {
  return (
    <div className="flap-board scanline rounded-2xl px-6 py-6 sm:px-10 sm:py-8 text-center">
      <p className="flap-label text-[11px] mb-2">{sublabel}</p>
      <p className={`flap-digit font-bold leading-none ${SIZE_CLASSES[size]}`}>{code}</p>
    </div>
  );
}

export function MiniTokenChip({ code }: { code: string }) {
  return (
    <span className="flap-board flap-digit inline-flex items-center rounded-md px-2.5 py-1 text-sm font-bold">
      {code}
    </span>
  );
}
