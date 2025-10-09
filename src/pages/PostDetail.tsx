import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<number>(0);
  const [hasReacted, setHasReacted] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      fetchReactions();
    }

    const commentsChannel = supabase
      .channel(`comments-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${id}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel(`reactions-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=eq.${id}`,
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (display_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error: any) {
      toast.error('Failed to load post');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const { count, error } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

      if (error) throw error;
      setReactions(count || 0);

      if (user) {
        const { data } = await supabase
          .from('reactions')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setHasReacted(!!data);
      }
    } catch (error: any) {
      console.error('Failed to load reactions:', error);
    }
  };

  const toggleReaction = async () => {
    if (!user) return;

    try {
      if (hasReacted) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('reactions').insert({
          post_id: id,
          user_id: user.id,
          type: 'like',
        });

        if (error) throw error;
      }
    } catch (error: any) {
      toast.error('Failed to update reaction');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;
      setNewComment('');
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen pb-12">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {post.media_url && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8 shadow-2xl">
            {post.media_type === 'video' ? (
              <video src={post.media_url} controls className="w-full h-full object-cover" />
            ) : (
              <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
            )}
          </div>
        )}

        <h1 className="text-5xl font-display font-bold mb-6 text-gradient-primary">{post.title}</h1>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {post.profiles.display_name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">{post.profiles.display_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="flex items-center gap-4 py-6 border-y border-border/50">
          <Button
            variant={hasReacted ? 'default' : 'outline'}
            size="lg"
            onClick={toggleReaction}
            className={hasReacted ? 'bg-primary glow-primary' : ''}
          >
            <Heart className={`mr-2 h-5 w-5 ${hasReacted ? 'fill-current' : ''}`} />
            {reactions} {reactions === 1 ? 'Like' : 'Likes'}
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-display mb-6">Comments</h2>

          <form onSubmit={handleComment} className="mb-8">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3 bg-muted/50"
              rows={3}
            />
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Comment
            </Button>
          </form>

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={comment.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {comment.profiles.display_name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.profiles.display_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}