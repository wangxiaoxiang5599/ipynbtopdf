import Image from "next/image";

export function Brand() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <Image src="/logo.svg" alt="" width={36} height={36} />
      <span className="text-[20px] font-semibold tracking-[-0.8px] text-ink">
        ipynb<span className="px-px font-normal text-muted">to</span>pdf
      </span>
    </span>
  );
}
