import { Field, FieldProps } from 'formik';
import { ReactNode } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

export default function FormSelect({
  name,
  label,
  options,
  placeholder,
  required = false,
  disabled = false,
  multiple = false,
  className = '',
}: FormSelectProps) {
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <div className={`space-y-1 ${className}`}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          <select
            {...field}
            id={name}
            multiple={multiple}
            disabled={disabled}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
              meta.touched && meta.error
                ? 'border-red-300'
                : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {meta.touched && meta.error && (
            <p className="text-sm text-red-600">{meta.error}</p>
          )}
        </div>
      )}
    </Field>
  );
}
