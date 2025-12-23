"use client";

import { motion } from "framer-motion";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="relative w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        <div className="absolute inset-0 shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Title skeleton */}
        <div className="space-y-2 min-h-[3rem]">
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        </div>

        {/* Price skeleton */}
        <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-1/2 overflow-hidden">
          <div className="h-full w-full shimmer" />
        </div>

        {/* Stats skeleton */}
        <div className="flex gap-4">
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-20 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        </div>

        {/* Condition skeleton */}
        <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-md w-20 overflow-hidden">
          <div className="h-full w-full shimmer" />
        </div>

        {/* Button skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
          <div className="h-10 w-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

