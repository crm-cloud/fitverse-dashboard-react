import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Smartphone, Building, Wallet, QrCode, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PaymentInitiationData, PaymentGatewayType, PaymentMethodType, PaymentType } from '@/types/payment';

interface PaymentInitiationModalProps {
  open: boolean;
  onClose: () => void;
  paymentType: PaymentType;
  amount: number;
  memberId?: string;
  memberName?: string;
  referenceId?: string;
  description?: string;
  onInitiatePayment: (data: PaymentInitiationData) => Promise<void>;
  onGeneratePaymentLink: (data: PaymentInitiationData) => Promise<string>;
}

export function PaymentInitiationModal({
  open,
  onClose,
  paymentType,
  amount,
  memberId,
  memberName,
  referenceId,
  description,
  onInitiatePayment,
  onGeneratePaymentLink
}: PaymentInitiationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'method' | 'gateway' | 'processing'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'direct' | 'link'>('direct');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Rupay' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'PhonePe, Google Pay, Paytm' },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks supported' },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, description: 'Paytm, Amazon Pay, etc.' }
  ] as const;

  const paymentGateways = [
    { id: 'razorpay', name: 'Razorpay', logo: '🟦', description: 'Most popular in India' },
    { id: 'payu', name: 'PayU', logo: '🟢', description: 'High success rate' },
    { id: 'phonepe', name: 'PhonePe', logo: '🟣', description: 'UPI specialist' },
    { id: 'ccavenue', name: 'CCAvenue', logo: '🔵', description: 'Established gateway' }
  ] as const;

  const getPaymentTypeTitle = (type: PaymentType) => {
    switch (type) {
      case 'membership': return 'Membership Payment';
      case 'pos': return 'Store Purchase';
      case 'invoice': return 'Invoice Payment';
      case 'training_fee': return 'Training Fee Payment';
      default: return 'Payment';
    }
  };

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setStep('gateway');
  };

  const handleGatewaySelect = (gateway: PaymentGatewayType) => {
    setSelectedGateway(gateway);
  };

  const handlePaymentInitiation = async () => {
    if (!selectedMethod || !selectedGateway || !memberId) return;

    setIsProcessing(true);
    try {
      const paymentData: PaymentInitiationData = {
        memberId,
        amount,
        paymentType,
        description: description || `${getPaymentTypeTitle(paymentType)} - ${amount}`,
        gatewayType: selectedGateway,
        paymentMethod: selectedMethod,
        referenceId
      };

      if (paymentMode === 'direct') {
        await onInitiatePayment(paymentData);
        toast({
          title: "Payment Initiated",
          description: "Redirecting to payment gateway..."
        });
      } else {
        const link = await onGeneratePaymentLink(paymentData);
        navigator.clipboard.writeText(link);
        toast({
          title: "Payment Link Generated",
          description: "Link copied to clipboard. Share with the member."
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('method');
    setSelectedMethod(null);
    setSelectedGateway(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {getPaymentTypeTitle(paymentType)}
          </DialogTitle>
          <DialogDescription>
            Complete the payment for {memberName || 'the member'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">₹{amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
                <Badge variant="outline">{paymentType}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Mode Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${paymentMode === 'direct' ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setPaymentMode('direct')}
            >
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Direct Payment</div>
                <div className="text-sm text-muted-foreground">Process payment now</div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${paymentMode === 'link' ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setPaymentMode('link')}
            >
              <CardContent className="pt-6 text-center">
                <Link className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Payment Link</div>
                <div className="text-sm text-muted-foreground">Generate shareable link</div>
              </CardContent>
            </Card>
          </div>

          {step === 'method' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Select Payment Method</h3>
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <method.icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'gateway' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep('method')}>
                  ← Back
                </Button>
                <div className="text-sm text-muted-foreground">
                  Selected: {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Select Payment Gateway</h3>
                <div className="grid gap-3">
                  {paymentGateways.map((gateway) => (
                    <Card
                      key={gateway.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedGateway === gateway.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleGatewaySelect(gateway.id)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="text-2xl">{gateway.logo}</div>
                        <div className="flex-1">
                          <div className="font-medium">{gateway.name}</div>
                          <div className="text-sm text-muted-foreground">{gateway.description}</div>
                        </div>
                        {selectedGateway === gateway.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePaymentInitiation}
                  disabled={!selectedGateway || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : (paymentMode === 'direct' ? 'Proceed to Pay' : 'Generate Link')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}