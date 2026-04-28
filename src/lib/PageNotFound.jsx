import { useLocation, Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-mono font-light text-muted-foreground/30">404</h1>
          <div className="h-0.5 w-16 bg-primary/20 mx-auto" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-heading font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            <span className="font-mono text-sm">/{pageName}</span> doesn't exist.
          </p>
        </div>
        
        <Link to="/">
          <Button variant="outline" className="gap-2 font-mono text-xs border-primary/30 text-primary hover:bg-primary/10">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Calculator
          </Button>
        </Link>
      </div>
    </div>
  );
}