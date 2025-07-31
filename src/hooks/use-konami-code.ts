
"use client";

import { useState, useEffect, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

export const useKonamiCode = (): boolean => {
  const [konami, setKonami] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const newSequence = [...sequence, e.key];

    // Se a sequência não corresponde, reinicie, mas mantenha a tecla atual
    // como o início de uma nova sequência potencial.
    if (KONAMI_CODE[newSequence.length - 1] !== e.key) {
      setSequence([e.key]);
      return;
    }

    setSequence(newSequence);

    // Se a sequência corresponder completamente
    if (newSequence.join('') === KONAMI_CODE.join('')) {
      setKonami(prevKonami => !prevKonami); // Alterna o estado
      setSequence([]); // Reinicia a sequência para poder ser usada novamente
    }
  }, [sequence]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return konami;
};
