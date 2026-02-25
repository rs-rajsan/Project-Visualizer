import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '../utils/logger';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // Default fallback values
    const [themeConfig, setThemeConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('project-flow-theme');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return {
            primaryColor: '#6366f1', // Indigo 500
            secondaryColor: '#14b8a6', // Teal 500
            logoUrl: null
        };
    });

    const updateTheme = (newConfig) => {
        logger.info('Updating enterprise theme variables', { configUpdate: Object.keys(newConfig) });
        setThemeConfig(prev => {
            const updated = { ...prev, ...newConfig };
            localStorage.setItem('project-flow-theme', JSON.stringify(updated));
            return updated;
        });
    };

    // Inject CSS variables dynamically into the root document
    useEffect(() => {
        const root = document.documentElement;
        if (themeConfig.primaryColor) {
            root.style.setProperty('--brand-primary', themeConfig.primaryColor);
        }
        if (themeConfig.secondaryColor) {
            root.style.setProperty('--brand-secondary', themeConfig.secondaryColor);
        }
        logger.debug('CSS Variables Injected', { primary: themeConfig.primaryColor });
    }, [themeConfig.primaryColor, themeConfig.secondaryColor]);

    return (
        <ThemeContext.Provider value={{ themeConfig, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
