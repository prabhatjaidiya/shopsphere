type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    loading?: boolean;
};

const Button = ({
    children,
    variant = "primary",
    disabled,
    loading,
}: ButtonProps) => {
    const buttonStyles = {
        primary: "primary styles",
        secondary: "secondary styles",
        danger: "danger styles",
    };
    return (
        <button className={buttonStyles[variant]} disabled={disabled || loading }>
            {loading ? "Loading..." : children}
        </button>
    );
};

export default Button;