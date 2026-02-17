export default function MemoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Memory</h1>
          <p className="text-muted-foreground mt-1">Browse agent memory files</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No memory files found</p>
      </div>
    </div>
  );
}
