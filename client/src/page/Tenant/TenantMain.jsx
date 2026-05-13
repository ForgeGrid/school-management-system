import React from "react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function TenantMain() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      
      {/* Full screen background */}
      <DottedGlowBackground
        className="absolute inset-0 w-full h-full pointer-events-none"
        opacity={1}
        gap={10}
        radius={1.6}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-sky-800"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1}
      />

      {/* main */}
      <div className="relative z-10 flex flex-col items-center gap-6">
       
      </div>

    </div>
  );
}