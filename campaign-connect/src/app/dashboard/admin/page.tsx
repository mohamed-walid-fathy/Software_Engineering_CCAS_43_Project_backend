"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, Users, Building2, Shield, 
  Search, CheckCircle, XCircle, AlertTriangle,
  TrendingUp, Activity, Eye, Ban, Check
} from "lucide-react";

const pendingCharities = [
  { id: 1, name: "Hope for Tomorrow", email: "contact@hopetomorrow.org", registrationNo: "501C3-123456", appliedDate: "Dec 20, 2024" },
  { id: 2, name: "Green Earth Initiative", email: "info@greenearth.org", registrationNo: "501C3-789012", appliedDate: "Dec 18, 2024" },
];

const flaggedCampaigns = [
  { id: 1, title: "Emergency Relief Fund", charity: "Quick Help", reason: "Unusual withdrawal pattern", flagDate: "Dec 22, 2024" },
  { id: 2, title: "Medical Treatment for John", charity: "Personal Campaign", reason: "Unverified documentation", flagDate: "Dec 21, 2024" },
];

const recentActivity = [
  { type: "approval", message: "Charity 'WaterAid Foundation' was approved", time: "2 hours ago" },
  { type: "donation", message: "Large donation of $10,000 to 'Clean Water Project'", time: "5 hours ago" },
  { type: "flag", message: "Campaign 'Emergency Relief Fund' was flagged for review", time: "1 day ago" },
  { type: "registration", message: "New charity 'Hope for Tomorrow' registered", time: "2 days ago" },
];

export default function AdminDashboard() {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">System Administration</h1>
              <p className="text-muted-foreground">Manage platform operations and compliance</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search users, charities..." className="pl-10 w-[300px]" />
              </div>
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
                    <p className="text-sm text-muted-foreground">Platform Total</p>
                    <p className="text-2xl font-bold">$12.5M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">52,341</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Charities</p>
                    <p className="text-2xl font-bold">847</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Shield className="h-4 w-4" />
                Pending Approvals
                <Badge variant="secondary" className="ml-1">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Flagged Content
                <Badge variant="destructive" className="ml-1">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Charity Approvals</CardTitle>
                  <CardDescription>Review and verify new charity registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCharities.map((charity) => (
                      <div
                        key={charity.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border p-4"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-secondary">
                            {charity.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{charity.name}</p>
                          <p className="text-sm text-muted-foreground">{charity.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registration: {charity.registrationNo} • Applied: {charity.appliedDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            Review
                          </Button>
                          <Button variant="default" size="sm">
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flagged">
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Campaigns</CardTitle>
                  <CardDescription>Campaigns requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flaggedCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                      >
                        <AlertTriangle className="h-8 w-8 text-warning" />
                        <div className="flex-1">
                          <p className="font-semibold">{campaign.title}</p>
                          <p className="text-sm text-muted-foreground">by {campaign.charity}</p>
                          <Badge variant="destructive" className="mt-2">
                            {campaign.reason}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Flagged: {campaign.flagDate}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            Investigate
                          </Button>
                          <Button variant="default" size="sm">
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Clear
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Ban className="mr-1 h-4 w-4" />
                            Suspend
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Platform Activity</CardTitle>
                  <CardDescription>Latest events and actions on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-lg border p-4"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          activity.type === "approval" ? "bg-success/10" :
                          activity.type === "donation" ? "bg-primary/10" :
                          activity.type === "flag" ? "bg-warning/10" :
                          "bg-secondary"
                        }`}>
                          {activity.type === "approval" && <CheckCircle className="h-5 w-5 text-success" />}
                          {activity.type === "donation" && <DollarSign className="h-5 w-5 text-primary" />}
                          {activity.type === "flag" && <AlertTriangle className="h-5 w-5 text-warning" />}
                          {activity.type === "registration" && <Building2 className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

