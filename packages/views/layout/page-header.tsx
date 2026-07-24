/**
 * [WHO]: Provides PageHeader — shared page header shell with mobile sidebar trigger
 * [FROM]: Depends on @multica/ui/sidebar
 * [TO]: Consumed by workspace pages (issues, dashboard, settings, etc.)
 * [HERE]: packages/views/layout/page-header.tsx - Top-level header bar rendered under dashboard shell
 */
"use client";

import { cn } from "@multica/ui/lib/utils";
import { SidebarTrigger, useSidebarSafe } from "@multica/ui/components/ui/sidebar";

function MobileSidebarTrigger() {
  const sidebar = useSidebarSafe();
  if (!sidebar) return null;
  return <SidebarTrigger className="mr-2 md:hidden" />;
}

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <header className={cn("flex h-12 shrink-0 items-center border-b px-4", className)}>
      <MobileSidebarTrigger />
      {children}
    </header>
  );
}
