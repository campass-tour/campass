import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Backpack, GraduationCap, Camera } from 'lucide-react';
import type { UserRole } from '../../lib/storage';
import { setUserRole } from '../../lib/storage';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: (role: UserRole) => void;
}

const roles: { id: UserRole; icon: React.ReactNode; label: string; description: string; color: string }[] = [
  {
    id: 'freshman',
    icon: <Backpack size={32} />,
    label: "The Explorer",
    description: "New here? Get practical tips and campus survival guides.",
    color: "#4CAF50" // Green shade
  },
  {
    id: 'senior',
    icon: <GraduationCap size={32} />,
    label: "The XJTLU Veteran",
    description: "Know your way around? Test your knowledge with trivia.",
    color: "#2196F3" // Blue shade
  },
  {
    id: 'visitor',
    icon: <Camera size={32} />,
    label: "The Guest",
    description: "Here to see the campus vibe? Explore our educational philosophy.",
    color: "#FF8C00" // Orange shade
  }
];

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [portalContainer] = useState<HTMLDivElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.setAttribute('data-role-selection-modal-root', 'true');
    return el;
  });

  const modalRef = useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save active element to restore focus later
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Ensure portal container exists in DOM so we can inert other body children safely.
    if (portalContainer && !document.body.contains(portalContainer)) {
      document.body.appendChild(portalContainer);
    }

    // Lock body scroll
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Lock the rest of the screen (including other portals) until confirm.
    // Use `inert` + pointer-events on all body children except this modal's portal container.
    const disabledBodyChildren: Array<{
      el: HTMLElement;
      prevPointerEvents: string;
      prevAriaHidden: string | null;
      prevInert: boolean;
    }> = [];

    for (const child of Array.from(document.body.children)) {
      if (!portalContainer) continue;
      if (child === portalContainer) continue;
      if (!(child instanceof HTMLElement)) continue;

      disabledBodyChildren.push({
        el: child,
        prevPointerEvents: child.style.pointerEvents,
        prevAriaHidden: child.getAttribute('aria-hidden'),
        prevInert: Boolean((child as any).inert) || child.hasAttribute('inert'),
      });

      child.setAttribute('aria-hidden', 'true');
      (child as any).inert = true;
      child.setAttribute('inert', '');
      child.style.pointerEvents = 'none';
    }

    // Focus management: try confirm button first, then first focusable
    const focusableSelector = 'a[href], area[href], input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const modalEl = modalRef.current;
    const focusable = modalEl ? Array.from(modalEl.querySelectorAll<HTMLElement>(focusableSelector)) : [];
    setTimeout(() => {
      if (confirmButtonRef.current && !confirmButtonRef.current.disabled) {
        confirmButtonRef.current.focus();
      } else if (focusable.length) {
        focusable[0].focus();
      }
    }, 0);

    // Keydown handler: trap Tab and swallow Escape
    const onKeyDown = (e: KeyboardEvent) => {
      if (!modalEl) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = Array.from(modalEl.querySelectorAll<HTMLElement>(focusableSelector));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    // Prevent pointer interactions from reaching background
    const onPointerDown = (ev: PointerEvent) => {
      if (!modalEl) return;
      if (!modalEl.contains(ev.target as Node)) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      // restore body scroll
      document.body.style.overflow = prevBodyOverflow || '';

      // restore disabled body children
      for (const item of disabledBodyChildren) {
        item.el.style.pointerEvents = item.prevPointerEvents;
        if (item.prevAriaHidden === null) item.el.removeAttribute('aria-hidden');
        else item.el.setAttribute('aria-hidden', item.prevAriaHidden);

        if (!item.prevInert) {
          (item.el as any).inert = false;
          item.el.removeAttribute('inert');
        } else {
          (item.el as any).inert = true;
          item.el.setAttribute('inert', '');
        }
      }

      // remove portal container from DOM
      if (portalContainer && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
      // restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [isOpen, portalContainer]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRole) {
      setUserRole(selectedRole);
      onClose(selectedRole);
    }
  };

  const stopEventPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-overlay)' }}
      role="presentation"
      data-role-selection-modal="true"
      onMouseDown={stopEventPropagation}
      onClick={stopEventPropagation}
      onTouchStart={stopEventPropagation}
      onTouchEnd={stopEventPropagation}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onMouseDown={stopEventPropagation}
        onClick={stopEventPropagation}
        onTouchStart={stopEventPropagation}
        onTouchEnd={stopEventPropagation}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-selection-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-[var(--role-modal-bg)] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        style={{ zIndex: 'var(--z-modal)' }}
        onMouseDown={stopEventPropagation}
        onClick={stopEventPropagation}
        onTouchStart={stopEventPropagation}
        onTouchEnd={stopEventPropagation}
      >
        <h2 id="role-selection-title" className="text-2xl font-bold text-center text-[var(--color-text-main)] mb-2">
          Who are you exploring as today?
        </h2>
        <p className="text-center text-[var(--color-text-secondary)] mb-6 text-sm">
          Select your campus persona to customize your experience.
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden bg-[var(--role-card-bg)] ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.02] shadow-md'
                    : 'border-[var(--role-card-border)] hover:border-[var(--role-card-border-active)] hover:bg-[var(--role-card-hover)]'
                }`}
              >
                {/* Background accent for selected */}
                <div 
                  className={`absolute inset-0 opacity-10 transition-opacity duration-300 ${isSelected ? 'block' : 'hidden'}`}
                  style={{ backgroundColor: role.color }}
                />

                <div 
                  className={`flex items-center justify-center w-14 h-14 rounded-full mr-4 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}
                  style={{ backgroundColor: `${role.color}20`, color: role.color }}
                >
                  {role.icon}
                </div>

                <div className="flex-1 z-10">
                  <h3 className="font-bold text-[var(--color-text-main)] text-lg mb-1">{role.label}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-tight">{role.description}</p>
                </div>

                {isSelected && (
                  <div className="absolute right-4 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg animate-in fade-in zoom-in duration-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className={`transition-all duration-300 overflow-hidden ${selectedRole ? 'max-h-16 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={!selectedRole}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Confirm & Start Exploring
          </button>
        </div>
      </div>
    </div>,
    portalContainer || document.body
  );
};
