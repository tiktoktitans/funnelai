import { NextResponse } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' });
    }

    const anthropic = createAnthropic({
      apiKey: apiKey,
    });

    const response = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt: 'Say hello in 5 words or less',
      maxTokens: 50,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      response: response.text,
      runtime: 'nodejs',
      sdk: 'vercel-ai',
      hasKey: true
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      status: error.status,
      type: error.constructor.name,
      runtime: 'nodejs',
      sdk: 'vercel-ai',
      hasKey: !!process.env.ANTHROPIC_API_KEY
    });
  }
}