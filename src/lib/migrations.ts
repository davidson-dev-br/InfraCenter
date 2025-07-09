'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * Ensures all equipment documents have the 'isFrontFacing' field.
 * Defaults to 'true' if the field is missing.
 * @returns A status message with the number of documents updated.
 */
export async function addIsFrontFacingToEquipment(): Promise<string> {
    if (!isFirebaseConfigured || !db) {
        throw new Error("Firebase não configurado.");
    }

    let updatedCount = 0;
    const datacentersSnapshot = await getDocs(collection(db, 'datacenters'));

    for (const dcDoc of datacentersSnapshot.docs) {
        const batch = writeBatch(db);
        let batchHasWrites = false;
        
        const equipmentCollectionRef = collection(db, 'datacenters', dcDoc.id, 'equipment');
        const equipmentSnapshot = await getDocs(equipmentCollectionRef);

        equipmentSnapshot.forEach(equipDoc => {
            const data = equipDoc.data();
            if (data.isFrontFacing === undefined) {
                const equipRef = doc(db, 'datacenters', dcDoc.id, 'equipment', equipDoc.id);
                batch.update(equipRef, { isFrontFacing: true });
                updatedCount++;
                batchHasWrites = true;
            }
        });

        if (batchHasWrites) {
            await batch.commit();
        }
    }

    if (updatedCount === 0) {
        return "Nenhum equipamento precisou ser atualizado. O campo 'isFrontFacing' já está presente em todos.";
    }

    return `Migração concluída. ${updatedCount} equipamento(s) foram atualizados com 'isFrontFacing: true'.`;
}
