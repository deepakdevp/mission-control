"use client";

import { useState, useEffect, useCallback } from 'react';
import { Person } from '@/lib/models/person';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/use-sse';
import { Plus, Users, Mail, Phone, Search, Edit, Trash2, Linkedin, Github, Twitter as TwitterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    tags: [] as string[],
    socials: {
      linkedin: '',
      twitter: '',
      github: '',
    },
  });
  const [tagInput, setTagInput] = useState('');

  const fetchPeople = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/people');
      if (!res.ok) throw new Error('Failed to fetch people');
      const data = await res.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useAutoRefresh(fetchPeople, ['clawd/people']);

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create person');
      
      await fetchPeople();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating person:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPerson) return;

    try {
      const res = await fetch(`/api/people/${selectedPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update person');
      
      await fetchPeople();
      setIsEditing(false);
      const updated = await res.json();
      setSelectedPerson(updated);
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const res = await fetch(`/api/people/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete person');
      await fetchPeople();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const openPerson = (person: Person) => {
    setSelectedPerson(person);
    setFormData({
      name: person.name,
      email: person.email || '',
      phone: person.phone || '',
      notes: person.notes || '',
      tags: person.tags,
      socials: {
        linkedin: person.socials?.linkedin || '',
        twitter: person.socials?.twitter || '',
        github: person.socials?.github || '',
      },
    });
    setIsViewModalOpen(true);
    setIsEditing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      notes: '',
      tags: [],
      socials: { linkedin: '', twitter: '', github: '' },
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const tagColors = ['bg-red-500/20 text-red-400', 'bg-blue-500/20 text-blue-400', 'bg-green-500/20 text-green-400', 'bg-yellow-500/20 text-yellow-400', 'bg-purple-500/20 text-purple-400'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">People</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPeople.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </p>
          {!searchQuery && (
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              Add your first contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredPeople.map((person, idx) => (
            <div
              key={person.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
              onClick={() => openPerson(person)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold', tagColors[idx % tagColors.length])}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    {person.lastContact && (
                      <p className="text-xs text-muted-foreground">
                        Last contact: {new Date(person.lastContact).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(person.email || person.phone) && (
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  {person.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {person.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                  {person.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      +{person.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Contact"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Contact
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Social Links</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.socials.linkedin}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })}
                  placeholder="LinkedIn URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <TwitterIcon className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.socials.twitter}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, twitter: e.target.value } })}
                  placeholder="Twitter URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.socials.github}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, github: e.target.value } })}
                  placeholder="GitHub URL"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      {selectedPerson && (
        <Dialog
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPerson(null);
            setIsEditing(false);
          }}
          title={isEditing ? 'Edit Contact' : selectedPerson.name}
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedPerson.id)}
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
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(selectedPerson.email || selectedPerson.phone) && (
                <div className="space-y-2">
                  {selectedPerson.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedPerson.email}`} className="text-sm hover:text-primary">
                        {selectedPerson.email}
                      </a>
                    </div>
                  )}
                  {selectedPerson.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedPerson.phone}`} className="text-sm hover:text-primary">
                        {selectedPerson.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedPerson.socials && (
                <div className="space-y-2">
                  {selectedPerson.socials.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                      <a href={selectedPerson.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {selectedPerson.socials.twitter && (
                    <div className="flex items-center gap-2">
                      <TwitterIcon className="w-4 h-4 text-muted-foreground" />
                      <a href={selectedPerson.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                        Twitter
                      </a>
                    </div>
                  )}
                  {selectedPerson.socials.github && (
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-muted-foreground" />
                      <a href={selectedPerson.socials.github} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                        GitHub
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedPerson.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedPerson.notes}
                  </p>
                </div>
              )}

              {selectedPerson.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {selectedPerson.tags.map(tag => (
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
