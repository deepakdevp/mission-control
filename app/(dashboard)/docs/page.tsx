"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Document } from '@/lib/models/document';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/use-sse';
import { Plus, FileText, Folder, Edit, Trash2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    path: '/',
    tags: [] as string[],
  });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useAutoRefresh(fetchDocuments, ['clawd/docs']);

  const documentTree = useMemo(() => {
    const tree: Record<string, Document[]> = {};
    
    documents.forEach(doc => {
      const folder = doc.path || '/';
      if (!tree[folder]) tree[folder] = [];
      tree[folder].push(doc);
    });

    return tree;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;
    
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create document');
      
      await fetchDocuments();
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        path: '/',
        tags: [],
      });
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDoc) return;

    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          path: formData.path,
          tags: formData.tags,
        }),
      });

      if (!res.ok) throw new Error('Failed to update document');
      
      await fetchDocuments();
      setIsEditing(false);
      const updated = await res.json();
      setSelectedDoc(updated);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete document');
      await fetchDocuments();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const openDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content,
      path: doc.path,
      tags: doc.tags,
    });
    setIsViewModalOpen(true);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery ? (
        <div className="space-y-2">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
              onClick={() => openDocument(doc)}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {doc.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{doc.path}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Folders
            </h2>
            <div className="space-y-1">
              {Object.keys(documentTree).map(folder => (
                <div key={folder} className="text-sm p-2 hover:bg-background rounded cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>{folder}</span>
                    <span className="text-xs text-muted-foreground">
                      {documentTree[folder].length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            {documents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No documents yet</p>
                <Button onClick={() => setIsModalOpen(true)}>Create your first document</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => openDocument(doc)}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {doc.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {doc.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Document"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Document
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Document title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Path</label>
            <Input
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="/folder/subfolder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your document..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </Dialog>

      {selectedDoc && (
        <Dialog
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDoc(null);
            setIsEditing(false);
          }}
          title={isEditing ? 'Edit Document' : selectedDoc.title}
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedDoc.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdate}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button onClick={() => setIsViewModalOpen(false)}>
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <span>{selectedDoc.path}</span>
                <span className="mx-2">•</span>
                <span>{new Date(selectedDoc.updatedAt).toLocaleString()}</span>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedDoc.content}
                </ReactMarkdown>
              </div>

              {selectedDoc.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {selectedDoc.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}
