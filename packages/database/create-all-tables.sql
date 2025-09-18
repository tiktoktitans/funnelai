-- Create ENUMS
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'BUILDING', 'DEPLOYED', 'FAILED');
CREATE TYPE "SpecType" AS ENUM ('LANDING', 'WEBINAR', 'VSL', 'THANKYOU', 'APPLICATION', 'EMAILS', 'SMS');
CREATE TYPE "IntegrationProvider" AS ENUM ('CALENDLY', 'RESEND', 'TWILIO', 'PIXELS', 'VERCEL', 'GITHUB');
CREATE TYPE "BuildStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');
CREATE TYPE "FormKind" AS ENUM ('OPTIN', 'APPLICATION', 'CONTACT', 'SURVEY');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create Project table
CREATE TABLE "Project" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL DEFAULT 'webinar',
    "templateVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "repoUrl" TEXT,
    "vercelUrl" TEXT,
    "brandColors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- Create Spec table
CREATE TABLE "Spec" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL,
    "type" "SpecType" NOT NULL,
    "input" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "structure" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spec_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Spec_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Spec_projectId_type_key" ON "Spec"("projectId", "type");
CREATE INDEX "Spec_projectId_idx" ON "Spec"("projectId");

-- Create Integration table
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "config" JSONB NOT NULL,
    "encryptedConfig" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Integration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Integration_projectId_provider_key" ON "Integration"("projectId", "provider");
CREATE INDEX "Integration_projectId_idx" ON "Integration"("projectId");

-- Create Build table
CREATE TABLE "Build" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL,
    "status" "BuildStatus" NOT NULL,
    "branch" TEXT,
    "commitSha" TEXT,
    "vercelDeployUrl" TEXT,
    "logs" TEXT,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Build_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Build_projectId_idx" ON "Build"("projectId");
CREATE INDEX "Build_status_idx" ON "Build"("status");
CREATE INDEX "Build_createdAt_idx" ON "Build"("createdAt");

-- Create Form table
CREATE TABLE "Form" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL,
    "kind" "FormKind" NOT NULL,
    "name" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "destination" JSONB,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Form_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Form_projectId_kind_key" ON "Form"("projectId", "kind");
CREATE INDEX "Form_projectId_idx" ON "Form"("projectId");

-- Create Submission table
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "formId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "source" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Submission_formId_idx" ON "Submission"("formId");
CREATE INDEX "Submission_projectId_idx" ON "Submission"("projectId");
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- Create ApiKey table
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- Add update trigger for updatedAt fields
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON "Project" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_spec_updated_at BEFORE UPDATE ON "Spec" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_integration_updated_at BEFORE UPDATE ON "Integration" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_form_updated_at BEFORE UPDATE ON "Form" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Spec" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Build" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Form" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users

-- User policies
CREATE POLICY "Users can view their own data" ON "User"
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON "User"
    FOR UPDATE USING (auth.uid()::text = id);

-- Project policies
CREATE POLICY "Users can view their own projects" ON "Project"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create their own projects" ON "Project"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own projects" ON "Project"
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own projects" ON "Project"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Spec policies (inherit from project)
CREATE POLICY "Users can view specs for their projects" ON "Spec"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Project"
            WHERE "Project".id = "Spec"."projectId"
            AND "Project"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage specs for their projects" ON "Spec"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Project"
            WHERE "Project".id = "Spec"."projectId"
            AND "Project"."userId" = auth.uid()::text
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can manage integrations for their projects" ON "Integration"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Project"
            WHERE "Project".id = "Integration"."projectId"
            AND "Project"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can view builds for their projects" ON "Build"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Project"
            WHERE "Project".id = "Build"."projectId"
            AND "Project"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage forms for their projects" ON "Form"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Project"
            WHERE "Project".id = "Form"."projectId"
            AND "Project"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can view submissions for their projects" ON "Submission"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Project"
            WHERE "Project".id = "Submission"."projectId"
            AND "Project"."userId" = auth.uid()::text
        )
    );

-- Service role bypass policies (for backend operations)
CREATE POLICY "Service role bypass" ON "User"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass projects" ON "Project"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass specs" ON "Spec"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass integrations" ON "Integration"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass builds" ON "Build"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass forms" ON "Form"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass submissions" ON "Submission"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass apikeys" ON "ApiKey"
    FOR ALL USING (auth.role() = 'service_role');