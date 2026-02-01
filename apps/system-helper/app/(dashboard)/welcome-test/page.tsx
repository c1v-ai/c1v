import { Suspense } from 'react';
import { WelcomeOnboarding } from '@/components/onboarding/welcome-onboarding';
import { ProjectsSidebarWrapper } from '@/components/onboarding/projects-sidebar-wrapper';
import { ProjectsSidebar } from '@/components/onboarding/projects-sidebar';

// Loading skeleton for sidebar
function SidebarSkeleton() {
  return <ProjectsSidebar projects={[]} />;
}

// Main page - sidebar streams in, main content is instant
export default function WelcomeTestPage() {
  return (
    <WelcomeOnboarding
      sidebar={
        <Suspense fallback={<SidebarSkeleton />}>
          <ProjectsSidebarWrapper />
        </Suspense>
      }
    />
  );
}
