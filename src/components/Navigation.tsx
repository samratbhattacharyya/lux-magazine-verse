import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Navigation() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    setOpen(false);
    if (window.location.pathname === '/') {
      // Already on home page, just scroll
      if (sectionId) {
        scrollToSection(sectionId);
      }
    } else {
      // Navigate to home page with state
      if (sectionId) {
        navigate(path, { state: { scrollTo: sectionId } });
      } else {
        navigate(path);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-6 right-6 z-50 bg-background/80 backdrop-blur-md border-border/50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <Button
            variant="ghost"
            className="justify-start text-lg"
            onClick={() => {
              navigate('/');
              setOpen(false);
            }}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg"
            onClick={() => handleNavigation('/', 'about-us')}
          >
            About Us
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg"
            onClick={() => handleNavigation('/', 'cbs-stories')}
          >
            CBS Stories
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg"
            onClick={() => handleNavigation('/', 'events')}
          >
            Events
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
