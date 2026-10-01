/* El llapis i el traç secret: compartits pel peu (easter egg) i per la portada. */

/** Traç a mà del peu (viewBox 0 0 34 14). Acaba a (32.5, 4). */
export const SIGN_PATH = "M1.5 10.5 C 5 3, 8.5 2.5, 10.5 7 S 15 12.5, 18.5 6 S 24.5 1.5, 26.5 6.5 S 30.5 10, 32.5 4";
export const SIGN_VIEWBOX = { w: 34, h: 14, endX: 32.5, endY: 4 };

/** Punta del llapis dins del glif de 28×28 */
export const PENCIL_TIP = { x: 3, y: 25 };

const PENCIL_MARKUP =
  `<path d='M3 25 L5 18 L19 4 L24 9 L10 23 Z' fill='white' stroke='black' stroke-width='1.3' stroke-linejoin='round'/>` +
  `<path d='M5 18 L10 23' stroke='black' stroke-width='1.3'/>` +
  `<path d='M3 25 L4.2 21 L7 23.8 Z' fill='black'/>`;

export const PENCIL_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'>${PENCIL_MARKUP}</svg>`,
)}") ${PENCIL_TIP.x} ${PENCIL_TIP.y}, crosshair`;

export function PencilGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M3 25 L5 18 L19 4 L24 9 L10 23 Z" fill="white" stroke="black" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 18 L10 23" stroke="black" strokeWidth="1.3" />
      <path d="M3 25 L4.2 21 L7 23.8 Z" fill="black" />
    </svg>
  );
}
