"use client";

import * as React from "react";
import { ChevronsUpDown, LayoutGrid } from "lucide-react";
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
import { useInfra } from "./datacenter-switcher";

export function RoomSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { buildings, selectedBuildingId, selectedRoomId, setSelectedRoomId } = useInfra();

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const rooms = selectedBuilding?.rooms || [];
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  if (!selectedBuilding || rooms.length === 0) {
    return (
        <Button
          variant="outline"
          role="combobox"
          disabled
          className="justify-between w-[200px]"
        >
          Nenhuma sala
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
    );
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
          <LayoutGrid className="w-4 h-4 mr-2" />
          {selectedRoom ? selectedRoom.name : "Selecione a Sala"}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar sala..." />
            <CommandEmpty>Nenhuma sala encontrada.</CommandEmpty>
            <CommandGroup>
              {rooms.map((room) => (
                <CommandItem
                  key={room.id}
                  onSelect={() => {
                    setSelectedRoomId(room.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  {room.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
