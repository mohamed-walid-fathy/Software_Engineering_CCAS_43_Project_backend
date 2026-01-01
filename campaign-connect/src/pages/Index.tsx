import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCampaigns } from "@/data/mockCampaigns";
import { Heart, Users, Globe, Shield, ArrowRight, Sparkles, TrendingUp, Award } from "lucide-react";

const stats = [
  { icon: Heart, value: "$12.5M+", label: "Raised" },
  { icon: Users, value: "50K+", label: "Donors" },
  { icon: Globe, value: "120+", label: "Countries" },
  { icon: Award, value: "1,200+", label: "Campaigns" },
];

export default function Index() {
  const featuredCampaigns = mockCampaigns.slice(0, 3);
  const urgentCampaigns = mockCampaigns.filter((c) => c.isUrgent);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwRjc2NkUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Sparkles className="mr-1 h-3 w-3" />
              Trusted by 50,000+ donors worldwide
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
                <Link to="/campaigns/browse">
                  Browse Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/register">Start a Campaign</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
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
              <Link to="/campaigns/browse">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>

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
                <Link to="/auth/register">
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/campaigns/browse">
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
