'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentEditor } from '@/components/content-editor';
import { LivePreview } from '@/components/live-preview';
import { BuildPanel } from '@/components/build-panel';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Eye, Edit3, Settings, BarChart } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (type: string, content: any) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/spec/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to save content');

      toast({
        title: 'Saved',
        description: 'Content updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Status: <span className="font-medium">{project.status}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a href={`/projects/${params.id}/preview`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Generated Content
            </a>
          </Button>
          <Button>
            <Rocket className="mr-2 h-4 w-4" />
            Build & Deploy
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content">
            <Edit3 className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Settings className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="build">
            <Rocket className="mr-2 h-4 w-4" />
            Build & Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium">Created:</dt>
                    <dd className="text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Template:</dt>
                    <dd className="text-muted-foreground">{project.templateKey}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Version:</dt>
                    <dd className="text-muted-foreground">{project.templateVersion}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                {project.vercelUrl ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Live at:</p>
                    <a
                      href={project.vercelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {project.vercelUrl}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not deployed yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Builds</CardTitle>
              </CardHeader>
              <CardContent>
                {project.builds?.length > 0 ? (
                  <div className="space-y-2">
                    {project.builds.slice(0, 3).map((build: any) => (
                      <div key={build.id} className="text-sm">
                        <span className="font-medium">{build.status}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(build.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No builds yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Content</CardTitle>
                <CardDescription>
                  Customize your funnel content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentEditor
                  project={project}
                  onSave={handleSaveContent}
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See your changes in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LivePreview project={project} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your tools and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Calendly</h3>
                  <input
                    type="url"
                    placeholder="https://calendly.com/yourname"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tracking Pixels</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Facebook Pixel ID"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Google Analytics ID"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <Button>Save Integrations</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="build" className="mt-6">
          <BuildPanel project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}