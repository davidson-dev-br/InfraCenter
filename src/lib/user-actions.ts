
'use server';

import { getAuth } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { auth } from './firebase-admin';

// Com grandes poderes vêm grandes responsabilidades. Esta função tem grandes poderes.
async function getAdminUser() {
    // This is a placeholder for getting the currently logged-in admin user.
    // In a real app, you'd get this from the session.
    // For now, let's assume a mock admin for logging purposes.
    // In a server action, there is no direct concept of "the user" without passing it in.
    // This is a limitation we'll work around for now.
    const mockAdminEmail = "davidson.php@outlook.com";
    const user = await _getUserByEmail(mockAdminEmail);
    return user;
}


export async function getUsers(): Promise<User[]> {
    return _getUsers();
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return _getUserByEmail(email);
}

export async function updateUser(userData: Partial<User> & ({ email: string } | { id: string })): Promise<User> {
    const adminUser = await getAdminUser();
    const isCreating = !('id' in userData && userData.id);

    // Capture state before the update for detailed logging
    let oldState: User | null = null;
    if (!isCreating && 'id' in userData) {
        // If we are updating, we need the old state for logging.
        // We find the user by ID and then use their email to get the full old state.
        const existingUser = await _updateUser({ id: userData.id }); // A bit inefficient, but gets the email
        if (existingUser?.email) {
            oldState = await _getUserByEmail(existingUser.email);
        }
    } else if (!isCreating && 'email' in userData) {
        oldState = await _getUserByEmail(userData.email);
    }
    
    const updatedUser = await _updateUser(userData);

    if (adminUser) {
        if (isCreating) {
             await logAuditEvent({
                action: 'USER_CREATED',
                entityType: 'User',
                entityId: updatedUser.id,
                details: {
                    email: updatedUser.email,
                    role: updatedUser.role,
                }
            });
        } else {
             await logAuditEvent({
                action: 'USER_UPDATED',
                entityType: 'User',
                entityId: updatedUser.id,
                details: {
                    old: oldState ? { role: oldState.role, permissions: oldState.permissions, accessibleBuildingIds: oldState.accessibleBuildingIds, preferences: oldState.preferences } : {},
                    new: { role: updatedUser.role, permissions: updatedUser.permissions, accessibleBuildingIds: updatedUser.accessibleBuildingIds, preferences: updatedUser.preferences }
                }
            });
        }
    }
    
    return updatedUser;
}
