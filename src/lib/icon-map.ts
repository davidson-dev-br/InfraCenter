import { Server, AirVent, Network, Cable, Box, Fan, Router, HardDrive, Battery, LucideIcon, Wind, Snowflake, Thermometer, Heater, Power, CircuitBoard, Building, Zap } from 'lucide-react';

export const ICON_LIST = {
    Server,
    AirVent,
    Network,
    Cable,
    Box,
    Fan,
    Router,
    HardDrive,
    Battery,
    Wind,
    Snowflake,
    Thermometer,
    Heater,
    Power,
    CircuitBoard,
    Building,
    Zap
};

export const ICON_NAMES = Object.keys(ICON_LIST) as (keyof typeof ICON_LIST)[];

export function getIconByName(name?: string): LucideIcon {
    if (name && name in ICON_LIST) {
        return ICON_LIST[name as keyof typeof ICON_LIST];
    }
    return Box; // Default icon
}
