"use client"
import { useEffect, useState } from "react";

export default function useTheme() {
  const getCurrent = () => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') || (localStorage.getItem('theme') || 'light');
  };

  const [theme, setTheme] = useState<string>(getCurrent());

  useEffect(() => {
    // Listen to storage events (cross-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setTheme((e.newValue as string) || 'light');
      }
    };

    window.addEventListener('storage', onStorage);

    // Observe attribute changes on <html> to catch same-window changes from ThemeSelector
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme') || (localStorage.getItem('theme') || 'light');
      setTheme(t);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // in case theme changed before hook mounted
    const t0 = getCurrent();
    setTheme(t0);

    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  return theme;
}
