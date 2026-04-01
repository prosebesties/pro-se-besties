import { Link } from "wouter";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-accent selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-accent rounded-full" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Pro Se Besties</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/intake" className="text-muted-foreground hover:text-foreground transition-colors">
              Get Help
            </Link>
            <Link href="/insights" className="text-muted-foreground hover:text-foreground transition-colors">
              Legal Insights
            </Link>
            <Link href="/referrals" className="text-muted-foreground hover:text-foreground transition-colors">
              Referrals
            </Link>
          </nav>

          <div className="hidden md:flex items-center">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-6">
              <Link href="/intake">Start Intake</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-6 flex flex-col gap-6 animate-in slide-in-from-top-2">
            <Link href="/intake" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
              Get Help
            </Link>
            <Link href="/insights" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
              Legal Insights
            </Link>
            <Link href="/referrals" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
              Referrals
            </Link>
            <div className="pt-4 border-t">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full">
                <Link href="/intake" onClick={() => setMobileMenuOpen(false)}>Start Intake</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-white py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center opacity-80">
                <div className="w-3 h-3 bg-accent rounded-full" />
              </div>
              <span className="font-semibold text-primary">Pro Se Besties</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Empowering workers to navigate workplace discrimination, harassment, and wrongful termination with dignity.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">This is not legal advice.</p>
            <p>&copy; {new Date().getFullYear()} Pro Se Besties. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
