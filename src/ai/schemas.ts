
/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 * This file does not contain 'use server' and can be safely imported by both
 * client and server components.
 */
import { z } from 'genkit';

// Schemas for extract-connection-details-flow
export const ExtractConnectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a cable label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractConnectionInput = z.infer<typeof ExtractConnectionInputSchema>;

export const ExtractConnectionOutputSchema = z.object({
    cableLabel: z.string().optional().describe("The primary identifier or name on the cable label."),
    sourceHostname: z.string().optional().describe("The hostname of the source (DE) device."),
    sourcePort: z.string().optional().describe("The port of the source (DE) device."),
    destinationHostname: z.string().optional().describe("The hostname of the destination (PARA) device."),
    destinationPort: z.string().optional().describe("The port of the destination (PARA) device."),
});
export type ExtractConnectionOutput = z.infer<typeof ExtractConnectionOutputSchema>;


// Schemas for extract-equipment-details-flow
export const ExtractEquipmentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a piece of hardware, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractEquipmentInput = z.infer<typeof ExtractEquipmentInputSchema>;

export const ExtractEquipmentOutputSchema = z.object({
    hostname: z.string().optional().describe("The hostname of the device, if visible."),
    model: z.string().optional().describe("The model number or name of the device."),
    brand: z.string().optional().describe("The manufacturer or brand of the device (e.g., Cisco, Dell, HPE)."),
    serialNumber: z.string().optional().describe("The serial number of the device."),
    type: z.string().optional().describe("The general type of equipment (e.g., Switch, Server, Router, Patch Panel, Firewall)."),
    tag: z.string().optional().describe("Any asset tag or identification sticker number visible on the device."),
});
export type ExtractEquipmentOutput = z.infer<typeof ExtractEquipmentOutputSchema>;


// Schemas for import-spreadsheet-flow
export const ImportFromSpreadsheetInputSchema = z.object({
  jsonData: z.string().describe("A JSON string representation of the spreadsheet data."),
});
export type ImportFromSpreadsheetInput = z.infer<typeof ImportFromSpreadsheetInputSchema>;

export const ImportedEquipmentSchema = z.object({
  hostname: z.string().optional().describe("The hostname of the device."),
  model: z.string().optional().describe("The model number or name of the device."),
  serialNumber: z.string().optional().describe("The serial number of the device."),
  entryDate: z.string().optional().describe("Date in YYYY-MM-DD format if possible."),
  type: z.string().optional().describe("The general type of equipment (e.g., Switch, Server, Router)."),
  brand: z.string().optional().describe("The manufacturer or brand of the device (e.g., Cisco, Dell, HPE)."),
  tag: z.string().optional().describe("Any asset tag or identification sticker number visible on the device."),
  description: z.string().optional().describe("A brief description of the equipment."),
  sizeU: z.string().optional().describe("The size of the equipment in rack units (U)."),
  positionU: z.string().optional().describe("The position in the rack, in U."),
  status: z.string().optional().describe("The current operational status of the equipment."),
});
export type ImportedEquipment = z.infer<typeof ImportedEquipmentSchema>;


export const ImportFromSpreadsheetOutputSchema = z.object({
  equipment: z.array(ImportedEquipmentSchema).describe("The list of equipment extracted and mapped from the spreadsheet data."),
});
export type ImportFromSpreadsheetOutput = z.infer<typeof ImportFromSpreadsheetOutputSchema>;
