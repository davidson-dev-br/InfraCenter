import { Server, AirVent, Network, Cable, Box, LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
    'Rack': Server,
    'Servidor': Server,
    'Switch': Network,
    'Patch Panel': Cable,
    'Storage': Server,
    'Roteador': Network,
    'Ar Condicionado': AirVent,
    'QDF': Network,
    'default': Box,
};

export function getIconByName(name: string): LucideIcon {
    // Try to find a direct match
    if (ICONS[name]) {
        return ICONS[name];
    }
    // Try to find a partial match (e.g., "Rack-01" should match "Rack")
    const key = Object.keys(ICONS).find(k => name.toLowerCase().includes(k.toLowerCase()));
    return key ? ICONS[key] : ICONS['default'];
}
