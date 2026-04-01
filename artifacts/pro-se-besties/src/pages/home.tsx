import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, BookOpen, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.png" 
            alt="Calm architectural space" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 py-24 md:py-32 relative z-10 flex flex-col items-start max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            You are not alone in this
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight md:leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            A safe harbor for workers who have been wronged.
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            Navigate workplace discrimination, harassment, retaliation, and wrongful termination. We help you understand your rights and take your next step with confidence and clarity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 h-14 px-8 text-base rounded-full">
              <Link href="/intake">
                Start Free Intake <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/insights">Explore Legal Insights</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Steady guidance when you need it most.</h2>
            <p className="text-lg text-muted-foreground">
              We are not a law firm. We are a knowledgeable friend to help you untangle what happened, organize your thoughts, and find the right professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Tell your story</h3>
                <p className="text-muted-foreground">
                  Use our secure intake form to write down what happened at your own pace, without pressure or judgment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Understand your standing</h3>
                <p className="text-muted-foreground">
                  Receive an immediate, personalized summary of potential legal issues and concrete next steps to protect yourself.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Connect with experts</h3>
                <p className="text-muted-foreground">
                  Browse our vetted directory of employment lawyers, therapists, and consultants who understand what you are going through.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Testimonial / Quote */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-8">
            "When you are pushed out of your job, the isolation is overwhelming. Pro Se Besties gives you the vocabulary to name what happened and the roadmap to do something about it."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              M.A.
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">Community Member</div>
              <div className="text-sm text-muted-foreground">Wrongful Termination Survivor</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take the next step?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start our guided intake process. It takes about 10 minutes, and you will receive a comprehensive summary that you can take to an attorney.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 px-10 text-lg">
            <Link href="/intake">Begin Guided Intake</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
