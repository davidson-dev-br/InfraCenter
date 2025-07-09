'use server';

import { addIsFrontFacingToEquipment } from './migrations';

export async function runDefaultMigration(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const resultMessage = await addIsFrontFacingToEquipment();
        return { success: true, message: resultMessage };
    } catch (error) {
        console.error("Erro na migração:", error);
        return { success: false, error: (error as Error).message };
    }
}
