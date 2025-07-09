'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * Scans all equipment documents to see how many are missing the 'isFrontFacing' field.
 * @returns The count of documents that need updating.
 */
export async function previewAddIsFrontFacingToEquipment(): Promise<number> {
    if (!isFirebaseConfigured || !db) {
        throw new Error("Firebase não configurado.");
    }
    let needsUpdateCount = 0;
    const datacentersSnapshot = await getDocs(collection(db, 'datacenters'));
    for (const dcDoc of datacentersSnapshot.docs) {
        const equipmentCollectionRef = collection(db, 'datacenters', dcDoc.id, 'equipment');
        const equipmentSnapshot = await getDocs(equipmentCollectionRef);
        equipmentSnapshot.forEach(equipDoc => {
            const data = equipDoc.data();
            if (data.isFrontFacing === undefined) {
                needsUpdateCount++;
            }
        });
    }
    return needsUpdateCount;
}

/**
 * Ensures all equipment documents have the 'isFrontFacing' field.
 * Defaults to 'true' if the field is missing.
 * @returns The number of documents that were updated.
 */
export async function runAddIsFrontFacingToEquipment(): Promise<number> {
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

    return updatedCount;
}
