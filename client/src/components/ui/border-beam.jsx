import { cn } from "@/lib/utils";

export const BorderBeam = ({
  className,
  size = 150,
  duration = 4, 
  borderWidth = 2,
  colorFrom = "#6366f1",
  colorTo = "#a855f7",
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={{
        // Use a mask to only show the inner perimeter exactly at the border width
        padding: `${borderWidth}px`,
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    >
      {/* The glowing beam that travels along the path */}
      <div
        style={{
          position: "absolute",
          width: `${size}px`,
          aspectRatio: "1",
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          // offset-path defines the rectangle to travel around
          offsetPath: "rect(0 auto auto 0 round 16px)", // Matches OtpModal's rounded-2xl
          // offset-anchor helps center the element on the path
          offsetAnchor: "100% 50%", 
          animation: `beam-path ${duration}s infinite linear`,
        }}
      />

      <style>{`
        @keyframes beam-path {
          0% {
            offset-distance: 0%;
          }
          100% {
            offset-distance: 100%;
          }
        }
      `}</style>
    </div>
  );
};
