/* Custom events for the self-hosted Plausible loaded in the root layout. Props carry only
   which tool and which format — never file names or notebook contents (see /privacy). */

type Props = Record<string, string>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

export function track(event: string, props?: Props) {
  window.plausible?.(event, props ? { props } : undefined);
}
