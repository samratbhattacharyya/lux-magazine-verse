import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  content: z.string()
    .trim()
    .min(1, 'Content is required')
    .max(10000, 'Content must not exceed 10,000 characters'),
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Validate post input
      const validation = postSchema.safeParse({
        title,
        content,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        toast.error(firstError.message);
        setIsLoading(false);
        return;
      }

      // Validate media file if provided
      if (mediaFile) {
        if (mediaFile.size > MAX_FILE_SIZE) {
          toast.error('File size must not exceed 50MB');
          setIsLoading(false);
          return;
        }

        const isValidImage = ALLOWED_IMAGE_TYPES.includes(mediaFile.type);
        const isValidVideo = ALLOWED_VIDEO_TYPES.includes(mediaFile.type);

        if (!isValidImage && !isValidVideo) {
          toast.error('File must be an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV)');
          setIsLoading(false);
          return;
        }
      }

      let mediaUrl = null;
      let mediaType = null;

      // Upload media if provided
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      }

      // Create post
      const { error } = await supabase.from('posts').insert({
        title: validation.data.title,
        content: validation.data.content,
        media_url: mediaUrl,
        media_type: mediaType,
        author_id: user.id,
      });

      if (error) throw error;

      toast.success('Post created successfully!');
      onOpenChange(false);
      setTitle('');
      setContent('');
      setMediaFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create New Post</DialogTitle>
          <DialogDescription>
            Share your story with the world. Add images or videos to make it immersive.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a captivating title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Tell your story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media">Media (Image or Video)</Label>
            <Input
              id="media"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              className="bg-muted/50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}