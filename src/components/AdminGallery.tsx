import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
      const filePath = `gallery/${fileName}`;

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

      if (!finalImageUrl) {
        toast({ title: 'Error', description: 'Please provide an image URL or upload a file', variant: 'destructive' });
        setIsUploading(false);
        return;
      }

      const { error } = await supabase
        .from('gallery')
        .insert({ title, image_url: finalImageUrl, description });

      if (error) throw error;

      toast({ title: 'Gallery item added successfully' });
      setTitle('');
      setImageUrl('');
      setDescription('');
      setSelectedFile(null);
      setIsOpen(false);
      fetchGallery();
    } catch (error: any) {
      toast({ title: 'Error adding item', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
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
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Gallery Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'url' | 'upload')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-2">
                  <Label htmlFor="file">Select Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
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
                  <Label htmlFor="url">Image URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Adding...' : 'Add Item'}
              </Button>
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
