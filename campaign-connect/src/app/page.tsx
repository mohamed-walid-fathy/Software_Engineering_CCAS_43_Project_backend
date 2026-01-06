"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { campaignsApi, donationsApi } from "@/lib/api"; // Updated import
import { Heart, Users, Globe, ArrowRight, Sparkles, TrendingUp, Award, Shield, Loader2 } from "lucide-react";

// Initial static stats as fallback/placeholder
const initialStats = [
  { icon: Heart, value: "$0", label: "Raised" },
  { icon: Users, value: "0", label: "Donors" },
  { icon: Globe, value: "5", label: "Countries" },
  { icon: Award, value: "0", label: "Campaigns" },
];

interface Campaign {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  goalAmount: number;
  donorCount: number;
  daysLeft: number;
  category: string;
  charity: string;
}

export default function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [urgentCampaigns, setUrgentCampaigns] = useState<Campaign[]>([]);
  const [platformStats, setPlatformStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Stats
        const statsRes = await donationsApi.getPlatformStats();
        if (statsRes.data) {
          const s = (statsRes.data as any).data;
          if (s) {
            setPlatformStats([
              { icon: Heart, value: `$${(s.total_raised || 0).toLocaleString()}`, label: "Raised" },
              { icon: Users, value: (s.total_donors || 0).toLocaleString(), label: "Donors" },
              { icon: Globe, value: (s.countries_count || 5).toString(), label: "Countries" },
              { icon: Award, value: (s.total_campaigns || 0).toLocaleString(), label: "Campaigns" },
            ]);
          }
        }

        // 2. Fetch Campaigns
        const response = await campaignsApi.getAll({ limit: 6 });
        const result = response.data;
        const allCampaigns = result?.data || [];

        const mappedCampaigns = allCampaigns
          .filter((c: any) => (c.charity || c.Charity)?.verified_status === 'verified') // Only verified charities
          .map((c: any) => {
            const id = c.campaign_id || c.id;
            const target = c.target_amount || 1000;
            const current = c.current_amount || 0;
            const charity = c.charity || c.Charity;
            const charityName = charity?.first_name ? `${charity.first_name} ${charity.last_name || ""}` : (charity?.name || "Verified Charity");
            const daysLeft = c.end_date
              ? Math.max(0, Math.ceil((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : 30;

            return {
              id: String(id),
              title: c.title,
              description: c.description || "",
              currentAmount: parseFloat(current),
              goalAmount: parseFloat(target),
              donorCount: c.donor_count || 0,
              daysLeft: daysLeft,
              category: c.category || "General",
              charity: charityName
            };
          });

        setFeaturedCampaigns(mappedCampaigns.slice(0, 3));
        setUrgentCampaigns(mappedCampaigns.slice(3, 6));
      } catch (error) {
        console.error("Failed to fetch homepage data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwRjc2NkUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Sparkles className="mr-1 h-3 w-3" />
              Trusted by {platformStats.find(s => s.label === "Donors")?.value || "thousands of"} donors worldwide
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Make a Difference,{" "}
              <span className="text-primary">One Donation</span> at a Time
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Join thousands of compassionate donors supporting verified charities.
              100% transparent. 100% impactful. Start giving today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" asChild>
                <Link href="/campaigns/browse">
                  Browse Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/register">Start a Campaign</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {platformStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgent Campaigns */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading campaigns...</p>
        </div>
      ) : (
        <>
          {urgentCampaigns.length > 0 && (
            <section className="border-b bg-destructive/5 py-12">
              <div className="container">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 animate-pulse-soft">
                      <TrendingUp className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Urgent Campaigns</h2>
                      <p className="text-sm text-muted-foreground">These campaigns need your immediate support</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {urgentCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Campaigns */}
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold md:text-3xl">Featured Campaigns</h2>
                  <p className="text-muted-foreground">Discover causes that matter</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/campaigns/browse">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {featuredCampaigns.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-lg">
                  <p>No campaigns found right now. Check back later!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Trust Section */}
      <section className="border-t bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Why Choose GiveHope?</h2>
            <p className="mb-12 text-muted-foreground">
              We're committed to transparency, security, and making every donation count.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Verified Charities</h3>
              <p className="text-sm text-muted-foreground">
                Every charity is thoroughly vetted to ensure your donations go to legitimate causes.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-7 w-7 text-success" />
              </div>
              <h3 className="mb-2 font-semibold">100% Transparency</h3>
              <p className="text-sm text-muted-foreground">
                Track exactly where your money goes with our real-time impact reports.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Heart className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">Tax Deductible</h3>
              <p className="text-sm text-muted-foreground">
                Receive instant tax receipts for all eligible donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
              Ready to Make an Impact?
            </h2>
            <p className="mb-8 text-primary-foreground/80">
              Join our community of changemakers and start making a difference today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register">
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/campaigns/browse">
                  Explore Campaigns
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
