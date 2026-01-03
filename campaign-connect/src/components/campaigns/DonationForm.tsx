"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, CreditCard, Shield, Lock, Loader2 } from "lucide-react";
import { donationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const presetAmounts = [25, 50, 100, 250, 500];

interface DonationFormProps {
  campaignTitle: string;
  campaignId: string;
  onSubmit?: (amount: number) => void;
}

export function DonationForm({ campaignTitle, campaignId, onSubmit }: DonationFormProps) {
  const [amount, setAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isMonthly, setIsMonthly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const selectedAmount = customAmount ? parseFloat(customAmount) : amount;

  const handlePresetClick = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setCustomAmount(value);
    setAmount(null);
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(cleaned);
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setExpiry(cleaned);
  };

  const handleCvcChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 3);
    setCvc(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount && selectedAmount > 0) {
      try {
        setLoading(true);
        const response = await donationsApi.create({
          campaign_id: parseInt(campaignId),
          donor_id: isAnonymous ? null : (user?.donor_id ? parseInt(user.donor_id) : null),
          amount: selectedAmount,
          is_anonymous: isAnonymous,
          payment_method: 'card'
        });

        if (response.error) {
          toast({
            title: "Donation Failed",
            description: response.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Thank You! 💚",
            description: `Your donation of $${selectedAmount.toLocaleString()} has been processed successfully.`,
          });
          setCardNumber("");
          setExpiry("");
          setCvc("");
          onSubmit?.(selectedAmount);
          // Redirect to success or back to campaign
          router.push(`/campaigns/${campaignId}`);
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Make a Donation
        </CardTitle>
        <CardDescription>
          Support "{campaignTitle}" with your generous contribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Amounts */}
          <div className="space-y-3">
            <Label>Select Amount</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={amount === value ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handlePresetClick(value)}
                >
                  ${value}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="customAmount">Or enter custom amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="customAmount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="pl-8"
                min="1"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* <div className="flex items-center space-x-2">
              <Checkbox
                id="monthly"
                checked={isMonthly}
                onCheckedChange={(checked) => setIsMonthly(checked as boolean)}
              />
              <Label htmlFor="monthly" className="text-sm font-normal cursor-pointer">
                Make this a monthly donation
              </Label>
            </div> */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                Donate anonymously
              </Label>
            </div>
          </div>

          {/* Donor Info */}
          {!isAnonymous && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>
            </div>
          )}

          {/* Payment Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date (MMYY)</Label>
                <Input
                  id="expiry"
                  placeholder="MMYY"
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => handleCvcChange(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full" disabled={loading || !selectedAmount || selectedAmount <= 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Donate ${selectedAmount?.toLocaleString() || 0} {isMonthly ? "Monthly" : ""}
              </>
            )}
          </Button>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-success" />
              SSL Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-success" />
              Tax Deductible
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
