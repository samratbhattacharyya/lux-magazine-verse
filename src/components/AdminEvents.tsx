import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  event_date: string;
  location: string | null;
  created_at: string;
}

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching events', description: error.message, variant: 'destructive' });
    } else {
      setEvents(data || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = imageUrl;

      if (uploadMethod === 'upload' && selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (!uploadedUrl) {
          setIsUploading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title,
          description,
          image_url: finalImageUrl || null,
          event_date: eventDate,
          location: location || null,
        });

      if (error) throw error;

      toast({ title: 'Event added successfully' });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setEventDate('');
      setLocation('');
      setSelectedFile(null);
      setIsOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast({ title: 'Error adding event', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting event', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Event deleted' });
      fetchEvents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events Management</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Enter event description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'url' | 'upload')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-2">
                  <Label htmlFor="event-file">Select Image (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="event-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground truncate">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="event-url">Image URL (optional)</Label>
                  <Input
                    id="event-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="event-date">Event Date & Time</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location">Location (optional)</Label>
                <Input
                  id="event-location"
                  placeholder="Enter event location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Adding...' : 'Add Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{event.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.image_url && (
                <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover rounded-md" />
              )}
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.event_date), 'PPP p')}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
