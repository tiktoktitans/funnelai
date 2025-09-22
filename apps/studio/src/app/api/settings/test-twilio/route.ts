import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountSid, authToken, phoneNumber } = await req.json();

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required credentials' },
        { status: 400 }
      );
    }

    // Test Twilio connection
    try {
      const client = twilio(accountSid, authToken);

      // Try to fetch the phone number to verify it exists and credentials work
      const number = await client.incomingPhoneNumbers
        .list({ phoneNumber: phoneNumber, limit: 1 });

      if (number.length === 0) {
        return NextResponse.json(
          { error: 'Phone number not found in your Twilio account' },
          { status: 400 }
        );
      }

      // Connection successful
      return NextResponse.json({
        success: true,
        message: 'Twilio connection successful',
        phoneNumber: number[0].phoneNumber,
        capabilities: number[0].capabilities
      });

    } catch (twilioError: any) {
      console.error('Twilio test failed:', twilioError);

      if (twilioError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Twilio credentials' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to connect to Twilio: ' + twilioError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Failed to test Twilio:', error);
    return NextResponse.json(
      { error: 'Failed to test Twilio connection' },
      { status: 500 }
    );
  }
}