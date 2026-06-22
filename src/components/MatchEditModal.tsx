'use client';

import { type ReactNode, useRef } from 'react';

type MatchEditModalProps = {
  children: ReactNode;
  title: string;
};

export function MatchEditModal({ children, title }: MatchEditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button className="button match-edit-toggle" type="button" onClick={openModal}>
        Editar
      </button>
      <dialog
        ref={dialogRef}
        className="match-modal"
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div className="match-modal-panel">
          <div className="match-modal-header">
            <div>
              <span className="bet-section-label">Gerenciar jogo</span>
              <h2>{title}</h2>
            </div>
            <button className="button match-modal-close" type="button" onClick={closeModal} aria-label="Fechar modal">
              x
            </button>
          </div>
          <div className="match-modal-body">{children}</div>
          <div className="match-modal-secondary-actions">
            <button className="button" type="button" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
