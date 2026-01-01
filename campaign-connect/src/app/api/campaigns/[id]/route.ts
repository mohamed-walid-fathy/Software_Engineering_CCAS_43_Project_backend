import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/campaigns/[id] - Get a specific campaign
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();
    
    // Fetch campaign from Supabase
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        charity:charities(name, email, id)
      `)
      .eq('id', id)
      .single();

    if (error || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get donor count
    const { count } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', id);

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        donorCount: count || 0,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const supabase = createServerClient();
    
    // Update campaign in Supabase
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update campaign", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "Campaign updated successfully", campaign },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();
    
    // Delete campaign from Supabase
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete campaign", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "Campaign deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

