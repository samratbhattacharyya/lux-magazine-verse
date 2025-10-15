import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Calendar, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        image_url: imageUrl || null,
        event_date: eventDate,
        location: location || null,
      });

    if (error) {
      toast({ title: 'Error adding event', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Event added successfully' });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setEventDate('');
      setLocation('');
      setIsOpen(false);
      fetchEvents();
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Event Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Input
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
              <Input
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Button type="submit" className="w-full">Add Event</Button>
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
