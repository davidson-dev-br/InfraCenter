
"use client";

import React from 'react';
import { AddItemTypeDialog } from '../add-item-type-dialog';

interface AddItemTypeButtonProps {
    isParentType: boolean;
}

export function AddItemTypeButton({ isParentType }: AddItemTypeButtonProps) {
    // The AddItemTypeDialog component now manages its own trigger and state.
    // We just pass whether the dialog should be configured for adding
    // a parent type (can have children) or a child type.
    return (
        <AddItemTypeDialog isParentType={isParentType} />
    );
}
