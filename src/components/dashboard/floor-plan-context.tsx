"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Server, LucideIcon } from 'lucide-react';

export type Equipment = {
  name: string;
  icon: LucideIcon;
};

type FloorPlanContextType = {
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
};

const FloorPlanContext = createContext<FloorPlanContextType | undefined>(undefined);

export const FloorPlanProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  return (
    <FloorPlanContext.Provider value={{ selectedEquipment, setSelectedEquipment }}>
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => {
  const context = useContext(FloorPlanContext);
  if (context === undefined) {
    throw new Error('useFloorPlan must be used within a FloorPlanProvider');
  }
  return context;
};
