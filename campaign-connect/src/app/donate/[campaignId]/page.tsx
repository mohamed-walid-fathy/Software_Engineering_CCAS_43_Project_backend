"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { DonationForm } from "@/components/campaigns/DonationForm";
import { ProgressBar } from "@/components/campaigns/ProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, CreditCard, Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { campaignsApi } from "@/lib/api";

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  category: string;
  charity?: {
    first_name?: string;
    last_name?: string;
    name?: string;
  };
}

export default function Donate() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await campaignsApi.getById(campaignId);
        if (response.data) {
          const rawData = (response.data as any).data || response.data;
          setCampaign({
            ...rawData,
            id: String(rawData.campaign_id || rawData.id),
            target_amount: parseFloat(rawData.target_amount || rawData.goal_amount || 0),
            current_amount: parseFloat(rawData.current_amount || 0),
            charity: rawData.charity || rawData.Charity || rawData.charities
          });
        }
      } catch (err) {
        console.error("Failed to fetch campaign:", err);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleDonation = (amount: number) => {
    // This will be handled by the DonationForm now but keeping for breadcrumb/toast if needed
  };

  if (loading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading campaign details...</p>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <Button asChild>
            <Link href="/campaigns/browse">Browse All Campaigns</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            href={`/campaigns/${campaign.id}`}
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Campaign Summary */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-success/20 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-success opacity-50" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {campaign.category}
                      </Badge>
                      <h2 className="font-semibold line-clamp-2">{campaign.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {campaign.charity?.first_name
                          ? `${campaign.charity.first_name} ${campaign.charity.last_name || ""}`.trim()
                          : (campaign.charity?.name || "Verified Charity")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <ProgressBar
                      current={campaign.current_amount}
                      goal={campaign.target_amount}
                      size="md"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card className="bg-success/5 border-success/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    Your Donation is Protected
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Lock className="h-4 w-4 mt-0.5 text-success" />
                      <span className="text-muted-foreground">
                        256-bit SSL encryption protects your payment information
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CreditCard className="h-4 w-4 mt-0.5 text-success" />
                      <span className="text-muted-foreground">
                        PCI-compliant payment processing via Stripe
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-4 w-4 mt-0.5 text-success" />
                      <span className="text-muted-foreground">
                        All charities are verified and monitored for compliance
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium">Is my donation tax-deductible?</p>
                      <p className="text-muted-foreground">
                        Yes, donations to verified 501(c)(3) organizations are tax-deductible.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Can I get a refund?</p>
                      <p className="text-muted-foreground">
                        Refund requests can be made within 30 days of donation.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">How much goes to the charity?</p>
                      <p className="text-muted-foreground">
                        97% of your donation goes directly to the cause. We only charge a 3% platform fee.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donation Form */}
            <div>
              <DonationForm
                campaignTitle={campaign.title}
                campaignId={campaign.id}
                onSubmit={handleDonation}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

