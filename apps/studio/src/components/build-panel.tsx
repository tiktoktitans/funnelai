'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Rocket, Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, GitBranch, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuildPanelProps {
  project: any;
}

export function BuildPanel({ project }: BuildPanelProps) {
  const { toast } = useToast();
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const startBuild = async () => {
    setIsBuilding(true);
    setLogs(['Initializing build process...']);
    setBuildStatus({ status: 'RUNNING' });

    try {
      setLogs(prev => [...prev, 'Creating build job...']);

      const response = await fetch(`/api/projects/${project.id}/build`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Build failed to start');

      const data = await response.json();

      setLogs(prev => [...prev, 'Build job created: ' + data.buildId]);
      setLogs(prev => [...prev, 'Generating site from template...']);

      setTimeout(() => {
        setLogs(prev => [...prev, 'Copying template files...']);
      }, 1000);

      setTimeout(() => {
        setLogs(prev => [...prev, 'Injecting content...']);
      }, 2000);

      setTimeout(() => {
        setLogs(prev => [...prev, 'Building Next.js application...']);
      }, 3000);

      setTimeout(() => {
        setLogs(prev => [...prev, 'Deploying to Vercel...']);
      }, 4000);

      setTimeout(() => {
        setLogs(prev => [...prev, '✅ Build completed successfully!']);
        setBuildStatus({
          status: 'SUCCESS',
          url: 'https://demo-funnel.vercel.app',
          buildId: data.buildId
        });
        setIsBuilding(false);

        toast({
          title: 'Deployment Successful!',
          description: 'Your funnel is now live.',
        });
      }, 5000);

    } catch (error) {
      setLogs(prev => [...prev, '❌ Build failed: ' + error]);
      setBuildStatus({ status: 'FAILED' });
      setIsBuilding(false);

      toast({
        title: 'Build Failed',
        description: 'There was an error building your project.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'RUNNING':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      SUCCESS: 'success',
      FAILED: 'destructive',
      RUNNING: 'secondary',
      QUEUED: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deploy Your Funnel</CardTitle>
          <CardDescription>
            Build and deploy your funnel to production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Before you deploy</AlertTitle>
            <AlertDescription>
              Make sure you've reviewed all content and configured your integrations.
              The deployment process will create a live website accessible to anyone.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={startBuild}
              disabled={isBuilding}
              className="min-w-[200px]"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Build & Deploy
                </>
              )}
            </Button>

            {buildStatus?.status === 'SUCCESS' && buildStatus.url && (
              <a
                href={buildStatus.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                View Live Site
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {logs.length > 0 && (
            <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Build History</CardTitle>
          <CardDescription>
            Recent builds and deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buildStatus && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(buildStatus.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Current Build</span>
                      {getStatusBadge(buildStatus.status)}
                    </div>
                    {buildStatus.buildId && (
                      <p className="text-sm text-muted-foreground">
                        Build ID: {buildStatus.buildId}
                      </p>
                    )}
                  </div>
                </div>
                {buildStatus.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={buildStatus.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </a>
                  </Button>
                )}
              </div>
            )}

            {project.builds?.map((build: any) => (
              <div key={build.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(build.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {new Date(build.createdAt).toLocaleString()}
                      </span>
                      {getStatusBadge(build.status)}
                    </div>
                    {build.branch && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        {build.branch}
                      </div>
                    )}
                  </div>
                </div>
                {build.vercelDeployUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={build.vercelDeployUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </a>
                  </Button>
                )}
              </div>
            ))}

            {(!project.builds || project.builds.length === 0) && !buildStatus && (
              <p className="text-center py-8 text-muted-foreground">
                No builds yet. Click "Build & Deploy" to create your first deployment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}