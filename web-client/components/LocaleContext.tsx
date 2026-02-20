'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de idioma y cultura
export type Locale = 'es-HN' | 'en-US' | 'es-MX'; // Ampliable

interface LocaleContextType {
    locale: Locale;
    t: (key: string, defaultText?: string) => string;
    formatCurrency: (amount: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>('es-HN');

    useEffect(() => {
        // Detectar locale del navegador o dispositivo
        const browserLocale = navigator.language;
        if (browserLocale.startsWith('en')) {
            setLocale('en-US');
        } else if (browserLocale === 'es-MX') {
            setLocale('es-MX');
        } else {
            setLocale('es-HN'); // Default to home turf
        }
    }, []);

    // Simple dictionary for key phrases
    const dictionary: Record<Locale, Record<string, string>> = {
        'es-HN': {
            'goal_remaining': 'Falta para la Meta',
            'families_nourished': 'Familias Nutridas',
            'traditions_preserved': 'Tradiciones Guardadas',
            'pro_potential': 'Potencial Pro',
            'resonance': 'Nivel de Resonancia',
            'waiting_impulse': 'Esperando impulso...',
        },
        'en-US': {
            'goal_remaining': 'Remaining for Goal',
            'families_nourished': 'Families Nourished',
            'traditions_preserved': 'Traditions Preserved',
            'pro_potential': 'Pro Potential',
            'resonance': 'Resonance Level',
            'waiting_impulse': 'Waiting for impulse...',
        },
        'es-MX': {
            'goal_remaining': 'Falta pa\' la Meta',
            'families_nourished': 'Familias Alimentadas',
            'traditions_preserved': 'Recetas Salvadas',
            'pro_potential': 'Nivel Pro',
            'resonance': 'Vibra',
            'waiting_impulse': 'Esperando la coperacha...',
        }
    };

    const t = (key: string, defaultText: string = '') => {
        return dictionary[locale][key] || defaultText || key;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: locale === 'en-US' ? 'USD' : 'HNL', // Simplification: HNL for everyone else for now
        }).format(amount);
    };

    return (
        <LocaleContext.Provider value={{ locale, t, formatCurrency }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
