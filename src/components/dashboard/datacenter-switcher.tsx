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

export type DatacenterOption = { value: string; label: string };

const initialDatacentersData: DatacenterOption[] = [
    { value: "dc1", label: "Data Center" },
    { value: "dc2", label: "Sala de Controle" },
];

const initialItemsByDatacenter: Record<string, PlacedItem[]> = {
    'dc1': [
        { id: 'rack-3', name: 'Rack-3', type: 'Server Rack', icon: Server, x: 1, y: 0, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'A', observations: 'Rack principal.', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
        { id: 'rack-2', name: 'Rack-02', type: 'Server Rack', icon: Server, x: 7, y: 2, status: 'Ativo', width: 0.6, length: 1.2, sizeU: 42, row: 'B', observations: '', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
        { id: 'rack-0', name: 'Rack-00', type: 'rack', icon: Server, x: 8, y: 2, status: 'Manutenção', width: 0.8, length: 0.8, sizeU: 48, row: 'B', observations: 'Verificar fonte de energia.', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '06/07/2025' },
        { id: 'qdf-1', name: 'QDF-1', type: 'qdf', icon: Server, x: 5, y: 5, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'F', observations: '', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '05/07/2025' },
    ],
    'dc2': [],
};


// --- Context for sharing dashboard state ---
interface DatacenterContextType {
    datacenters: DatacenterOption[];
    selectedDatacenter?: DatacenterOption;
    setSelectedDatacenter: (datacenter: DatacenterOption) => void;
    itemsByDatacenter: Record<string, PlacedItem[]>;
    updateItemsForDatacenter: (dcId: string, items: PlacedItem[]) => void;
    approveItem: (itemId: string) => void;
    addDatacenter: (name: string) => void;
    deleteDatacenter: (id: string) => void;
    reorderDatacenters: (id: string, direction: 'up' | 'down') => void;
}

const DatacenterContext = React.createContext<DatacenterContextType | undefined>(undefined);

export function DatacenterProvider({ children }: { children: React.ReactNode }) {
    const [datacenters, setDatacenters] = React.useState<DatacenterOption[]>(initialDatacentersData);
    const [selectedDatacenter, setSelectedDatacenter] = React.useState<DatacenterOption | undefined>(initialDatacentersData[0]);
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

    const addDatacenter = (name: string) => {
        const newDatacenter = {
            value: `dc-${Date.now()}`,
            label: name,
        };
        setDatacenters(prev => [...prev, newDatacenter]);
        setItemsByDatacenter(prev => ({ ...prev, [newDatacenter.value]: [] }));
    };

    const deleteDatacenter = (id: string) => {
        setItemsByDatacenter(prev => {
            const newItems = { ...prev };
            delete newItems[id];
            return newItems;
        });
        setDatacenters(prev => {
            const newList = prev.filter(dc => dc.value !== id);
            if (selectedDatacenter?.value === id) {
                setSelectedDatacenter(newList[0]);
            }
            return newList;
        });
    };

    const reorderDatacenters = (id: string, direction: 'up' | 'down') => {
        setDatacenters(prev => {
            const index = prev.findIndex(dc => dc.value === id);
            if (index === -1) return prev;

            const newDcs = [...prev];
            if (direction === 'up' && index > 0) {
                [newDcs[index - 1], newDcs[index]] = [newDcs[index], newDcs[index - 1]];
            }
            if (direction === 'down' && index < newDcs.length - 1) {
                [newDcs[index], newDcs[index + 1]] = [newDcs[index + 1], newDcs[index]];
            }
            return newDcs;
        });
    };

    return (
        <DatacenterContext.Provider value={{ datacenters, selectedDatacenter, setSelectedDatacenter: setSelectedDatacenter as (dc: DatacenterOption) => void, itemsByDatacenter, updateItemsForDatacenter, approveItem, addDatacenter, deleteDatacenter, reorderDatacenters }}>
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

export function DatacenterSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { datacenters, selectedDatacenter, setSelectedDatacenter } = useDatacenter();

  if (!selectedDatacenter) {
      return (
          <Button variant="outline" role="combobox" className="justify-between w-[200px]" disabled>
              Nenhuma Sala
          </Button>
      )
  }

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
          {selectedDatacenter.label}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar sala..." />
            <CommandEmpty>Nenhuma sala encontrada.</CommandEmpty>
            <CommandGroup>
              {datacenters.map((dc) => (
                <CommandItem
                  key={dc.value}
                  onSelect={() => {
                    setSelectedDatacenter(dc);
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
