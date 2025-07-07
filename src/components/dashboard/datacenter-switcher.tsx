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

const datacenters = [
  { value: "dc1", label: "US-East-1" },
  { value: "dc2", label: "EU-West-2" },
  { value: "dc3", label: "AP-South-1" },
];

export function DatacenterSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(datacenters[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
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
                    setSelected(dc);
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
