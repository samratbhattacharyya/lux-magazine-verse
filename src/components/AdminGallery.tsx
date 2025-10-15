import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
  created_at: string;
}

export function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching gallery', description: error.message, variant: 'destructive' });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('gallery')
      .insert({ title, image_url: imageUrl, description });

    if (error) {
      toast({ title: 'Error adding item', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Gallery item added successfully' });
      setTitle('');
      setImageUrl('');
      setDescription('');
      setIsOpen(false);
      fetchGallery();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting item', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Gallery item deleted' });
      fetchGallery();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Gallery Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Gallery Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button type="submit" className="w-full">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{item.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-md" />
              {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
