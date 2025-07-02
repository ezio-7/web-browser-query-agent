import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      shortcuts.forEach(({ key, ctrlKey = false, callback, preventDefault = true }) => {
        if (
          event.key === key &&
          event.ctrlKey === ctrlKey &&
          !event.target.matches('input, textarea')
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}