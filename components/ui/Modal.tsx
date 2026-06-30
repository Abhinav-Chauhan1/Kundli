'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-app mx-auto rounded-t-2xl md:rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50 fixed bottom-0 md:m-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex items-center justify-between p-4 border-b border-navy/10">
        {title && <h2 className="font-semibold text-navy font-display">{title}</h2>}
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-navy/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-navy/60" />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
