"use client";

import * as React from "react";
import { ChevronsUpDown, Building } from "lucide-react";
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

export const datacenters = [
  { value: "dc1", label: "US-East-1" },
  { value: "dc2", label: "EU-West-2" },
  { value: "dc3", label: "AP-South-1" },
];

export type DatacenterOption = typeof datacenters[number];

// --- Context for sharing datacenter state ---
interface DatacenterContextType {
    selectedDatacenter: DatacenterOption;
    setSelectedDatacenter: (datacenter: DatacenterOption) => void;
}

const DatacenterContext = React.createContext<DatacenterContextType | undefined>(undefined);

export function DatacenterProvider({ children }: { children: React.ReactNode }) {
    const [selectedDatacenter, setSelectedDatacenter] = React.useState<DatacenterOption>(datacenters[0]);

    return (
        <DatacenterContext.Provider value={{ selectedDatacenter, setSelectedDatacenter }}>
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
