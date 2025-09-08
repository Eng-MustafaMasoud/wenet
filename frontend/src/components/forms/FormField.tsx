import { Field, FieldProps } from "formik";
import { ReactNode } from "react";

interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  children?: (field: FieldProps) => ReactNode;
  className?: string;
}

export default function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <div className={`space-y-1 ${className}`}>
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {children ? (
            children({ field, meta, form: {} as any })
          ) : (
            <input
              {...field}
              type={type}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                meta.touched && meta.error
                  ? "border-red-300"
                  : "border-gray-300"
              } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          )}

          {meta.touched && meta.error && (
            <p className="text-sm text-red-600">{meta.error}</p>
          )}
        </div>
      )}
    </Field>
  );
}
