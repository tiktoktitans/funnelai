-- FunnelAI Database Schema
-- Run this in your Supabase SQL Editor

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Project table
CREATE TABLE IF NOT EXISTS "Project" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'DRAFT' NOT NULL CHECK (status IN ('DRAFT', 'GENERATING', 'BUILDING', 'LIVE', 'ERROR')),
    "brandColors" JSONB DEFAULT '{}' NOT NULL,
    "deployUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Spec table
CREATE TABLE IF NOT EXISTS "Spec" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LANDING', 'VSL', 'WEBINAR', 'EMAILS', 'THANKYOU', 'APPLICATION')),
    input JSONB DEFAULT '{}' NOT NULL,
    content JSONB DEFAULT '{}' NOT NULL,
    structure JSONB DEFAULT '{}' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Spec_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("projectId", type)
);

-- Create Build table
CREATE TABLE IF NOT EXISTS "Build" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'BUILDING', 'SUCCESS', 'FAILED')),
    "deployUrl" TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Build_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Form table
CREATE TABLE IF NOT EXISTS "Form" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('OPTIN', 'APPLICATION', 'CONTACT')),
    destination JSONB DEFAULT '{}' NOT NULL,
    fields JSONB DEFAULT '[]' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Form_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Submission table
CREATE TABLE IF NOT EXISTS "Submission" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "formId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    data JSONB DEFAULT '{}' NOT NULL,
    source TEXT,
    ip TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");
CREATE INDEX IF NOT EXISTS "Project_slug_idx" ON "Project"(slug);
CREATE INDEX IF NOT EXISTS "Spec_projectId_idx" ON "Spec"("projectId");
CREATE INDEX IF NOT EXISTS "Build_projectId_idx" ON "Build"("projectId");
CREATE INDEX IF NOT EXISTS "Form_projectId_idx" ON "Form"("projectId");
CREATE INDEX IF NOT EXISTS "Submission_formId_idx" ON "Submission"("formId");
CREATE INDEX IF NOT EXISTS "Submission_projectId_idx" ON "Submission"("projectId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updatedAt columns
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON "Project"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spec_updated_at BEFORE UPDATE ON "Spec"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_updated_at BEFORE UPDATE ON "Form"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo user
INSERT INTO "User" (email, name)
VALUES ('demo@funnelai.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions (for Row Level Security - optional)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Spec" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Build" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Form" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for demo (allow all for now - customize as needed)
CREATE POLICY "Enable all access for authenticated users" ON "User"
    FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON "Project"
    FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON "Spec"
    FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON "Build"
    FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON "Form"
    FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON "Submission"
    FOR ALL USING (true);