import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <Navigation />
      
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-display font-bold text-gradient-primary">404</h1>
        <h2 className="text-3xl font-display font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')} size="lg">
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
