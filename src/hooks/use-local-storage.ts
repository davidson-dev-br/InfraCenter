
"use client";

import { useState, useEffect } from 'react';

function getValueFromLocalStorage<T>(key: string): T | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return undefined;
    }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const fromLocalStorage = getValueFromLocalStorage<T>(key);
        return fromLocalStorage ?? initialValue;
    });

    useEffect(() => {
        const fromLocalStorage = getValueFromLocalStorage<T>(key);
        if (fromLocalStorage !== undefined && JSON.stringify(fromLocalStorage) !== JSON.stringify(storedValue)) {
            setStoredValue(fromLocalStorage);
        }
    }, [key, storedValue]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    };

    return [storedValue, setValue];
}
