
"use client";

import React, { createContext, useState, ReactNode, useContext, useEffect, useCallback } from 'react';

interface Building {
  id: string;
  name: string;
}

interface BuildingContextType {
  buildings: Building[];
  activeBuildingId: string;
  setActiveBuildingId: (id: string) => void;
}

export const BuildingContext = createContext<BuildingContextType>({
    buildings: [],
    activeBuildingId: '',
    setActiveBuildingId: () => {},
});

export const BuildingProvider = ({ children, initialBuildings }: { children: ReactNode, initialBuildings: Building[] }) => {
  const [activeBuildingId, _setActiveBuildingId] = useState<string>(initialBuildings[0]?.id || '');

  const setActiveBuildingId = useCallback((id: string) => {
    _setActiveBuildingId(id);
  }, []);
  
  useEffect(() => {
    // Se a lista de prédios mudar e o prédio ativo não estiver mais na lista,
    // define o primeiro prédio da nova lista como ativo.
    if (initialBuildings.length > 0 && !initialBuildings.some(b => b.id === activeBuildingId)) {
      _setActiveBuildingId(initialBuildings[0].id);
    } else if (initialBuildings.length === 0) {
      // Se não houver prédios, limpa o ID ativo.
      _setActiveBuildingId('');
    }
  }, [initialBuildings]); // Executa apenas quando a lista de prédios mudar.
  
  const value = {
    buildings: initialBuildings,
    activeBuildingId,
    setActiveBuildingId,
  };

  return (
    <BuildingContext.Provider value={value}>
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => {
    const context = useContext(BuildingContext);
    if (context === undefined) {
        throw new Error('useBuilding must be used within a BuildingProvider');
    }
    return context;
};
