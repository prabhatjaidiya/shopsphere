import { useState, type FormEvent } from "react";
export type ShippingAddress = {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    landmark: string;
};
type AddressErrors = Partial<
    Record<keyof ShippingAddress, string>
>;
type CheckoutProps = {
    initialAddress?: Partial<ShippingAddress>;
    onSubmit: (address: ShippingAddress) => void | Promise<void>;
};
const initialValues: ShippingAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
};
const requiredFields: (keyof ShippingAddress)[] = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
];
const fieldLabels: Record<keyof ShippingAddress, string> = {
    fullName: "Full name",
    phone: "Phone number",
    addressLine1: "Address line 1",
    addressLine2: "Address line 2",
    city: "City",
    state: "State",
    postalCode: "PIN code",
    landmark: "Landmark",
};
function validateAddress(
    address: ShippingAddress
): AddressErrors {
    const errors: AddressErrors = {};
    for (const field of requiredFields) {
        if (!address[field].trim()) {
            errors[field] = `${fieldLabels[field]} is required`;
        }
    }
    const phone = address.phone.trim();
    if (
        phone &&
        !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(phone)
    ) {
        errors.phone = "Enter a valid Indian mobile number";
    }
    const postalCode = address.postalCode.trim();
    if (postalCode && !/^\d{6}$/.test(postalCode)) {
        errors.postalCode = "PIN code must contain 6 digits";
    }
    return errors;
}
export default function ShippingAddressForm({
    initialAddress,
    onSubmit,
}: CheckoutProps) {
    const [address, setAddress] = useState<ShippingAddress>({
        ...initialValues,
        ...initialAddress,
    });
    const [errors, setErrors] = useState<AddressErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    function validateField(
        field: keyof ShippingAddress,
        value: string
    ): string | undefined {
        if (
            requiredFields.includes(field) &&
            !value.trim()
        ) {
            return `${fieldLabels[field]} is required`;
        }
        if (
            field === "phone" &&
            value.trim() &&
            !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(value.trim())
        ) {
            return "Enter a valid Indian mobile number";
        }
        if (
            field === "postalCode" &&
            value.trim() &&
            !/^\d{6}$/.test(value.trim())
        ) {
            return "PIN code must contain 6 digits";
        }
        return undefined;
    }
    function handleChange(
        field: keyof ShippingAddress,
        value: string
    ) {
        const updatedAddress = {
            ...address,
            [field]: value,
        };
        setAddress(updatedAddress);
        if (submitted || errors[field]) {
            setErrors((previous) => ({
                ...previous,
                [field]: validateField(field, value),
            }));
        }
    }
    function handleBlur(field: keyof ShippingAddress) {
        setErrors((previous) => ({
            ...previous,
            [field]: validateField(field, address[field]),
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitted(true);
        setSubmitError(null);

        const trimmedAddress = Object.fromEntries(
            Object.entries(address).map(([key, value]) => [
                key,
                value.trim(),
            ])
        ) as ShippingAddress;

        const validationErrors = validateAddress(trimmedAddress);

        setAddress(trimmedAddress);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            const firstInvalidField = requiredFields.find(
                (field) => validationErrors[field]
            );

            if (firstInvalidField) {
                document.getElementById(firstInvalidField)?.focus();
            }

            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Shipping form submitted");
            console.log("onSubmit prop:", onSubmit);
            await onSubmit(trimmedAddress);
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Checkout validation failed. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function inputClass(field: keyof ShippingAddress) {
        return [
            "mt-1 w-full rounded-xl border bg-white px-4 py-3",
            "text-sm text-gray-900 outline-none transition",
            "placeholder:text-gray-400",
            "focus:ring-2 focus:ring-indigo-500",
            errors[field]
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:border-indigo-500",
        ].join(" ");
    }
    function renderField(
        field: keyof ShippingAddress,
        options?: {
            type?: string;
            placeholder?: string;
            required?: boolean;
            autoComplete?: string;
        }
    ) {
        const required =
            options?.required ?? requiredFields.includes(field);
        const errorId = `${field}-error`;
        return (
            <div key={field}>
                <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700"
                >
                    {fieldLabels[field]}
                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
                <input
                    id={field}
                    name={field}
                    type={options?.type ?? "text"}
                    value={address[field]}
                    placeholder={options?.placeholder}
                    autoComplete={options?.autoComplete}
                    required={required}
                    aria-invalid={Boolean(errors[field])}
                    aria-describedby={
                        errors[field] ? errorId : undefined
                    }
                    onChange={(event) =>
                        handleChange(field, event.target.value)
                    }
                    onBlur={() => handleBlur(field)}
                    className={inputClass(field)}
                />
                {errors[field] && (
                    <p
                        id={errorId}
                        role="alert"
                        className="mt-1 text-xs text-red-600"
                    >
                        {errors[field]}
                    </p>
                )}
            </div>
        );
    }
    return (
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7">
                <p className="text-sm font-medium text-indigo-600">
                    CHECKOUT · STEP 1
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                    Shipping address
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                    Enter your delivery details so we know where
                    to send your order.
                </p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {renderField("fullName", {
                        placeholder: "Enter your full name",
                        autoComplete: "name",
                    })}
                    {renderField("phone", {
                        type: "tel",
                        placeholder: "e.g. 9876543210",
                        autoComplete: "tel",
                    })}
                    <div className="sm:col-span-2">
                        {renderField("addressLine1", {
                            placeholder: "House number, street, locality",
                            autoComplete: "address-line1",
                        })}
                    </div>
                    <div className="sm:col-span-2">
                        {renderField("addressLine2", {
                            placeholder: "Apartment, floor, area (optional)",
                            required: false,
                            autoComplete: "address-line2",
                        })}
                    </div>
                    {renderField("city", {
                        placeholder: "Enter your city",
                        autoComplete: "address-level2",
                    })}
                    {renderField("state", {
                        placeholder: "Enter your state",
                        autoComplete: "address-level1",
                    })}
                    {renderField("postalCode", {
                        placeholder: "6-digit PIN code",
                        autoComplete: "postal-code",
                    })}
                    {renderField("landmark", {
                        placeholder: "Nearby landmark (optional)",
                        required: false,
                    })}
                </div>
                {submitError && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                        {submitError}
                    </p>
                )}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99] sm:w-auto sm:min-w-52"
                    >
                        {isSubmitting ? "Validating..." : "Continue to order summary"}
                    </button>
                    <p className="mt-3 text-xs text-gray-500">
                        Fields marked with * are required.
                    </p>
                </div>
            </form>
        </section>
    );
}