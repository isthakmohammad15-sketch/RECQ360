import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ModalPortalProps {
  children: React.ReactNode;
  lockScroll?: boolean;
}

let activeModalsCount = 0;

/**
 * Universal Modal Portal
 * 
 * Renders any modal, popup, dialog, drawer, confirmation, or full-screen overlay
 * into #modal-root directly under <body>, completely outside the application root tree.
 * 
 * This guarantees:
 * 1. Modals cannot be trapped by any parent CSS transforms, filters, overflow, or containment.
 * 2. Modals and their backdrops appear ABOVE the entire application (including fixed/sticky
 *    left sidebar, top header, maps, cards, and tables).
 * 3. Body scroll locking is handled automatically and safely.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children, lockScroll = true }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!lockScroll || typeof document === 'undefined') {
      return;
    }

    activeModalsCount++;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      activeModalsCount = Math.max(0, activeModalsCount - 1);
      if (activeModalsCount === 0) {
        document.body.style.overflow = originalOverflow || '';
      }
    };
  }, [lockScroll]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const container = document.getElementById('modal-root') || document.body;
  return createPortal(children, container);
};
