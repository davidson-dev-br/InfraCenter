"use client";

import * as React from "react";
import { ChevronsUpDown, Building, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PlacedItem } from "@/lib/types";

export const datacenters = [
  { value: "dc1", label: "US-East-1" },
  { value: "dc2", label: "EU-West-2" },
  { value: "dc3", label: "AP-South-1" },
];

export type DatacenterOption = typeof datacenters[number];

const initialItemsByDatacenter: Record<string, PlacedItem[]> = {
    'dc1': [
        { id: 'rack-3', name: 'Rack-3', type: 'Server Rack', icon: Server, x: 1, y: 0, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'A', observations: 'Rack principal.', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
        { id: 'rack-2', name: 'Rack-02', type: 'Server Rack', icon: Server, x: 7, y: 2, status: 'Ativo', width: 0.6, length: 1.2, sizeU: 42, row: 'B', observations: '', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
        { id: 'rack-0', name: 'Rack-00', type: 'rack', icon: Server, x: 8, y: 2, status: 'Manutenção', width: 0.8, length: 0.8, sizeU: 48, row: 'B', observations: 'Verificar fonte de energia.', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '06/07/2025' },
        { id: 'qdf-1', name: 'QDF-1', type: 'qdf', icon: Server, x: 5, y: 5, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'F', observations: '', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '05/07/2025' },
    ],
    'dc2': [
        { id: 'rack-eu-1', name: 'EU Rack 1', type: 'Server Rack', icon: Server, x: 3, y: 4, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'C', observations: '', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
    ],
    'dc3': [],
}


// --- Context for sharing dashboard state ---
interface DatacenterContextType {
    selectedDatacenter: DatacenterOption;
    setSelectedDatacenter: (datacenter: DatacenterOption) => void;
    itemsByDatacenter: Record<string, PlacedItem[]>;
    updateItemsForDatacenter: (dcId: string, items: PlacedItem[]) => void;
    approveItem: (itemId: string) => void;
}

const DatacenterContext = React.createContext<DatacenterContextType | undefined>(undefined);

export function DatacenterProvider({ children }: { children: React.ReactNode }) {
    const [selectedDatacenter, setSelectedDatacenter] = React.useState<DatacenterOption>(datacenters[0]);
    const [itemsByDatacenter, setItemsByDatacenter] = React.useState<Record<string, PlacedItem[]>>(initialItemsByDatacenter);

    const updateItemsForDatacenter = (dcId: string, items: PlacedItem[]) => {
        setItemsByDatacenter(prev => ({ ...prev, [dcId]: items }));
    };

    const approveItem = (itemId: string) => {
        setItemsByDatacenter(prev => {
            const newItemsByDc = { ...prev };
            for (const dcId in newItemsByDc) {
                newItemsByDc[dcId] = newItemsByDc[dcId].map(item =>
                    item.id === itemId ? { ...item, awaitingApproval: false } : item
                );
            }
            return newItemsByDc;
        });
    };

    return (
        <DatacenterContext.Provider value={{ selectedDatacenter, setSelectedDatacenter, itemsByDatacenter, updateItemsForDatacenter, approveItem }}>
            {children}
        </DatacenterContext.Provider>
    );
}

export function useDatacenter() {
    const context = React.useContext(DatacenterContext);
    if (context === undefined) {
        throw new Error('useDatacenter must be used within a DatacenterProvider');
    }
    return context;
}
// --- End Context ---

type DatacenterSwitcherProps = {
  selected: DatacenterOption;
  onSelectedChange: (selected: DatacenterOption) => void;
}

export function DatacenterSwitcher({ selected, onSelectedChange }: DatacenterSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[200px]"
        >
          <Building className="w-4 h-4 mr-2" />
          {selected.label}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search datacenter..." />
            <CommandEmpty>No datacenter found.</CommandEmpty>
            <CommandGroup>
              {datacenters.map((dc) => (
                <CommandItem
                  key={dc.value}
                  onSelect={() => {
                    onSelectedChange(dc);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Building className="w-4 h-4 mr-2" />
                  {dc.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
