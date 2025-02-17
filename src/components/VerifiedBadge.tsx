"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  tooltipContent?: string;
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 20,
  xl: 24
};

export default function VerifiedBadge({
  className,
  size = 'md',
  showTooltip = true,
  tooltipContent = "Verified Account"
}: VerifiedBadgeProps) {
  const [showText, setShowText] = useState(false);
  const badgeSize = sizeMap[size];

  const handleClick = useCallback(() => {
    setShowText(true);
    setTimeout(() => {
      setShowText(false);
    }, 3000);
  }, []);

  return (
    <div className="relative inline-flex items-center"> {/* Changed to inline-flex and items-center */}
      <div 
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center",
          "transition-all duration-200 ease-in-out",
          "hover:scale-110 cursor-pointer",
          className
        )}
      >
        <Image
          src="/verified-badge.svg"
          alt="Verified Badge"
          width={badgeSize}
          height={badgeSize}
          className="translate-y-[-1px]" // Adjusted to move slightly up
        />
      </div>
      
      {/* Text overlay that appears/disappears */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
          "px-2 py-1 rounded bg-black/80 text-white text-xs",
          "transition-all duration-300 z-50",
          showText 
            ? "opacity-100 -top-8 visible" 
            : "opacity-0 top-0 invisible"
        )}
      >
        Leader&apos;s Badge
      </div>
    </div>
  );
}