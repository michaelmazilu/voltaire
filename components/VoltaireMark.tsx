import type { SVGProps } from "react";

export function VoltaireMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        d="M32 6C20.4 6 11 15.4 11 27c0 15.5 21 31 21 31s21-15.5 21-31C53 15.4 43.6 6 32 6Z"
        fill="currentColor"
      />
      <path d="M21 25h22M21 32h16M21 39h10" stroke="#F7F5F3" strokeWidth="4" strokeLinecap="round" />
      <circle cx="43" cy="39" r="5" fill="#F7F5F3" />
    </svg>
  );
}
