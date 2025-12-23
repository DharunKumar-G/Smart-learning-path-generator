import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsOptions {
  onShowHelp?: () => void;
}

export const useKeyboardShortcuts = ({ onShowHelp }: UseKeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate();
  const lastKey = useRef<string | null>(null);
  const lastKeyTime = useRef<number>(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTime.current;

      // ? - Show keyboard shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        onShowHelp?.();
        return;
      }

      // Two-key shortcuts (g + something)
      if (e.key === 'g') {
        lastKey.current = 'g';
        lastKeyTime.current = now;
        return;
      }

      // Check for second key in sequence (within 1 second)
      if (lastKey.current === 'g' && timeSinceLastKey < 1000) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case 'c':
            e.preventDefault();
            navigate('/create');
            break;
          case 'h':
            e.preventDefault();
            navigate('/');
            break;
        }
        lastKey.current = null;
        return;
      }

      // Reset if timeout passed
      if (timeSinceLastKey > 1000) {
        lastKey.current = null;
      }
    },
    [navigate, onShowHelp]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
