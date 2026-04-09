import React from 'react';

// Reusable button variants for different use cases.
// If more buttons types are needed, add a variant below and assign the colors.
type ButtonTypes = 'primary' | 'secondary' | 'danger';

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
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.3s',
        width: fullWidth ? '100%' : 'auto',
    };

    // These are the specific styles for each button variant.
    // Utilizes CSS defined variables for consistency with the app's color scheme.
    // See index.css for the defined variables (colors: background, text, accent, etc.)
    const buttonVariantStyles = {
        primary: {
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
            border: '1px solid var(--accent-border)'
        },

        secondary: {
            backgroundColor: 'var(--social-bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)'
        },
        danger: {
            backgroundColor: '#e74c3c',
            color: 'var(--bg)'
        }
    }

    return (
        <button
            type={type}
            style={{ ...baseStyle, ...buttonVariantStyles[variant], opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default Button;