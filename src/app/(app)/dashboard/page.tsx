import Link from "next/link";
import { getUserOrganizations } from "@/lib/orgs";
import { getUserProjects } from "@/lib/projects";
import { CreateOrgForm } from "@/app/(app)/org/create-org-form";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

export default async function DashboardPage() {
  const [orgs, projects] = await Promise.all([getUserOrganizations(), getUserProjects()]);

  return (
    <div className="space-y-10">
      <FadeIn>
        <h1 className="text-xl font-semibold text-slate-900">Your projects</h1>
        <p className="mt-1 text-sm text-slate-500">Every project across every organization you belong to.</p>
      </FadeIn>

      {projects.length > 0 ? (
        <StaggerList className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <Link
                href={`/org/${project.orgSlug}/projects/${project.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:border-slate-400 hover:shadow-md"
              >
                <p className="font-medium text-slate-900">{project.name}</p>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                )}
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{project.orgName}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <p className="text-sm text-slate-500">No projects yet — create one from an organization below.</p>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Your organizations</h2>
        <p className="mt-1 text-sm text-slate-500">Pick a workspace to jump into, or create a new one.</p>

        {orgs.length > 0 && (
          <StaggerList className="mt-4 grid gap-3 sm:grid-cols-2">
            {orgs.map((org) => (
              <StaggerItem key={org.id}>
                <Link
                  href={`/org/${org.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:border-slate-400 hover:shadow-md"
                >
                  <p className="font-medium text-slate-900">{org.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{org.role}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}

        <div className="mt-4 max-w-sm rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Create an organization</h3>
          <p className="mt-1 text-xs text-slate-500">
            Organizations keep your projects, tasks, and teammates separate from other workspaces.
          </p>
          <CreateOrgForm />
        </div>
      </div>
    </div>
  );
}
