import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./ProgressBar";
import { Heart, Users, Clock } from "lucide-react";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  currentAmount: number;
  goalAmount: number;
  donorCount: number;
  daysLeft: number;
  category: string;
  charity: string;
  isUrgent?: boolean;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {campaign.category}
          </Badge>
          {campaign.isUrgent && (
            <Badge className="bg-warning text-warning-foreground">
              Urgent
            </Badge>
          )}
        </div>
        <button className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <CardContent className="p-5">
        <p className="mb-1 text-sm text-muted-foreground">{campaign.charity}</p>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          <Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link>
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {campaign.description}
        </p>
        <ProgressBar
          current={campaign.currentAmount}
          goal={campaign.goalAmount}
          size="sm"
        />
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {campaign.donorCount} donors
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {campaign.daysLeft} days left
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/donate/${campaign.id}`}>Donate Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
