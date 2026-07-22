import { cn } from "@/lib/utils";

type OrbitBackdropProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function OrbitBackdrop({ className, tone = "light" }: OrbitBackdropProps) {
  const isDark = tone === "dark";

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className={cn(
          "ss-orbital-ring -right-28 top-8 h-[19rem] w-[37rem] rotate-[-19deg]",
          isDark ? "border-[#d1a467]/35" : "border-[#c99d62]/35"
        )}
      />
      <div
        className={cn(
          "ss-orbital-ring -right-24 top-20 h-[13rem] w-[28rem] rotate-[-19deg]",
          isDark ? "border-white/15" : "border-[#171b39]/10"
        )}
      />
      <div
        className={cn(
          "ss-orbital-ring -bottom-28 -left-28 h-[26rem] w-[38rem] rotate-[29deg]",
          isDark ? "border-white/10" : "border-[#50416f]/12"
        )}
      />
      <div className={cn("absolute right-[16%] top-[17%] h-2 w-2 rounded-full", isDark ? "bg-[#d1a467]" : "bg-[#c99d62]")} />
      <div className={cn("absolute bottom-[22%] right-[7%] h-1.5 w-1.5 rounded-full", isDark ? "bg-white/70" : "bg-[#50416f]/50")} />
    </div>
  );
}
