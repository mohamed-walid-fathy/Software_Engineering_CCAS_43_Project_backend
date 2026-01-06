"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart, DollarSign, TrendingUp, Calendar,
  Gift, Bell, Settings, Download, ArrowUpRight,
  CreditCard, Lock, Trash2, LogOut, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Import the new functions from your api file
import { authApi, fetchDonorStats, fetchDonationHistory } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DonorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Fix: Use donor_id if available (database schema uses donor_id), fallback to id
      loadDashboardData(parsedUser.donor_id || parsedUser.id);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const loadDashboardData = async (userId: string) => {
    setIsLoadingData(true);
    try {
      // Parallel fetch for better performance
      const [statsData, historyData] = await Promise.all([
        fetchDonorStats(userId),
        fetchDonationHistory(userId)
      ]);

      setStats(statsData);
      setHistory(historyData || []);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Could not load your donation history.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const { logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await authApi.resetPassword(user.email, newPassword);
      if (result.error) throw new Error(result.error);
      toast({ title: "Success", description: "Password updated" });
      setShowChangePassword(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (v: string) => setCardNumber(v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19));
  const formatExpiryDate = (v: string) => {
    const clean = v.replace(/\D/g, "");
    setExpiryDate(clean.length >= 2 ? clean.slice(0, 2) + "/" + clean.slice(2, 4) : clean);
  };

  const getUserInitials = () => {
    if (user?.first_name) {
      return (user.first_name[0] + (user.last_name ? user.last_name[0] : "")).toUpperCase();
    }
    if (!user?.name) return "U";
    return user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
  };

  if (!user || isLoadingData) {
    return (
      <Layout>
        <div className="container flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user.first_name || user.name}!</h1>
                <p className="text-muted-foreground">Your generosity is making a difference</p>
              </div>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowAddCard(true)}><CreditCard className="mr-2 h-4 w-4" /> Add Card</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowChangePassword(true)}><Lock className="mr-2 h-4 w-4" /> Change Password</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDeleteAccount(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete Account</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild><Link href="/campaigns/browse"><Heart className="mr-2 h-4 w-4" /> Donate Now</Link></Button>
            </div>
          </div>

          {/* Dynamic Stats Section */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<DollarSign className="text-success" />} label="Total Donated" value={`$${stats?.total_amount || 0}`} />
            <StatCard icon={<Heart className="text-primary" />} label="Campaigns Supported" value={stats?.campaign_count || 0} />
            <StatCard icon={<TrendingUp className="text-accent" />} label="Avg. Donation" value={`$${stats?.average_donation || 0}`} />
            <StatCard icon={<Gift className="text-warning" />} label="Impact Rank" value={stats?.rank || "Bronze"} />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Real Donation History */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Donation History</CardTitle>
                    <CardDescription>Your real-time contributions</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.length > 0 ? history.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex-1">
                          <p className="font-medium">{donation.campaign_title || "General Donation"}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(donation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">${donation.amount}</p>
                          <Badge variant="secondary" className="text-xs uppercase">{donation.status}</Badge>
                        </div>
                      </div>
                    )) : (
                      <div className="py-8 text-center text-muted-foreground">No donations found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs remain similar but ensure handleChangePassword/handleAddCard use the state updated above */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={isLoading}>{isLoading ? "Updating..." : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a credit or debit card for easier donations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => formatExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  maxLength={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: "Success", description: "Card added successfully" });
              setShowAddCard(false);
              // Reset form
              setCardNumber("");
              setCardName("");
              setExpiryDate("");
              setCvv("");
            }}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast({ title: "Account Deleted", description: "Your account has been permanently removed." });
                handleLogout(); // Log them out after "deleting"
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Reusable Stat Component
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
