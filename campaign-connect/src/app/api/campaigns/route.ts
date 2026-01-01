import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/campaigns - Fetch all campaigns
export async function GET(request: Request) {
  try {
    const supabase = createServerClient();
    
    // Fetch campaigns from Supabase
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        charity:charities(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: "Failed to fetch campaigns", details: error.message },
        { status: 500 }
      );
    }

    // Calculate donor count for each campaign
    const campaignsWithDonorCount = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        const { count } = await supabase
          .from('donations')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);
        
        return {
          ...campaign,
          donorCount: count || 0,
        };
      })
    );

    return NextResponse.json(
      { campaigns: campaignsWithDonorCount }, 
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    // Validate required fields
    const { title, description, goal_amount, category, charity_id, days_left, image } = body;
    
    if (!title || !description || !goal_amount || !category || !charity_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert campaign into Supabase
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        title,
        description,
        goal_amount: parseFloat(goal_amount),
        current_amount: 0,
        category,
        charity_id,
        days_left: days_left || 30,
        image: image || null,
        is_urgent: body.is_urgent || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: "Failed to create campaign", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "Campaign created successfully", campaign },
      { 
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

