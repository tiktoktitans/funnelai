import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Say hello'
      }]
    });

    const text = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'No response';

    return NextResponse.json({
      success: true,
      response: text,
      runtime: 'nodejs',
      hasKey: true
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      status: error.status,
      type: error.constructor.name,
      runtime: 'nodejs',
      hasKey: !!process.env.ANTHROPIC_API_KEY
    });
  }
}