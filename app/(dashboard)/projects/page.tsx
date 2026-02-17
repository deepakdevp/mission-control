export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Track project progress</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          New Project
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No projects yet</p>
      </div>
    </div>
  );
}
