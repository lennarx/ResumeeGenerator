import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/cvs",
    label: "CVs",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        />
      </svg>
    ),
  },
  {
    href: "/nueva",
    label: "Nueva",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
        {active && (
          <>
            <path strokeLinecap="round" d="M12 12v6" />
            <path strokeLinecap="round" d="M9 15h6" />
          </>
        )}
      </svg>
    ),
  },
  {
    href: "/historial",
    label: "Historial",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6"
        aria-hidden={!active}
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
];
