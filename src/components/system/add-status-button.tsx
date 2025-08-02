
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ManageStatusDialog } from '@/components/manage-status-dialog';

export function AddStatusButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2" />
                Adicionar Status
            </Button>
            <ManageStatusDialog mode="add" open={isOpen} onOpenChange={setIsOpen}/>
        </>
    )
}
