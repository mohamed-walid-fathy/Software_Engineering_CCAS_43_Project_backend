"use client";

import { useState, useEffect } from "react";
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
  TrendingUp, Activity, Eye, Ban, Check, Loader2, PlusCircle,
  FileText, Info, Heart, Settings, LogOut, KeyRound, Lock
} from "lucide-react";
import { adminApi, charityApi, authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeUsers: 0,
    verifiedCharities: 0,
    pendingReviews: 0
  });
  const [pendingCharities, setPendingCharities] = useState<any[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<any[]>([]);
  const [flaggedCampaigns, setFlaggedCampaigns] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCharityReviewOpen, setIsCharityReviewOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const { logout } = useAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Stats
        try {
          const statsRes = await adminApi.getStats();
          if (statsRes.data?.data) {
            const s = (statsRes.data as any).data;
            setStats({
              totalRaised: s.total_donation_amount || 0,
              activeUsers: s.active_users || 0,
              verifiedCharities: s.verified_charities || 0,
              pendingReviews: s.pending_reviews || 0
            });
          }
        } catch (e) {
          console.error("Failed to fetch admin stats", e);
        }

        // 2. Fetch Pending Charities
        try {
          // Filter out rejected charities client-side if API doesn't support it, or rely on API
          const charitiesRes = await charityApi.getAll({ verified: false });
          const allPending = (charitiesRes.data as any)?.data || [];
          // Filter out those with rejection_reason
          setPendingCharities(allPending.filter((c: any) => !c.rejection_reason));
        } catch (e) {
          console.error("Failed to fetch pending charities", e);
        }

        // 3. Fetch Flagged Campaigns
        try {
          const flaggedRes = await adminApi.getFlaggedCampaigns();
          setFlaggedCampaigns((flaggedRes.data as any)?.data || []);
        } catch (e) {
          console.error("Failed to fetch flagged campaigns", e);
        }

        // 4. Fetch Pending Campaigns
        try {
          const pendingCampaignsRes = await adminApi.getPendingCampaigns();
          setPendingCampaigns((pendingCampaignsRes.data as any)?.data || []);
        } catch (e) {
          console.error("Failed to fetch pending campaigns", e);
        }

        // 5. Fetch Activity
        try {
          const activityRes = await adminApi.getActivity();
          const rawActivity = (activityRes.data as any)?.data || [];
          setRecentActivity((rawActivity || []).map((a: any) => ({
            type: a.action?.includes('flag') ? 'flag' : a.action?.includes('approve') ? 'approval' : 'admin',
            message: `${(a.action || 'action').replace(/_/g, ' ')} ${a.target_id ? `on ${a.target_id}` : ''}`,
            time: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Just now'
          })));
        } catch (e) {
          console.error("Failed to fetch activity", e);
        }

      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading system administration...</p>
        </div>
      </Layout>
    );
  }

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
              <div className="relative group">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Account
                </Button>
                <div className="absolute right-0 top-full mt-2 hidden w-48 flex-col rounded-lg border bg-card p-1 shadow-lg group-hover:flex z-50">
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </button>
                  <button
                    onClick={async () => {
                      await authApi.logout();
                      logout();
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-[200px]" />
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
                    <p className="text-2xl font-bold">${stats.totalRaised.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold">{stats.verifiedCharities}</p>
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
                    <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending-charities" className="gap-2">
                <Shield className="h-4 w-4" />
                Charities
                <Badge variant="secondary" className="ml-1">{pendingCharities.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending-campaigns" className="gap-2">
                <PlusCircle className="h-4 w-4 text-primary" />
                Campaigns
                <Badge variant="secondary" className="ml-1">{pendingCampaigns.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Flagged
                <Badge variant="destructive" className="ml-1">{flaggedCampaigns.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending-charities">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Charity Approvals</CardTitle>
                  <CardDescription>Review and verify new charity registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCharities.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg border-dashed">
                        <CheckCircle className="h-10 w-10 text-success/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">No pending approvals</p>
                      </div>
                    ) : pendingCharities.map((charity) => (
                      <div
                        key={charity.Charity_id || charity.id}
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
                            Status: {charity['Verified Status'] ? 'Verified' : 'Pending'} • Applied: {new Date(charity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCharity(charity);
                              setIsCharityReviewOpen(true);
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Review
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={async () => {
                              try {
                                setIsApproving(true);
                                const res = await charityApi.approve(charity.Charity_id || charity.id);
                                if (res.error) throw new Error(res.error);
                                window.location.reload();
                              } catch (e: any) {
                                alert(e.message);
                              } finally {
                                setIsApproving(false);
                              }
                            }}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason === null) return;
                              try {
                                const res = await charityApi.reject(charity.Charity_id || charity.id, reason);
                                if (res.error) throw new Error(res.error);
                                window.location.reload();
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                          >
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

            <TabsContent value="pending-campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Campaign Approvals</CardTitle>
                  <CardDescription>Review and authorize new fundraising initiatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCampaigns.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg border-dashed">
                        <CheckCircle className="h-10 w-10 text-success/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">No pending campaigns</p>
                      </div>
                    ) : pendingCampaigns.map((campaign) => (
                      <div
                        key={campaign.campaign_id || campaign.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{campaign.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                          <div className="flex gap-4 mt-2">
                            <Badge variant="outline">Target: ${parseFloat(campaign.target_amount).toLocaleString()}</Badge>
                            <Badge variant="outline">Charity: {campaign.Charity?.name || 'Unknown'}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setIsReviewOpen(true);
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Review
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            disabled={isApproving}
                            onClick={async () => {
                              try {
                                setIsApproving(true);
                                const res = await adminApi.approveCampaign(campaign.campaign_id);
                                if (res.error) throw new Error(res.error);
                                window.location.reload();
                              } catch (e: any) {
                                alert(e.message);
                              } finally {
                                setIsApproving(false);
                              }
                            }}
                          >
                            {isApproving ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-1 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              const reason = prompt("Enter rejection reason:");
                              if (!reason) return;
                              try {
                                const res = await adminApi.rejectCampaign(campaign.campaign_id, reason);
                                if (res.error) throw new Error(res.error);
                                window.location.reload();
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                          >
                            <Ban className="mr-1 h-4 w-4" />
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
                    {flaggedCampaigns.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg border-dashed">
                        <CheckCircle className="h-10 w-10 text-success/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">No flagged campaigns</p>
                      </div>
                    ) : flaggedCampaigns.map((flag) => (
                      <div
                        key={flag.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                      >
                        <AlertTriangle className="h-8 w-8 text-warning" />
                        <div className="flex-1">
                          <p className="font-semibold">{flag.Campaign?.title || 'Unknown Campaign'}</p>
                          <p className="text-sm text-muted-foreground">Reason: {flag.reason}</p>
                          <Badge variant="destructive" className="mt-2">
                            Flagged by {flag.flagged_by}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Flagged: {new Date(flag.flagged_at).toLocaleDateString()}
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
                    {recentActivity.length === 0 ? (
                      <p className="text-center py-12 text-muted-foreground">No recent activity</p>
                    ) : recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-lg border p-4"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.type === "approval" ? "bg-success/10" :
                          activity.type === "flag" ? "bg-warning/10" :
                            "bg-primary/10"
                          }`}>
                          {activity.type === "approval" && <CheckCircle className="h-5 w-5 text-success" />}
                          {activity.type === "flag" && <AlertTriangle className="h-5 w-5 text-warning" />}
                          {activity.type === "admin" && <Shield className="h-5 w-5 text-primary" />}
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

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              Campaign Review
            </DialogTitle>
            <DialogDescription>
              Carefully review the campaign details before taking action.
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      General Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Title:</span> {selectedCampaign.title}</p>
                    <p><span className="text-muted-foreground">Category:</span> {selectedCampaign.category}</p>
                    <p><span className="text-muted-foreground">End Date:</span> {selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString() : 'No date set'}</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Target Goal:</span> ${parseFloat(selectedCampaign.target_amount).toLocaleString()}</p>
                    <p><span className="text-muted-foreground">Charity:</span> {selectedCampaign.Charity?.name}</p>
                    <p><span className="text-muted-foreground">Charity Email:</span> {selectedCampaign.Charity?.email}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Description
                </h4>
                <div className="p-4 rounded-lg bg-card border whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedCampaign.description}
                </div>
              </div>

              {selectedCampaign.image && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Campaign Media
                  </h4>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={selectedCampaign.image}
                      alt={selectedCampaign.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Close
            </Button>
            <Button
              variant="default"
              disabled={isApproving}
              onClick={async () => {
                if (!selectedCampaign) return;
                try {
                  setIsApproving(true);
                  const res = await adminApi.approveCampaign(selectedCampaign.campaign_id);
                  if (res.error) throw new Error(res.error);
                  setIsReviewOpen(false);
                  window.location.reload();
                } catch (e: any) {
                  alert(e.message);
                } finally {
                  setIsApproving(false);
                }
              }}
            >
              {isApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Charity Review Dialog */}
      <Dialog open={isCharityReviewOpen} onOpenChange={setIsCharityReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="h-6 w-6 text-primary" />
              Charity Review
            </DialogTitle>
            <DialogDescription>
              Verify the organization details before approval.
            </DialogDescription>
          </DialogHeader>

          {selectedCharity && (
            <div className="space-y-6 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Organization Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedCharity.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedCharity.email}</p>
                    <p><span className="text-muted-foreground">Applied:</span> {new Date(selectedCharity.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Status:</span> {selectedCharity['Verified Status'] ? 'Verified' : 'Pending'}</p>
                    <p><span className="text-muted-foreground">ID:</span> {selectedCharity.Charity_id || selectedCharity.id}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Description
                </h4>
                <div className="p-4 rounded-lg bg-card border whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedCharity.description || 'No description provided.'}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setIsCharityReviewOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!selectedCharity) return;
                  const reason = prompt("Enter rejection reason:");
                  if (reason === null) return;
                  try {
                    setIsApproving(true);
                    const res = await charityApi.reject(selectedCharity.Charity_id || selectedCharity.id, reason);
                    if (res.error) throw new Error(res.error);
                    setIsCharityReviewOpen(false);
                    window.location.reload();
                  } catch (e: any) {
                    alert(e.message);
                  } finally {
                    setIsApproving(false);
                  }
                }}
              >
                Reject
              </Button>
              <Button
                variant="default"
                disabled={isApproving}
                onClick={async () => {
                  if (!selectedCharity) return;
                  try {
                    setIsApproving(true);
                    const res = await charityApi.approve(selectedCharity.Charity_id || selectedCharity.id);
                    if (res.error) throw new Error(res.error);
                    setIsCharityReviewOpen(false);
                    window.location.reload();
                  } catch (e: any) {
                    alert(e.message);
                  } finally {
                    setIsApproving(false);
                  }
                }}
              >
                {isApproving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Approve Charity
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Change Password Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Administrator Password
            </DialogTitle>
            <DialogDescription>
              Update your administrative credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={passwordForm.old}
                onChange={(e) => setPasswordForm({ ...passwordForm, old: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (passwordForm.new !== passwordForm.confirm) {
                  alert("Passwords do not match!");
                  return;
                }
                const userEmail = "mahmoud"; // System defaults to admin name
                try {
                  const res = await authApi.changePassword({
                    email: userEmail,
                    oldPassword: passwordForm.old,
                    newPassword: passwordForm.new
                  });
                  if (res.error) throw new Error(res.error);
                  alert("Password changed successfully!");
                  setIsPasswordModalOpen(false);
                  setPasswordForm({ old: '', new: '', confirm: '' });
                } catch (e: any) {
                  alert(e.message);
                }
              }}
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

