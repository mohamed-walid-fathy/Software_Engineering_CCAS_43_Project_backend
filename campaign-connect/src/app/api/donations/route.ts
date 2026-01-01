import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST /api/donations - Create a donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign_id, amount, donor_id, is_anonymous, payment_method } = body;

    if (!campaign_id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation data" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // TODO: Process payment (Stripe, PayPal, etc.)
    // const payment = await stripe.charges.create({ ... });
    // For now, we'll skip payment processing
    
    // Save donation to Supabase
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id,
        donor_id,
        amount: parseFloat(amount),
        is_anonymous: is_anonymous || false,
        status: 'completed', // or 'pending' if payment needs processing
        payment_method: payment_method || 'stripe',
      })
      .select()
      .single();

    if (donationError) {
      console.error('Donation error:', donationError);
      return NextResponse.json(
        { error: "Failed to create donation", details: donationError.message },
        { status: 500 }
      );
    }

    // Update campaign total amount
    const { error: updateError } = await supabase.rpc('increment_campaign_amount', {
      campaign_id_param: campaign_id,
      amount_param: parseFloat(amount),
    });

    // If RPC function doesn't exist, use update query
    if (updateError) {
      // Get current amount
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('current_amount')
        .eq('id', campaign_id)
        .single();

      const newAmount = (campaign?.current_amount || 0) + parseFloat(amount);

      await supabase
        .from('campaigns')
        .update({ current_amount: newAmount })
        .eq('id', campaign_id);
    }

    return NextResponse.json(
      {
        message: "Donation processed successfully",
        donation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    );
  }
}

// GET /api/donations - Get donations (with optional filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id");
    const donorId = searchParams.get("donor_id");

    const supabase = createServerClient();

    let query = supabase
      .from('donations')
      .select(`
        *,
        campaign:campaigns(title, id),
        donor:donor(name, email)
      `)
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (donorId) {
      query = query.eq('donor_id', donorId);
    }

    const { data: donations, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch donations", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ donations: donations || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

