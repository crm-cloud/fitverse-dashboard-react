import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { useToast } from '@/hooks/use-toast';

interface BranchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  managerId: string;
  description: string;
}

const initialData: BranchFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  managerId: '',
  description: ''
};

const formConfig = {
  name: {
    rules: [
      validationRules.required,
      validationRules.minLength(2)
    ]
  },
  address: {
    rules: [validationRules.required]
  },
  city: {
    rules: [validationRules.required]
  },
  state: {
    rules: [validationRules.required]
  },
  zipCode: {
    rules: [
      validationRules.required,
      validationRules.minLength(5)
    ]
  },
  phone: {
    rules: [
      validationRules.required,
      validationRules.phone
    ]
  },
  email: {
    rules: [
      validationRules.required,
      validationRules.email
    ]
  }
};

export function BranchForm() {
  const [formData, setFormData] = useState<BranchFormData>(initialData);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    errors,
    isSubmitting,
    validateField,
    validateForm,
    clearErrors,
    setSubmitting,
    showErrorToast,
    showSuccessToast
  } = useFormValidation(formConfig);

  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      showErrorToast('Please correct the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast('Branch created successfully');
      navigate('/branches');
    } catch (error) {
      showErrorToast('Failed to create branch. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Branch Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => validateField('name', formData.name)}
            placeholder="Enter branch name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => validateField('email', formData.email)}
            placeholder="branch@gymfit.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            onBlur={() => validateField('address', formData.address)}
            placeholder="Street address"
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            onBlur={() => validateField('city', formData.city)}
            placeholder="City"
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code *</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            onBlur={() => validateField('zipCode', formData.zipCode)}
            placeholder="12345"
            className={errors.zipCode ? 'border-destructive' : ''}
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive">{errors.zipCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => validateField('phone', formData.phone)}
            placeholder="+1 (555) 123-4567"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description of the branch"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/branches')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
}