import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { ServerClient } from 'postmark';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey, fromEmail } = await req.json();

    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required credentials' },
        { status: 400 }
      );
    }

    // Test Postmark connection
    try {
      const client = new ServerClient(apiKey);

      // Test the API key by fetching server info
      const serverInfo = await client.getServer();

      // Verify the from email is valid
      const senders = await client.getSenderSignatures();
      const validSender = senders.SenderSignatures.find(
        sender => sender.EmailAddress.toLowerCase() === fromEmail.toLowerCase() && sender.Confirmed
      );

      if (!validSender) {
        return NextResponse.json(
          {
            error: 'From email not verified in Postmark. Please verify this sender signature in your Postmark account.'
          },
          { status: 400 }
        );
      }

      // Connection successful
      return NextResponse.json({
        success: true,
        message: 'Postmark connection successful',
        serverName: serverInfo.Name,
        senderEmail: validSender.EmailAddress,
        senderName: validSender.Name
      });

    } catch (postmarkError: any) {
      console.error('Postmark test failed:', postmarkError);

      if (postmarkError.code === 401) {
        return NextResponse.json(
          { error: 'Invalid Postmark API key' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to connect to Postmark: ' + (postmarkError.message || 'Unknown error') },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Failed to test Postmark:', error);
    return NextResponse.json(
      { error: 'Failed to test Postmark connection' },
      { status: 500 }
    );
  }
}