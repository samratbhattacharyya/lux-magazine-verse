import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Users, Zap } from 'lucide-react';
import cbsLogo from '@/assets/cbs-logo.bmp';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/feed');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 p-6 z-10">
        <img src={cbsLogo} alt="CBS Logo" className="h-16 w-auto" />
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center p-2 mb-4">
            <Sparkles className="h-16 w-16 text-accent animate-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-gradient-primary leading-tight">
            E-CELL CALCUTTA BUSINESS SCHOOL
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience stories that inspire
            Your Idea, Our Platform
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 glow-primary text-lg px-8 py-6"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Start Reading
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-accent/50 hover:bg-accent/10 text-lg px-8 py-6"
            >
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-20">
            <div className="p-6 rounded-xl bg-card/50 border border-border/50 card-3d">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Immersive 3D</h3>
              <p className="text-muted-foreground">
                Experience content in stunning 3D cards with smooth animations
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border/50 card-3d">
              <div className="inline-flex p-3 rounded-lg bg-accent/10 mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Real-time</h3>
              <p className="text-muted-foreground">
                See new stories, reactions, and comments appear instantly
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border/50 card-3d">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Premium Content</h3>
              <p className="text-muted-foreground">
                Curated stories designed to inspire and captivate
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 E-CELL CBS. Experience stories that inspire.
          Develop By Boostlytic.
        </p>
      </footer>
    </div>
  );
}
