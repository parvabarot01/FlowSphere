import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgProjects } from "@/lib/projects";
import { CreateProjectForm } from "@/app/(app)/org/[slug]/create-project-form";

export default async function OrgHomePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const projects = await getOrgProjects(org.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">Everything {org.name} is working on.</p>
      </div>

      {projects.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/org/${org.slug}/projects/${project.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
              >
                <p className="font-medium text-slate-900">{project.name}</p>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Create a project</h2>
        <CreateProjectForm orgId={org.id} orgSlug={org.slug} />
      </div>
    </div>
  );
}
