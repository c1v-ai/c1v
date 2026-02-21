import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjects } from '@/app/actions/projects';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import {
  FolderPlus,
  MessageSquare,
  FileText,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { WelcomeOnboarding } from '@/components/onboarding/welcome-onboarding';

// Landing page for non-authenticated users
function LandingPage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Create PRDs
                <span className="block text-accent">
                  with AI Assistance
                </span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Product Helper transforms your product ideas into engineering-quality
                PRD documents through conversational AI. Define requirements, generate
                diagrams, and validate against PRD-SPEC standards.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex gap-4">
                <Button
                  asChild
                  size="lg"
                  className="text-lg rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg rounded-full"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="rounded-xl p-6 shadow-xl bg-card border">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent">
                      <Sparkles className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        AI-Powered PRD Generation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Conversational requirements gathering
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent">
                      <FileText className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Auto-Generated Diagrams
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Context, Use Case, Class diagrams
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent">
                      <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        PRD-SPEC Validation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        95% quality threshold enforcement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 w-full bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-accent-foreground">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-foreground">
                  Conversational Intake
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Chat with AI to define your product vision, actors, use cases,
                  and system boundaries naturally.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-accent-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-foreground">
                  Real-time Validation
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Track completeness as you build. See validation scores
                  update live against 10 hard gates.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-accent-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-foreground">
                  Export Ready
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Export your PRD as Markdown with embedded Mermaid diagrams,
                  ready for engineering handoff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Dashboard skeleton
function DashboardSkeleton() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

// Stats card component
function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// Recent project card (compact)
function RecentProjectCard({
  project,
}: {
  project: {
    id: number;
    name: string;
    status: string;
    validationScore: number | null;
    updatedAt: Date;
  };
}) {
  const statusColors: Record<string, string> = {
    intake: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    validation: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-card border">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-accent" />
          <div>
            <p className="font-medium text-foreground">
              {project.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Score: {project.validationScore || 0}%
            </p>
          </div>
        </div>
        <Badge className={statusColors[project.status] || statusColors.intake}>
          {project.status.replace('_', ' ')}
        </Badge>
      </div>
    </Link>
  );
}

// Dashboard content for authenticated users
async function DashboardContent() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const projects = await getProjects();

  // Show welcome onboarding for first-time users (no projects)
  if (projects.length === 0) {
    return <WelcomeOnboarding />;
  }

  const recentProjects = projects.slice(0, 5);

  // Calculate stats
  const totalProjects = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const avgScore =
    totalProjects > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + (p.validationScore || 0), 0) / totalProjects
        )
      : 0;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your PRD projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Projects"
            value={totalProjects}
            icon={FolderPlus}
            description="All time"
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={Clock}
            description="Active projects"
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle2}
            description="Validated PRDs"
          />
          <StatsCard
            title="Avg. Score"
            value={`${avgScore}%`}
            icon={TrendingUp}
            description="Validation score"
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/home">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/home">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Projects
                </Link>
              </Button>
              {recentProjects.length > 0 && recentProjects[0].status !== 'completed' && (
                <Button asChild variant="outline">
                  <Link href={`/projects/${recentProjects[0].id}/chat`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Continue: {recentProjects[0].name}
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Recent Projects
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/home">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2 text-foreground">
                  No projects yet
                </p>
                <p className="mb-4 text-muted-foreground">
                  Create your first PRD project to get started
                </p>
                <Button
                  asChild
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link href="/home">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <RecentProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Main page component - shows landing for unauthenticated, dashboard for authenticated
export default async function HomePage() {
  const user = await getUser();

  if (!user) {
    return <LandingPage />;
  }

  redirect('/home');
}
