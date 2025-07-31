
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
  const [activeBuildingId, _setActiveBuildingId] = useState<string>('');

  const setActiveBuildingId = useCallback((id: string) => {
    _setActiveBuildingId(id);
  }, []);
  
  useEffect(() => {
    if (initialBuildings.length > 0 && !initialBuildings.some(b => b.id === activeBuildingId)) {
      setActiveBuildingId(initialBuildings[0].id);
    }
  }, [initialBuildings, activeBuildingId, setActiveBuildingId]);
  
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
