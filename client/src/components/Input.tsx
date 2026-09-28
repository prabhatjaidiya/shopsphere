type InputProps = {
    label: string;
    type?: string;
    placeholder?: string;
    error?: string;
};

const Input = ({
  label,
  type = "text",
  placeholder,
  error,
}: InputProps) => {
  return (
    <div>
      <label>{label}</label>

      <input
        type={type}
        placeholder={placeholder}
      />

      {error && <p>{error}</p>}
    </div>
  );
};

export default Input;