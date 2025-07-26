import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  durationType: string;
  features: string[];
  isActive: boolean;
  maxMembers: string;
  accessHours: string;
  personalTrainerSessions: string;
  groupClassAccess: boolean;
  lockerAccess: boolean;
  guestPasses: string;
}

const initialData: PlanFormData = {
  name: '',
  description: '',
  price: '',
  duration: '',
  durationType: 'month',
  features: [],
  isActive: true,
  maxMembers: '',
  accessHours: '24/7',
  personalTrainerSessions: '0',
  groupClassAccess: true,
  lockerAccess: true,
  guestPasses: '0'
};

const formConfig = {
  name: {
    rules: [
      validationRules.required,
      validationRules.minLength(2)
    ]
  },
  description: {
    rules: [validationRules.required]
  },
  price: {
    rules: [
      validationRules.required,
      validationRules.numeric
    ]
  },
  duration: {
    rules: [
      validationRules.required,
      validationRules.numeric
    ]
  }
};

const availableFeatures = [
  'Unlimited gym access',
  'Group fitness classes',
  'Personal training sessions',
  'Locker room access',
  'Towel service',
  'Free parking',
  'Guest passes',
  'Nutrition consultation',
  'Massage therapy',
  'Sauna and steam room',
  'Swimming pool access',
  'Rock climbing wall',
  'Basketball court',
  'Racquetball courts',
  'Childcare services'
];

export function PlanForm() {
  const [formData, setFormData] = useState<PlanFormData>(initialData);
  const navigate = useNavigate();
  
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

  const handleInputChange = (field: keyof PlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
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
      
      showSuccessToast('Membership plan created successfully');
      navigate('/membership/plans');
    } catch (error) {
      showErrorToast('Failed to create plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define the core details of the membership plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => validateField('name', formData.name)}
                placeholder="e.g., Premium Membership"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  onBlur={() => validateField('price', formData.price)}
                  placeholder="99.99"
                  className={`pl-8 ${errors.price ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <div className="flex space-x-2">
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  onBlur={() => validateField('duration', formData.duration)}
                  placeholder="1"
                  className={`flex-1 ${errors.duration ? 'border-destructive' : ''}`}
                />
                <Select onValueChange={(value) => handleInputChange('durationType', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day(s)</SelectItem>
                    <SelectItem value="week">Week(s)</SelectItem>
                    <SelectItem value="month">Month(s)</SelectItem>
                    <SelectItem value="year">Year(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Member Limit</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => validateField('description', formData.description)}
                placeholder="Describe what this membership plan includes"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access & Benefits</CardTitle>
          <CardDescription>Configure what this plan includes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessHours">Access Hours</Label>
              <Select onValueChange={(value) => handleInputChange('accessHours', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24/7">24/7 Access</SelectItem>
                  <SelectItem value="6AM-10PM">6 AM - 10 PM</SelectItem>
                  <SelectItem value="5AM-11PM">5 AM - 11 PM</SelectItem>
                  <SelectItem value="Business">Business Hours Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalTrainerSessions">Personal Training Sessions</Label>
              <Input
                id="personalTrainerSessions"
                type="number"
                value={formData.personalTrainerSessions}
                onChange={(e) => handleInputChange('personalTrainerSessions', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPasses">Guest Passes per Month</Label>
              <Input
                id="guestPasses"
                type="number"
                value={formData.guestPasses}
                onChange={(e) => handleInputChange('guestPasses', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupClassAccess"
                  checked={formData.groupClassAccess}
                  onCheckedChange={(checked) => handleInputChange('groupClassAccess', checked)}
                />
                <Label htmlFor="groupClassAccess">Group Class Access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lockerAccess"
                  checked={formData.lockerAccess}
                  onCheckedChange={(checked) => handleInputChange('lockerAccess', checked)}
                />
                <Label htmlFor="lockerAccess">Locker Room Access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Plan Active</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
          <CardDescription>Select the features included in this plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={formData.features.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label htmlFor={feature} className="text-sm">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/membership/plans')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}