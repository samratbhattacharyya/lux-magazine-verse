import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { AdminPostsList } from '@/components/AdminPostsList';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { AdminGallery } from '@/components/AdminGallery';
import { AdminEvents } from '@/components/AdminEvents';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Admin() {
  const { isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 pt-16">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-display text-gradient-primary">Admin Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground glow-accent"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </div>
            <AdminPostsList />
          </TabsContent>
          
          <TabsContent value="gallery">
            <AdminGallery />
          </TabsContent>
          
          <TabsContent value="events">
            <AdminEvents />
          </TabsContent>
        </Tabs>
      </main>

      <CreatePostDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}