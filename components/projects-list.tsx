"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  progress?: number;
  members?: string[];
  clients?: string[];
};

export default function ProjectsList({ viewMode, filterStatus }: { viewMode: "grid" | "list"; filterStatus: string | null; }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load projects");
        let rows: Project[] = data.rows || [];
        if (filterStatus) rows = rows.filter(p => p.status === filterStatus);
        if (active) setProjects(rows);
      } catch (e:any) {
        toast({ title: "Failed to load projects", description: e.message, variant: "destructive" });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [filterStatus, toast]);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading projects…</div>;
  if (!projects.length) return <div className="p-6 text-sm text-muted-foreground">No projects yet.</div>;

  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
      {projects.map(p => (
        <Card key={p.id} className="hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{p.name}</span>
              <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status || "active"}</Badge>
            </CardTitle>
            {p.description && <CardDescription className="line-clamp-2">{p.description}</CardDescription>}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 mb-2">
              <Progress value={p.progress || 0} className="h-2" />
              <span className="text-xs text-muted-foreground">{Math.round(p.progress || 0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <Link href={`/projects/${p.id}`} className="text-sm underline underline-offset-4">View</Link>
              <Button asChild size="sm" variant="outline">
                <Link href={`/projects/${p.id}/full-details`}>Full details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
