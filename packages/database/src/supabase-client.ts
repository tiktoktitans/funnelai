import { createClient } from '@supabase/supabase-js';

// Use the working Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://eqbinweqqfnobxepkuyp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions that work directly with Supabase
export const db = {
  async createUser(email: string, name: string) {
    const { data, error } = await supabase
      .from('User')
      .insert({ email, name })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUser(email: string) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createProject(project: any) {
    const { data, error } = await supabase
      .from('Project')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('Project')
      .select(`
        *,
        builds:Build(*)
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProjectBySlug(slug: string) {
    const { data, error } = await supabase
      .from('Project')
      .select(`
        *,
        specs:Spec(*),
        integrations:Integration(*),
        builds:Build(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async createSpec(spec: any) {
    const { data, error } = await supabase
      .from('Spec')
      .insert(spec)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSpec(id: string, updates: any) {
    const { data, error } = await supabase
      .from('Spec')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createBuild(build: any) {
    const { data, error } = await supabase
      .from('Build')
      .insert(build)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBuild(id: string, updates: any) {
    const { data, error } = await supabase
      .from('Build')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};