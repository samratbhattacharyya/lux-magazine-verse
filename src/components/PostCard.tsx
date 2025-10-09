import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react';

interface PostCardProps {
  post: {
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
  };
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="card-3d border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      {post.media_url && (
        <div className="aspect-video overflow-hidden relative">
          {post.media_type === 'video' ? (
            <video
              src={post.media_url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <img
              src={post.media_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <div className="flex items-center gap-2 text-foreground">
              <Eye className="h-5 w-5" />
              <span className="font-medium">Read Story</span>
            </div>
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-display line-clamp-2 text-xl group-hover:text-gradient-primary transition-all">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-3">
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarImage src={post.profiles.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {post.profiles.display_name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{post.profiles.display_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}