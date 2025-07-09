'use server';

import { previewAddIsFrontFacingToEquipment, runAddIsFrontFacingToEquipment } from './migrations';

export async function previewDefaultMigration(): Promise<{ success: boolean; count: number; message: string; error?: string }> {
    try {
        const count = await previewAddIsFrontFacingToEquipment();
        if (count === 0) {
            return { success: true, count: 0, message: "Nenhum equipamento precisa ser atualizado. O campo 'isFrontFacing' já está presente em todos." };
        }
        return { success: true, count, message: `Foram encontrados ${count} equipamento(s) para atualizar com 'isFrontFacing: true'.` };
    } catch (error) {
        console.error("Erro na pré-visualização da migração:", error);
        return { success: false, count: 0, message: "", error: (error as Error).message };
    }
}


export async function executeDefaultMigration(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const updatedCount = await runAddIsFrontFacingToEquipment();
        if (updatedCount === 0) {
             return { success: true, message: "Nenhum equipamento foi atualizado." };
        }
        return { success: true, message: `Migração concluída. ${updatedCount} equipamento(s) foram atualizados com 'isFrontFacing: true'.` };
    } catch (error) {
        console.error("Erro na migração:", error);
        return { success: false, error: (error as Error).message };
    }
}
