"use client";

import React, { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from "lucide-react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      success,
      hint,
      required,
      icon,
      actions,
      className = "",
      type = "text",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    const successId = `${fieldId}-success`;

    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;

    const getFieldClasses = () => {
      let classes = `
        block w-full px-3 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        transition-colors duration-200
        ${icon ? "pl-10" : ""}
        ${actions || isPasswordField ? "pr-10" : ""}
      `;

      if (error) {
        classes += " border-red-300 focus:border-red-500 focus:ring-red-500";
      } else if (success) {
        classes +=
          " border-green-300 focus:border-green-500 focus:ring-green-500";
      } else {
        classes += " border-gray-300";
      }

      return `${classes} ${className}`;
    };

    return (
      <div className="form-field">
        {/* Label */}
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={fieldId}
            type={inputType}
            className={getFieldClasses()}
            aria-describedby={`
              ${hint ? hintId : ""} 
              ${error ? errorId : ""} 
              ${success ? successId : ""}
            `.trim()}
            aria-invalid={error ? "true" : "false"}
            aria-required={required}
            {...props}
          />

          {/* Actions or Password Toggle */}
          {(actions || isPasswordField) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isPasswordField && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
              {actions && !isPasswordField && actions}
            </div>
          )}
        </div>

        {/* Hint */}
        {hint && (
          <p
            id={hintId}
            className="mt-1 text-sm text-gray-500 flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <p
            id={successId}
            className="mt-1 text-sm text-green-600 flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            {success}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      options,
      error,
      hint,
      required,
      placeholder,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    const getSelectClasses = () => {
      let classes = `
        block w-full px-3 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        transition-colors duration-200 bg-white text-gray-900
      `;

      if (error) {
        classes += " border-red-300 focus:border-red-500 focus:ring-red-500";
      } else {
        classes += " border-gray-300";
      }

      return `${classes} ${className}`;
    };

    return (
      <div className="form-field">
        {/* Label */}
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {/* Select */}
        <select
          ref={ref}
          id={fieldId}
          className={getSelectClasses()}
          aria-describedby={`${hint ? hintId : ""} ${
            error ? errorId : ""
          }`.trim()}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Hint */}
        {hint && (
          <p id={hintId} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
}

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    { label, error, hint, required, rows = 3, className = "", id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    const getTextAreaClasses = () => {
      let classes = `
        block w-full px-3 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        transition-colors duration-200 resize-vertical
      `;

      if (error) {
        classes += " border-red-300 focus:border-red-500 focus:ring-red-500";
      } else {
        classes += " border-gray-300";
      }

      return `${classes} ${className}`;
    };

    return (
      <div className="form-field">
        {/* Label */}
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {/* TextArea */}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={getTextAreaClasses()}
          aria-describedby={`${hint ? hintId : ""} ${
            error ? errorId : ""
          }`.trim()}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
          {...props}
        />

        {/* Hint */}
        {hint && (
          <p id={hintId} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextAreaField.displayName = "TextAreaField";

interface CheckboxFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    { label, description, error, required, className = "", id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const descId = `${fieldId}-description`;

    return (
      <div className="form-field">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={fieldId}
              type="checkbox"
              className={`
                h-4 w-4 text-blue-600 border-gray-300 rounded 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                disabled:bg-gray-50 disabled:cursor-not-allowed
                transition-colors duration-200
                ${error ? "border-red-300" : "border-gray-300"}
                ${className}
              `}
              aria-describedby={`${description ? descId : ""} ${
                error ? errorId : ""
              }`.trim()}
              aria-invalid={error ? "true" : "false"}
              aria-required={required}
              {...props}
            />
          </div>

          <div className="ml-3">
            <label
              htmlFor={fieldId}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {label}
              {required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>

            {description && (
              <p id={descId} className="text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

CheckboxField.displayName = "CheckboxField";

// Form container with better keyboard navigation
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AccessibleForm({
  title,
  description,
  children,
  ...props
}: FormProps) {
  return (
    <form {...props}>
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-4">{children}</div>
    </form>
  );
}

// Hook for form validation and accessibility
export function useFormAccessibility() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const setFieldTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFieldValid = (field: string) => {
    return !errors[field] && touched[field];
  };

  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  const clearAllErrors = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    isFieldValid,
    hasErrors,
    clearAllErrors,
  };
}
