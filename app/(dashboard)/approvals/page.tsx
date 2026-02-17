export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve agent actions</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No pending approvals</p>
      </div>
    </div>
  );
}
