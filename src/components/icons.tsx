type P = { size?: number; className?: string; color?: string; width?: number };

const base = (size: number, color: string, width: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className,
});

export const Check = ({ size = 22, color = "currentColor", width = 2.4, className }: P) => (
  <svg {...base(size, color, width, className)}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
export const Arrow = ({ size = 18, color = "currentColor", width = 2.2, className }: P) => (
  <svg {...base(size, color, width, className)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const Search = ({ size = 40, color = "currentColor", width = 1.8, className }: P) => (
  <svg {...base(size, color, width, className)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const Chat = ({ size = 40, color = "currentColor", width = 1.8, className }: P) => (
  <svg {...base(size, color, width, className)}><path d="M4 5h16v11H8l-4 4z" /><path d="M8 9h8M8 12h5" /></svg>
);
export const Star = ({ size = 40, color = "currentColor", width = 1.8, className }: P) => (
  <svg {...base(size, color, width, className)}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></svg>
);
export const Shield = ({ size = 32, color = "currentColor", width = 1.8, className }: P) => (
  <svg {...base(size, color, width, className)}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
);
export const Lock = ({ size = 32, color = "currentColor", width = 1.8, className }: P) => (
  <svg {...base(size, color, width, className)}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
);
export const User = ({ size = 32, color = "currentColor", width = 1.8, className }: P) => (
  <svg {...base(size, color, width, className)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
);
export const Flag = ({ size = 18, color = "currentColor", width = 2, className }: P) => (
  <svg {...base(size, color, width, className)}><path d="M5 21V4h11l-1.5 4L16 12H5" /></svg>
);
