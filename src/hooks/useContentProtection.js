import { useEffect, useRef } from 'react';

/**
 * Custom hook to protect content from copying and screenshots
 * 
 * IMPORTANT LIMITATIONS:
 * - Screenshot protection is NOT fully possible on the web due to browser/OS limitations
 * - Advanced users can bypass most protections using DevTools, browser extensions, or OS-level tools
 * - This provides best-practice deterrents but cannot guarantee 100% protection
 * - The protection is client-side only and can be disabled by determined users
 */
export const useContentProtection = (enabled = true) => {
  const containerRef = useRef(null);
  const devToolsCheckInterval = useRef(null);
  const resizeCheckInterval = useRef(null);
  const devToolsOpen = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Prevent text selection
    const preventSelection = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent context menu (right-click)
    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts
    const preventKeyboardShortcuts = (e) => {
      // Disable Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+S, Ctrl+P, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'a', 'v', 'x', 's', 'p', 'u', 'i'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        e.stopPropagation();
        showWarning('هذا الإجراء غير مسموح');
        return false;
      }

      // Disable F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showWarning('فتح أدوات المطور غير مسموح');
        return false;
      }

      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        showWarning('فتح أدوات المطور غير مسموح');
        return false;
      }

      // Disable Print Screen (partial - only prevents some cases)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        showWarning('التقاط الشاشة غير مسموح');
        return false;
      }
    };

    // Prevent drag
    const preventDrag = (e) => {
      e.preventDefault();
      return false;
    };

    // Show warning message
    const showWarning = (message) => {
      // Create warning element
      const warning = document.createElement('div');
      warning.textContent = message;
      warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ef4444;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.3s ease;
      `;
      document.body.appendChild(warning);

      setTimeout(() => {
        warning.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(warning);
        }, 300);
      }, 2000);
    };

    // Detect DevTools opening (multiple methods)
    const detectDevTools = () => {
      let devtools = false;
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function () {
          devtools = true;
          if (!devToolsOpen.current) {
            devToolsOpen.current = true;
            showWarning('⚠️ تم اكتشاف فتح أدوات المطور. يرجى إغلاقها.');
            // Optionally blur content when DevTools is detected
            if (containerRef.current) {
              containerRef.current.style.filter = 'blur(5px)';
              containerRef.current.style.pointerEvents = 'none';
            }
          }
        }
      });

      // Check periodically - store interval ID for cleanup
      devToolsCheckInterval.current = setInterval(() => {
        devtools = false;
        // Use a more efficient detection method
        // The console.log with %c is used to detect DevTools
        // We wrap it in try-catch and only check if not already detected
        if (!devToolsOpen.current) {
          try {
            // This will trigger the getter if DevTools is open
            // eslint-disable-next-line no-console
            console.log('%c', element);
          } catch (e) {
            // Silently fail if console is not available
          }

          // Check if DevTools was detected
          if (devtools && !devToolsOpen.current) {
            devToolsOpen.current = true;
            showWarning('⚠️ تم اكتشاف فتح أدوات المطور. يرجى إغلاقها.');
            if (containerRef.current) {
              containerRef.current.style.filter = 'blur(5px)';
              containerRef.current.style.pointerEvents = 'none';
            }
          }
        }
      }, 3000); // Increased interval to 3 seconds to reduce spam

      // Detect window resize (DevTools often changes window size)
      let lastWidth = window.innerWidth;
      let lastHeight = window.innerHeight;
      resizeCheckInterval.current = setInterval(() => {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;

        // If window size changed significantly, might be DevTools
        if (Math.abs(currentWidth - lastWidth) > 200 || Math.abs(currentHeight - lastHeight) > 200) {
          if (!devToolsOpen.current) {
            devToolsOpen.current = true;
            showWarning('⚠️ تم اكتشاف تغيير في حجم النافذة. يرجى التأكد من إغلاق أدوات المطور.');
          }
        }
        lastWidth = currentWidth;
        lastHeight = currentHeight;
      }, 1000);
    };

    // Add CSS to prevent selection
    const style = document.createElement('style');
    style.id = 'content-protection-styles';
    style.textContent = `
      /* Prevent text selection */
      .content-protected {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      /* Prevent image dragging */
      .content-protected img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }

      /* Add watermark overlay */
      .content-protected::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 0, 0, 0.02) 10px,
          rgba(0, 0, 0, 0.02) 20px
        );
        pointer-events: none;
        z-index: 1;
      }

      /* Warning animation */
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }

      @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -40%); }
      }
    `;
    document.head.appendChild(style);

    // Apply protection to container
    if (containerRef.current) {
      containerRef.current.classList.add('content-protected');

      // Add event listeners
      containerRef.current.addEventListener('selectstart', preventSelection);
      containerRef.current.addEventListener('contextmenu', preventContextMenu);
      containerRef.current.addEventListener('keydown', preventKeyboardShortcuts);
      containerRef.current.addEventListener('dragstart', preventDrag);
    }

    // Global keyboard shortcuts prevention
    document.addEventListener('keydown', preventKeyboardShortcuts, true);
    document.addEventListener('contextmenu', preventContextMenu, true);
    document.addEventListener('selectstart', preventSelection, true);

    // Detect DevTools
    detectDevTools();

    // Cleanup function
    return () => {
      // Remove event listeners
      if (containerRef.current) {
        containerRef.current.removeEventListener('selectstart', preventSelection);
        containerRef.current.removeEventListener('contextmenu', preventContextMenu);
        containerRef.current.removeEventListener('keydown', preventKeyboardShortcuts);
        containerRef.current.removeEventListener('dragstart', preventDrag);
        containerRef.current.classList.remove('content-protected');
      }

      document.removeEventListener('keydown', preventKeyboardShortcuts, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
      document.removeEventListener('selectstart', preventSelection, true);

      // Remove styles
      const existingStyle = document.getElementById('content-protection-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Clear intervals
      if (devToolsCheckInterval.current) {
        clearInterval(devToolsCheckInterval.current);
        devToolsCheckInterval.current = null;
      }

      if (resizeCheckInterval.current) {
        clearInterval(resizeCheckInterval.current);
        resizeCheckInterval.current = null;
      }

      // Reset DevTools detection
      devToolsOpen.current = false;
      if (containerRef.current) {
        containerRef.current.style.filter = '';
        containerRef.current.style.pointerEvents = '';
      }
    };
  }, [enabled]);

  return containerRef;
};

