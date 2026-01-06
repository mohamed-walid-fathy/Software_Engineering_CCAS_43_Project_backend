"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { campaignsApi } from "@/lib/api";
import { Search, SlidersHorizontal, Grid, List, Loader2 } from "lucide-react";

const categories = ["All Categories", "Medical", "Education", "Emergency", "Environment", "Community", "Technology"];

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

export default function Browse() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignsApi.getAll();
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
        setCampaigns(mappedCampaigns);
      } catch (error) {
        console.error("Failed to load campaigns", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "most-funded":
        return (b.currentAmount) - (a.currentAmount);
      case "ending-soon":
        return (a.daysLeft || 0) - (b.daysLeft || 0);
      // case "most-donors":
      //     return (b.donorCount || 0) - (a.donorCount || 0);
      default:
        return 0; // Default to API order (likely newest/id)
    }
  });

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold md:text-4xl">Browse Campaigns</h1>
            <p className="mt-2 text-muted-foreground">
              Discover causes that matter and make a difference today
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="most-funded">Most Funded</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  {/* <SelectItem value="most-donors">Most Donors</SelectItem> */}
                </SelectContent>
              </Select>
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Loading campaigns...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {sortedCampaigns.length} campaign{sortedCampaigns.length !== 1 ? "s" : ""}
                </p>
              </div>

              {sortedCampaigns.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col gap-4"
                  }
                >
                  {sortedCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">No campaigns found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
