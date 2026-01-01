import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, Users, TrendingUp, Plus, 
  Settings, BarChart3, FileText, ArrowUpRight,
  Eye, Edit, PauseCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const campaigns = [
  { 
    id: "1", 
    title: "Clean Water for Rural Communities", 
    status: "active",
    raised: 45000, 
    goal: 75000, 
    donors: 892, 
    daysLeft: 23,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&h=150&fit=crop"
  },
  { 
    id: "2", 
    title: "Education Support Initiative", 
    status: "active",
    raised: 28500, 
    goal: 50000, 
    donors: 456, 
    daysLeft: 45,
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200&h=150&fit=crop"
  },
  { 
    id: "3", 
    title: "Community Health Clinic", 
    status: "completed",
    raised: 100000, 
    goal: 100000, 
    donors: 2341, 
    daysLeft: 0,
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200&h=150&fit=crop"
  },
];

const recentDonations = [
  { donor: "Sarah M.", amount: 100, campaign: "Clean Water for Rural Communities", time: "2 hours ago" },
  { donor: "Anonymous", amount: 250, campaign: "Clean Water for Rural Communities", time: "5 hours ago" },
  { donor: "John D.", amount: 50, campaign: "Education Support Initiative", time: "1 day ago" },
  { donor: "Emily R.", amount: 500, campaign: "Clean Water for Rural Communities", time: "2 days ago" },
];

export default function CharityDashboard() {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">WF</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">WaterAid Foundation</h1>
                  <Badge variant="outline" className="text-success border-success">Verified</Badge>
                </div>
                <p className="text-muted-foreground">Charity Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
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
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-2xl font-bold">$173,500</p>
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
                    <p className="text-sm text-muted-foreground">Total Donors</p>
                    <p className="text-2xl font-bold">3,689</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">$12,450</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="donations">Recent Donations</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Your Campaigns</CardTitle>
                  <CardDescription>Manage and monitor all your fundraising campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border p-4"
                      >
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          className="h-20 w-32 rounded-lg object-cover"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{campaign.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                                  {campaign.status}
                                </Badge>
                                {campaign.daysLeft > 0 && (
                                  <span className="text-sm text-muted-foreground">
                                    {campaign.daysLeft} days left
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-success">
                                ${campaign.raised.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                of ${campaign.goal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{campaign.donors} donors</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="mr-1 h-4 w-4" />
                                Edit
                              </Button>
                              {campaign.status === "active" && (
                                <Button variant="ghost" size="sm">
                                  <PauseCircle className="mr-1 h-4 w-4" />
                                  Pause
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Latest contributions to your campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDonations.map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{donation.donor.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{donation.donor}</p>
                            <p className="text-sm text-muted-foreground">{donation.campaign}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">${donation.amount}</p>
                          <p className="text-sm text-muted-foreground">{donation.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports & Analytics</CardTitle>
                  <CardDescription>Download reports and view detailed analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="pt-6 flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">Monthly Report</p>
                          <p className="text-sm text-muted-foreground">December 2024</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 ml-auto" />
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="pt-6 flex items-center gap-4">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">Donor Analytics</p>
                          <p className="text-sm text-muted-foreground">View insights</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 ml-auto" />
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="pt-6 flex items-center gap-4">
                        <DollarSign className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">Tax Documents</p>
                          <p className="text-sm text-muted-foreground">Annual reports</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 ml-auto" />
                      </CardContent>
                    </Card>
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
