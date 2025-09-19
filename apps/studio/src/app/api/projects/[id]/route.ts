import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@funnelai/database/src/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First try to get by ID
    const { data, error } = await supabase
      .from('Project')
      .select(`
        *,
        specs:Spec(*),
        integrations:Integration(*),
        builds:Build(*),
        forms:Form(*)
      `)
      .eq('id', params.id)
      .single();

    if (!error && data) {
      return NextResponse.json(data);
    }

    // If not found by ID, try by slug
    try {
      const projectBySlug = await db.getProjectBySlug(params.id);
      if (projectBySlug) {
        return NextResponse.json(projectBySlug);
      }
    } catch (slugError) {
      // Slug not found, continue
    }

    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('Project')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json(
      { error: 'Failed to update project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('Project')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}