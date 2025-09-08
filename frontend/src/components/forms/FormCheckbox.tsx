import { Field, FieldProps } from 'formik';

interface FormCheckboxProps {
  name: string;
  label: string;
  disabled?: boolean;
  className?: string;
}

export default function FormCheckbox({
  name,
  label,
  disabled = false,
  className = '',
}: FormCheckboxProps) {
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <div className={`space-y-1 ${className}`}>
          <label className="flex items-center">
            <input
              {...field}
              type="checkbox"
              checked={field.value || false}
              disabled={disabled}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>
          
          {meta.touched && meta.error && (
            <p className="text-sm text-red-600">{meta.error}</p>
          )}
        </div>
      )}
    </Field>
  );
}
