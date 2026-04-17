'use client';

import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { X, User } from 'lucide-react';
import type { UserRole } from '../../lib/storage';
import { getUserRole } from '../../lib/storage';
import { RoleSelectionModal } from '../common/RoleSelectionModal';

interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileDrawer: React.FC<EditProfileDrawerProps> = ({ isOpen, onClose }) => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => getUserRole());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 'var(--z-overlay)' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-xl transform transition-transform animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8" style={{ zIndex: 'var(--z-modal)' }}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-main)] m-0">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-[var(--color-background)] text-[var(--color-text-secondary)] transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Avatar Presets Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-3">
              Choose Avatar
            </label>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-16 h-16 rounded-full cursor-pointer snap-center shrink-0 border-2 ${i === 1 ? 'border-[var(--color-primary)]' : 'border-transparent'}`}>
                  <LazyLoadImage
                    src={`https://p.sda1.dev/32/b4ea84ad54daf342c6979fafe2e2f544/profile.png`}
                    alt={`Avatar option ${i}`}
                    className="w-full h-full rounded-full object-cover"
                    effect="blur"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-2" htmlFor="nickname">
              Nickname
            </label>
            <input 
              id="nickname"
              type="text" 
              defaultValue="silly bird"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all bg-[var(--color-background)]"
            />
          </div>

          {/* Role Changer */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-2">
              Campus Persona
            </label>
            <button
              onClick={() => setRoleModalOpen(true)}
              className="w-full flex items-center justify-between border rounded-lg px-4 py-3 text-[var(--color-text-main)] bg-[var(--role-card-bg)] border-[var(--role-card-border)] hover:border-[var(--role-card-border-active)] hover:bg-[var(--role-card-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <User size={18} className="text-[var(--color-primary)]" />
                <span className="capitalize">{currentRole ? currentRole : 'Select your role'}</span>
              </div>
              <span className="text-sm font-medium text-[var(--color-primary)]">Change</span>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>
      
      <RoleSelectionModal 
        isOpen={roleModalOpen} 
        onClose={(role) => {
          setCurrentRole(role);
          setRoleModalOpen(false);
        }} 
      />
    </div>
  );
};

export default EditProfileDrawer;
