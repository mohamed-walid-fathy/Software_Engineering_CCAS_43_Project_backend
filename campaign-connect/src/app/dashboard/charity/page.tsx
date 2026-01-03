"use client";

import { useState, useEffect } from "react";
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
  Eye, Edit, PauseCircle, Heart, Loader2, Clock,
  Building2, PlusCircle, LogOut, ChevronRight, Calendar,
  Activity, CheckCircle2, Trash2, CreditCard, Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { campaignsApi, donationsApi, authApi, charityApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Campaign {
  id: string;
  title: string;
  status: string;
  current_amount: number;
  target_amount: number;
  donor_count?: number;
  end_date: string;
}

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  campaign_title: string;
  time: string;
}

interface Stats {
  totalRaised: number;
  totalDonors: number;
  activeCampaigns: number;
  monthlyRaised: number;
}

// Add Card and Delete Account components (reused/slightly adapted from donor dashboard)

// Create Campaign Dialog
function CreateCampaignDialog({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title || !description || !targetAmount || !category || !endDate) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const charityId = user.charity_id || user.Charity_id || user.id;
      const result = await campaignsApi.create({
        title,
        description,
        target_amount: parseFloat(targetAmount),
        category,
        end_date: endDate,
        charity_id: charityId
      });

      if (result.error) throw new Error(result.error);
      toast({ title: "Success", description: "Campaign created successfully!" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) { setTitle(""); setDescription(""); setTargetAmount(""); setEndDate(""); } }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Launch a new fundraising initiative to support your cause.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title</Label>
            <Input id="title" placeholder="e.g. Winter Relief Fund" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" placeholder="Describe your cause..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Amount ($)</Label>
              <Input id="target" type="number" placeholder="5000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">End Date</Label>
            <Input id="date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Launch Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Change Password Dialog Component
function ChangePasswordDialog({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.resetPassword(user.email, newPassword);
      if (result.error) throw new Error(result.error);
      toast({ title: "Success", description: "Password updated successfully" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Lock className="h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your account password to keep it secure.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleReset} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your charity account
            and remove all campaign data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CharityDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalDonors: 0,
    activeCampaigns: 0,
    verifiedStatus: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user && user.role !== "charity") {
      router.push("/dashboard/" + user.role);
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const charityId = (user as any).charity_id || (user as any).Charity_id || user.id;

        // 1. Fetch campaigns
        const campaignsRes = await campaignsApi.getAll({ charity_id: charityId });
        const rawCampaigns = (campaignsRes.data as any)?.data || [];
        setCampaigns(rawCampaigns.map((c: any) => ({
          id: c.campaign_id,
          title: c.title,
          raised: parseFloat(c.current_amount),
          goal: parseFloat(c.target_amount),
          donors: c.donor_count || 0,
          status: c.status,
          daysLeft: getDaysLeft(c.end_date)
        })));

        // 2. Fetch platform/charity stats
        const statsRes = await charityApi.getStats(charityId);
        if (statsRes.data) {
          const s = (statsRes.data as any).data;
          if (s) {
            setStats({
              totalRaised: s.total_raised || 0,
              totalDonors: s.total_donors || 0,
              activeCampaigns: s.active_campaigns || 0,
              verifiedStatus: (user as any)['Verified Status'] || false
            });
            setAnalyticsData(s);
          }
        }

        // 3. Fetch recent donations
        const donationsRes = await donationsApi.getAll({ charity_id: charityId, limit: 10 });
        const rawDonations = (donationsRes.data as any)?.data || [];
        setDonations(rawDonations.map((d: any) => ({
          id: d.donation_id,
          donor: d.is_anonymous ? "Anonymous" : (d.donor?.name || "Kind Donor"),
          campaign: d.Campaign?.title || "Active Campaign",
          amount: parseFloat(d.amount),
          time: new Date(d.donation_date || d.created_at).toLocaleDateString()
        })));

        // 4. Fetch Report Data
        const reportRes = await charityApi.getReport(charityId);
        if (reportRes.data) {
          setReportData((reportRes.data as any).data);
        }

      } catch (err) {
        console.error("Failed to fetch charity dashboard data:", err);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoading, router]);

  // Helper for days left
  const getDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // RBAC will handle redirect
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {(user as any)['Verified Status'] && (
                    <Badge variant="outline" className="text-success border-success">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Charity Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ChangePasswordDialog user={user} onSuccess={() => { }} />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <DeleteAccountDialog />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CreateCampaignDialog user={user} onSuccess={() => window.location.reload()} />
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
                    <p className="text-2xl font-bold">${(stats.totalRaised || 0).toLocaleString()}</p>
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
                    <p className="text-2xl font-bold">{(stats.totalDonors || 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
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
                    <p className="text-sm text-muted-foreground">Verified Status</p>
                    <div className="flex items-center gap-1">
                      {stats.verifiedStatus ? (
                        <Badge variant="outline" className="text-success border-success px-1 py-0 h-5">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="text-warning border-warning px-1 py-0 h-5">Pending</Badge>
                      )}
                    </div>
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
                    {campaigns.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
                        <Heart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                        <p className="text-muted-foreground">No campaigns found</p>
                        <Button variant="link" className="mt-2">Create your first campaign</Button>
                      </div>
                    ) : campaigns.map((campaign) => {
                      const progress = (campaign.raised / campaign.goal) * 100;

                      return (
                        <div
                          key={campaign.id}
                          className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border p-4"
                        >
                          <div className="h-20 w-32 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                            <Heart className="h-8 w-8" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{campaign.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                                    {campaign.status}
                                  </Badge>
                                  {campaign.daysLeft > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
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
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
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
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                    {donations.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg border-dashed">
                        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">No donations yet</p>
                      </div>
                    ) : donations.map((donation) => (
                      <div
                        key={donation.id}
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
                          <p className="font-semibold text-success">${donation.amount.toLocaleString()}</p>
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
                  <CardDescription>View detailed performance metrics and monthly insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Monthly Report Summary */}
                    <div className="rounded-lg border p-6 bg-muted/20">
                      <div className="flex items-center gap-3 mb-6">
                        <Activity className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg">Monthly Report ({reportData?.month || "..."})</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Total Donations</span>
                          <span className="font-semibold">{reportData?.total_donations || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-semibold text-success">${(reportData?.total_amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Unique Donors</span>
                          <span className="font-semibold">{reportData?.unique_donors || 0}</span>
                        </div>
                        <Button className="w-full mt-2" variant="outline" onClick={() => toast({ title: "Coming Soon", description: "PDF export is being implemented." })}>
                          <FileText className="mr-2 h-4 w-4" />
                          Download PDF Report
                        </Button>
                      </div>
                    </div>

                    {/* Donor Analytics Summary */}
                    <div className="rounded-lg border p-6 bg-muted/20">
                      <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg">Donor Trends</h3>
                      </div>
                      <div className="space-y-4">
                        {analyticsData?.donation_trends?.map((item: any) => (
                          <div key={item.month} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.month}</span>
                              <span className="font-medium">${(item.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(item.amount / (analyticsData.total_raised || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {!analyticsData?.donation_trends?.length && <p className="text-muted-foreground text-sm py-4 text-center">No trend data available yet.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Performance Table */}
                  <div className="mt-6">
                    <h3 className="font-bold mb-4">Top Campaign Performance</h3>
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-3 p-3 bg-muted font-semibold text-sm">
                        <span>Campaign Title</span>
                        <span className="text-center">Progress (%)</span>
                        <span className="text-right">Amount Raised</span>
                      </div>
                      <div className="divide-y">
                        {analyticsData?.campaign_performance?.map((cp: any) => (
                          <div key={cp.title} className="grid grid-cols-3 p-3 text-sm items-center">
                            <span className="truncate">{cp.title}</span>
                            <div className="px-4">
                              <Progress value={cp.target > 0 ? (cp.raised / cp.target) * 100 : 0} className="h-2" />
                            </div>
                            <span className="text-right font-medium">${(cp.raised || 0).toLocaleString()}</span>
                          </div>
                        ))}
                        {!analyticsData?.campaign_performance?.length && <p className="p-4 text-center text-muted-foreground">No campaign data available.</p>}
                      </div>
                    </div>
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

