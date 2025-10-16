import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Users, Zap, Facebook, Instagram, Linkedin, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import cbsLogo from '@/assets/cbs-logo.bmp';
import { Navigation } from '@/components/Navigation';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  event_date: string;
  location: string | null;
}

export default function Index() {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/feed');
      }
    });

    // Fetch gallery items
    supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setGallery(data || []));

    // Fetch events
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
      .limit(3)
      .then(({ data }) => setEvents(data || []));
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
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
          
          <h1 className="text-6xl md:text-8xl font-display leading-tight">
            <span className="font-bold text-gradient-primary">Vipanan+</span>{" "}
            <span className="text-blue-600 text-5xl md:text-7xl">CALCUTTA BUSINESS SCHOOL</span>
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

      {/* About Us Section */}
      <section id="about-us" className="py-20 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-display font-bold text-gradient-primary">About Us</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            E-CELL Calcutta Business School is a dynamic platform fostering entrepreneurship and innovation. 
            We provide students with opportunities to explore their entrepreneurial potential through workshops, 
            events, and real-world business challenges. Our mission is to inspire and support the next generation 
            of business leaders and innovators.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-gradient-primary text-center mb-12">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <Card key={item.id} className="overflow-hidden card-3d">
                <CardContent className="p-0">
                  <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-gradient-primary text-center mb-12">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="card-3d">
                <CardContent className="p-6 space-y-4">
                  {event.image_url && (
                    <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover rounded-md" />
                  )}
                  <h3 className="font-semibold text-xl">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(new Date(event.event_date), 'PPP')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6 mb-4">
          <a 
            href="https://www.facebook.com/share/19gS9EFzZ9/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a 
            href="https://www.instagram.com/cbskolkataofficial?igsh=MThzZGMzN2Q2Y3J1bA==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a 
            href="https://www.linkedin.com/school/calcutta-business-school/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-6 w-6" />
          </a>
        </div>
        <p>© 2025 Vipanan+. Experience stories that inspire.
          Develop By Animesh..
        </p>
      </footer>
    </div>
  );
}
