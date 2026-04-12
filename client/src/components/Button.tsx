import React from 'react';
import "../App.css";

// Reusable button variants for different use cases.
// If more buttons types are needed, add a variant below and assign the colors.
type ButtonTypes = 'primary' | 'secondary' | 'danger' | 'start';

interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: ButtonTypes;
    fullWidth?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

const Button = ({ label, onClick, variant = 'primary', fullWidth = false, disabled = false, type = "button" }: ButtonProps) => {

    // These are the base style for all buttons variants.
    const baseStyle: React.CSSProperties = {
        padding: '9px 12px',
        lineHeight: 1,
        borderRadius: '999px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '0.01em',
        fontFamily: 'inherit',
        transition: 'border-color 0.3s, box-shadow 0.3s, opacity 0.15s',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.35 : 1,
        whiteSpace: 'nowrap' as const,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    };

    // These are the specific styles for each button variant.
    // Utilizes CSS defined variables for consistency with the app's color scheme.
    // See index.css for the defined variables (colors: background, text, accent, etc.)
    const buttonVariantStyles: Record<ButtonTypes, React.CSSProperties> = {
        primary: {
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
            border: '2px solid transparent',
            boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
        },
        secondary: {
            backgroundColor: 'var(--social-bg)',
            color: 'var(--text)',
            border: '2px solid transparent',
        },
        danger: {
            backgroundColor: 'var(--accent-bg)',
            color: '#e05c4b',
            border: '2px solid transparent',
        },
        start: {
            backgroundColor: 'var(--accent-bg)',
            color: '#3db87a',
            border: '2px solid transparent',
        },
    };

    return (
        <button
            type={type}
            style={{ ...baseStyle, ...buttonVariantStyles[variant] }}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`app-btn app-btn--${variant}`}
        >
            {label}
        </button>
    );
};

export default Button;