import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, DollarSign, TrendingUp, Calendar, 
  Gift, Bell, Settings, Download, ArrowUpRight 
} from "lucide-react";
import { Link } from "react-router-dom";

const donationHistory = [
  { id: 1, campaign: "Clean Water for Rural Communities", charity: "WaterAid Foundation", amount: 100, date: "Dec 15, 2024", status: "completed" },
  { id: 2, campaign: "Education for Underprivileged Children", charity: "Bright Futures NGO", amount: 50, date: "Dec 10, 2024", status: "completed" },
  { id: 3, campaign: "Emergency Medical Aid for Gaza", charity: "Doctors Without Borders", amount: 250, date: "Nov 28, 2024", status: "completed" },
];

const savedCampaigns = [
  { id: "1", title: "Clean Water for Rural Communities", progress: 60, image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&h=150&fit=crop" },
  { id: "4", title: "Reforestation Project in the Amazon", progress: 56, image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=150&fit=crop" },
];

export default function DonorDashboard() {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">JD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, John!</h1>
                <p className="text-muted-foreground">Your generosity is making a difference</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button asChild>
                <Link to="/campaigns/browse">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate Now
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donated</p>
                    <p className="text-2xl font-bold">$1,425</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Campaigns Supported</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Giving</p>
                    <p className="text-2xl font-bold">$50/mo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                    <Gift className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impact Score</p>
                    <p className="text-2xl font-bold">Gold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Donations */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Donation History</CardTitle>
                    <CardDescription>Your recent contributions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Tax Receipt
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donationHistory.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{donation.campaign}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{donation.charity}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {donation.date}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">${donation.amount}</p>
                          <Badge variant="secondary" className="text-xs">
                            {donation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Donations
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Saved Campaigns */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Saved Campaigns</CardTitle>
                  <CardDescription>Campaigns you're following</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedCampaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        to={`/campaigns/${campaign.id}`}
                        className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          className="h-16 w-20 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{campaign.title}</p>
                          <div className="mt-2">
                            <Progress value={campaign.progress} className="h-1.5" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {campaign.progress}% funded
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to="/campaigns/browse">Discover More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
