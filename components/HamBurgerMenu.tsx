"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  // Close drawer automatically on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    {
      name: t.navHome ?? "Home",
      href: "/home",
      icon: (
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
        </svg>
      ),
    },
    {
      name: t.navHistory ?? "History",
      href: "/history",
      icon: (
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      name: t.navReport ?? "Report",
      href: "/report",
      icon: (
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: t.navSettings ?? "Settings",
      href: "/setting",
      icon: (
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Trigger Button (Visible only on Tablet & Desktop) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E4DCD0] hover:bg-[#EAE4D8] text-brand-text transition-all active:scale-95 cursor-pointer shadow-xs"
      >
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Slide-out Drawer & Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dimmed Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Side Drawer Panel */}
          <aside className="relative w-80 max-w-[85vw] bg-[#EDE7DC] h-full flex flex-col justify-between p-6 shadow-2xl z-10 border-l border-[#E4DCD0] animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E4DCD0]">
                <div>
                  <h3 className="text-base font-bold text-brand-text">
                    {t.appName ?? "እናት ጤና"}
                  </h3>
                  <p className="text-[11px] text-brand-subtle">
                    {t.appSub ?? "ENAT TENA"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-brand-text flex items-center justify-center hover:bg-[#E2DBD0] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="py-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-brand-green text-white shadow-xs"
                          : "text-brand-text hover:bg-[#E2DBD0]"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-brand-subtle"}>
                        {link.icon}
                      </span>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer / Logout */}
            <div className="pt-4 border-t border-[#E4DCD0]">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-text font-bold text-xs transition-all"
              >
                <span>{t.logOut ?? "Log Out"}</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}