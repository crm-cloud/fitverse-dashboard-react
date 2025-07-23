
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

interface FieldConfig {
  required?: boolean;
  rules?: ValidationRule[];
  transform?: (value: any) => any;
}

interface FormConfig {
  [key: string]: FieldConfig;
}

interface FormErrors {
  [key: string]: string[];
}

interface UseFormValidationReturn {
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  validateField: (fieldName: string, value: any) => boolean;
  validateForm: (data: any) => boolean;
  clearErrors: (fieldName?: string) => void;
  setSubmitting: (submitting: boolean) => void;
  showErrorToast: (message?: string) => void;
  showSuccessToast: (message: string) => void;
}

export const useFormValidation = (config: FormConfig): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName: string, value: any): boolean => {
    const fieldConfig = config[fieldName];
    if (!fieldConfig) return true;

    const fieldErrors: string[] = [];

    // Required validation
    if (fieldConfig.required && (!value || value === '' || value === null || value === undefined)) {
      fieldErrors.push(`${fieldName} is required`);
    }

    // Custom rules validation
    if (fieldConfig.rules && value) {
      fieldConfig.rules.forEach(rule => {
        if (!rule.validate(value)) {
          fieldErrors.push(rule.message);
        }
      });
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));

    return fieldErrors.length === 0;
  }, [config]);

  const validateForm = useCallback((data: any): boolean => {
    const newErrors: FormErrors = {};
    let isFormValid = true;

    Object.keys(config).forEach(fieldName => {
      const fieldConfig = config[fieldName];
      const value = data[fieldName];
      const fieldErrors: string[] = [];

      // Required validation
      if (fieldConfig.required && (!value || value === '' || value === null || value === undefined)) {
        fieldErrors.push(`${fieldName} is required`);
        isFormValid = false;
      }

      // Custom rules validation
      if (fieldConfig.rules && value) {
        fieldConfig.rules.forEach(rule => {
          if (!rule.validate(value)) {
            fieldErrors.push(rule.message);
            isFormValid = false;
          }
        });
      }

      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [config]);

  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const showErrorToast = useCallback((message?: string) => {
    toast({
      title: "Validation Error",
      description: message || "Please check the form for errors.",
      variant: "destructive",
    });
  }, []);

  const showSuccessToast = useCallback((message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    isSubmitting,
    validateField,
    validateForm,
    clearErrors,
    setSubmitting,
    showErrorToast,
    showSuccessToast
  };
};

// Common validation rules
export const validationRules = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  phone: {
    validate: (value: string) => /^\+?[\d\s-()]+$/.test(value),
    message: 'Please enter a valid phone number'
  },
  minLength: (length: number) => ({
    validate: (value: string) => value.length >= length,
    message: `Must be at least ${length} characters long`
  }),
  maxLength: (length: number) => ({
    validate: (value: string) => value.length <= length,
    message: `Must be no more than ${length} characters long`
  }),
  numeric: {
    validate: (value: string) => /^\d+$/.test(value),
    message: 'Must contain only numbers'
  },
  alphanumeric: {
    validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Must contain only letters and numbers'
  }
};
