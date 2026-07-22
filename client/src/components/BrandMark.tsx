import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  inverse?: boolean;
};

export function BrandMark({ compact = false, className, inverse = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "relative grid h-9 w-9 shrink-0 place-items-center overflow-visible rounded-[0.9rem]",
          inverse ? "bg-[#fbfaf4]" : "bg-[#171b39]"
        )}
      >
        <span className={cn("h-3.5 w-3.5 rounded-full", inverse ? "bg-[#171b39]" : "bg-[#d1a467]")} />
        <span
          className={cn(
            "absolute h-4.5 w-9 rotate-[-18deg] rounded-[100%] border",
            inverse ? "border-[#171b39]/60" : "border-[#d1a467]/80"
          )}
        />
      </span>
      {!compact ? (
        <span className={cn("font-semibold tracking-[-0.04em]", inverse ? "text-[#fbfaf4]" : "text-[#171b39]")}>
          Simply Saturn
        </span>
      ) : null}
    </div>
  );
}
