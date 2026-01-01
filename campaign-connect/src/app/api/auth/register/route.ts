import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
const bcrypt = require('bcryptjs');

// POST /api/auth/register - User registration
export async function POST(request: Request) {
  try {
    console.log('Register API called');
    const body = await request.json();
    console.log('Request body:', { ...body, password: '***' });
    const { email, password, name, phone, accountType, orgName, registrationNumber } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // For donor accounts, name should be provided (concatenated from first + last name)
    if (accountType === "donor") {
      if (!name || name.trim() === "") {
        return NextResponse.json(
          { error: "Name is required for donor accounts" },
          { status: 400 }
        );
      }
    }

    if (accountType === "charity" && !orgName) {
      return NextResponse.json(
        { error: "Organization name is required for charity accounts" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    let userData;
    let tableName;

    if (accountType === "donor") {
      // Check if email already exists
      const { data: existingDonor } = await supabase
        .from('donor')
        .select('email')
        .eq('email', email)
        .single();

      if (existingDonor) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Insert into donor table
      const { data: donor, error: donorError } = await supabase
        .from('donor')
        .insert({
          name,
          email,
          password_hash: passwordHash,
          phone: phone || null,
        })
        .select()
        .single();

      if (donorError) {
        console.error('Donor creation error:', donorError);
        return NextResponse.json(
          { error: "Failed to create donor account", details: donorError.message },
          { status: 500 }
        );
      }

      userData = donor;
      tableName = 'donor';
    } else {
      // Check if email already exists
      const { data: existingCharity } = await supabase
        .from('charities')
        .select('email')
        .eq('email', email)
        .single();

      if (existingCharity) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Insert into charities table
      const { data: charity, error: charityError } = await supabase
        .from('charities')
        .insert({
          name: orgName,
          email,
          password_hash: passwordHash,
          phone: phone || null,
          registration_number: registrationNumber || null,
          is_verified: false,
        })
        .select()
        .single();

      if (charityError) {
        console.error('Charity creation error:', charityError);
        return NextResponse.json(
          { error: "Failed to create charity account", details: charityError.message },
          { status: 500 }
        );
      }

      userData = charity;
      tableName = 'charities';
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          ...userData,
          accountType,
        },
      },
      { 
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "Registration failed" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

