const paths: Record<string, React.ReactNode> = {
  markdown: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15v-6l2.5 3L12 9v6M16 9v6m0 0-2-2m2 2 2-2" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14" />,
  math: <path d="M5 4h14L11 12l8 8H5l6-8Z" />,
  plots: <path d="M4 20V4m0 16h16M8 16v-5m4 5V8m4 8v-3" />,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
};

/* Stroke icons drawn on a 24-unit grid, coloured by the surrounding text. */
export function Icon({ name, size = 24 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
