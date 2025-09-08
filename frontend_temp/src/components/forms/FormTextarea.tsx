import { Field, FieldProps } from 'formik';

interface FormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export default function FormTextarea({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
}: FormTextareaProps) {
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <div className={`space-y-1 ${className}`}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          <textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              meta.touched && meta.error
                ? 'border-red-300'
                : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          
          {meta.touched && meta.error && (
            <p className="text-sm text-red-600">{meta.error}</p>
          )}
        </div>
      )}
    </Field>
  );
}
