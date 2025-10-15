import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    if (window.location.pathname === '/') {
      // Already on home page, just scroll
      if (sectionId) {
        scrollToSection(sectionId);
      }
    } else {
      // Navigate to home page first
      navigate('/');
      // Wait for navigation, then scroll
      if (sectionId) {
        setTimeout(() => scrollToSection(sectionId), 100);
      }
    }
  };

  return (
    <NavigationMenu className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-2">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            onClick={() => navigate('/')}
          >
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            onClick={() => handleNavigation('/', 'about-us')}
          >
            About Us
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            onClick={() => handleNavigation('/', 'gallery')}
          >
            Gallery
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            onClick={() => handleNavigation('/', 'events')}
          >
            Events
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
