"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { ProgressBar } from "@/components/campaigns/ProgressBar";
import { DonationForm } from "@/components/campaigns/DonationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCampaigns } from "@/data/mockCampaigns";
import { 
  Heart, Share2, Users, Clock, MapPin, Shield, 
  ArrowLeft, CheckCircle, Calendar, DollarSign 
} from "lucide-react";

const recentDonors = [
  { name: "Sarah M.", amount: 100, time: "2 hours ago", avatar: "" },
  { name: "Anonymous", amount: 250, time: "5 hours ago", avatar: "" },
  { name: "John D.", amount: 50, time: "1 day ago", avatar: "" },
  { name: "Emily R.", amount: 500, time: "2 days ago", avatar: "" },
  { name: "Michael T.", amount: 75, time: "3 days ago", avatar: "" },
];

const updates = [
  {
    date: "December 15, 2024",
    title: "We're halfway there!",
    content: "Thanks to your incredible support, we've reached 50% of our goal! Your donations are already making a real difference.",
  },
  {
    date: "December 1, 2024",
    title: "Campaign Launched",
    content: "We're excited to launch this campaign and can't wait to see the positive impact we can create together.",
  },
];

export default function CampaignDetails() {
  const params = useParams();
  const id = params.id as string;
  const campaign = mockCampaigns.find((c) => c.id === id);

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
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            href="/campaigns/browse"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                    {campaign.category}
                  </Badge>
                  {campaign.isUrgent && (
                    <Badge className="bg-warning text-warning-foreground">Urgent</Badge>
                  )}
                </div>
              </div>

              {/* Title & Info */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {campaign.charity.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Organized by</p>
                    <p className="font-medium">{campaign.charity}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    <CheckCircle className="mr-1 h-3 w-3 text-success" />
                    Verified
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">{campaign.title}</h1>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-6 rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Raised</p>
                    <p className="font-semibold">${campaign.currentAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Donors</p>
                    <p className="font-semibold">{campaign.donorCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Left</p>
                    <p className="font-semibold">{campaign.daysLeft}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="story" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="story">Story</TabsTrigger>
                  <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
                  <TabsTrigger value="donors">Recent Donors</TabsTrigger>
                </TabsList>
                <TabsContent value="story" className="mt-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {campaign.description}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      Your donation will directly support this cause and help us reach our goal of 
                      ${campaign.goalAmount.toLocaleString()}. Every contribution, no matter the size, 
                      makes a meaningful difference in the lives of those we serve.
                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">How Your Donation Helps</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• $25 - Provides essential supplies for one person</li>
                      <li>• $50 - Funds a week of support services</li>
                      <li>• $100 - Enables critical infrastructure improvements</li>
                      <li>• $500 - Sponsors a complete program for a family</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="updates" className="mt-6 space-y-4">
                  {updates.map((update, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {update.date}
                        </div>
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{update.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="donors" className="mt-6">
                  <div className="space-y-3">
                    {recentDonors.map((donor, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 rounded-lg border p-4"
                      >
                        <Avatar>
                          <AvatarImage src={donor.avatar} />
                          <AvatarFallback className="bg-secondary">
                            {donor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">{donor.time}</p>
                        </div>
                        <p className="font-semibold text-success">${donor.amount}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <ProgressBar
                    current={campaign.currentAmount}
                    goal={campaign.goalAmount}
                    size="lg"
                  />
                  <div className="mt-6 space-y-3">
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`/donate/${campaign.id}`}>
                        <Heart className="mr-2 h-5 w-5" />
                        Donate Now
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      <Share2 className="mr-2 h-5 w-5" />
                      Share Campaign
                    </Button>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-success" />
                    <span>Secure & encrypted donation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

