import { useParams, Link } from "wouter";
import { useGetIntakeResult } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, BookOpen, AlertTriangle, Building, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Results() {
  const params = useParams();
  const id = params.id ? parseInt(params.id, 10) : 0;

  const { data: result, isLoading, isError } = useGetIntakeResult(id, {
    query: {
      enabled: !!id,
      retry: false
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-3/4 max-w-lg mb-2" />
        <Skeleton className="h-6 w-full max-w-2xl" />
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Result Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find the intake result you're looking for. It may have expired or the link might be incorrect.
        </p>
        <Button asChild className="bg-primary text-white rounded-full">
          <Link href="/intake">Start New Intake</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <div className="mb-10">
        <Badge variant="outline" className="mb-4 text-xs font-semibold px-3 py-1 uppercase tracking-wider text-accent border-accent/20 bg-accent/5">
          Your Action Plan
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Case Assessment & Next Steps</h1>
        
        <div className="bg-secondary p-4 rounded-lg border border-secondary-border flex gap-4 mt-6 items-start">
          <AlertTriangle className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Important Disclaimer</p>
            <p className="text-sm text-muted-foreground mt-1">
              This summary is generated to help you organize your thoughts and understand potential legal frameworks. <strong>It is not legal advice.</strong> Always consult with a qualified attorney regarding your specific situation before taking formal action.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="bg-white pb-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="text-primary h-6 w-6" />
                Case Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white text-base leading-relaxed text-foreground/90">
              <p className="whitespace-pre-wrap">{result.case_summary}</p>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Detected Issue Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {result.issue_categories.map((cat, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-0">
                      {cat.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Briefcase className="text-primary h-6 w-6" />
                Action Plan
              </CardTitle>
              <CardDescription>Recommended steps to protect yourself, organized by priority.</CardDescription>
            </CardHeader>
            <CardContent className="bg-white space-y-6">
              {result.next_steps.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-background border">
                  <div className="shrink-0 mt-1">
                    {step.priority === 'immediate' && <div className="w-3 h-3 rounded-full bg-accent mt-1.5" />}
                    {step.priority === 'short_term' && <div className="w-3 h-3 rounded-full bg-orange-400 mt-1.5" />}
                    {step.priority === 'long_term' && <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <Badge variant="outline" className={cn(
                        "text-[10px] uppercase",
                        step.priority === 'immediate' ? "border-accent text-accent" : "border-muted-foreground text-muted-foreground"
                      )}>
                        {step.priority.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                    {step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium mt-2 inline-flex items-center hover:underline">
                        Learn more <ArrowRight className="ml-1 w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-8">
          
          <Card className="border-0 shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Find Support</CardTitle>
              <CardDescription className="text-primary-foreground/80">Connect with vetted professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-6 text-primary-foreground/90">
                You don't have to navigate this alone. Browse our directory of employment lawyers, therapists, and community resources.
              </p>
              <Button asChild className="w-full bg-white text-primary hover:bg-white/90 rounded-full font-semibold">
                <Link href="/referrals">Browse Directory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg flex items-center gap-2">
                Attorney Prep
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white text-sm">
              <p className="text-muted-foreground mb-4">Questions to ask when consulting with an employment lawyer:</p>
              <ul className="space-y-3">
                {result.attorney_questions.map((q, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="font-semibold text-primary/40">{i+1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {result.relevant_agencies.length > 0 && (
            <Card className="border-0 shadow-sm bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  Relevant Agencies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.relevant_agencies.map((agency, i) => (
                  <div key={i} className="text-sm">
                    <a href={agency.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1">
                      {agency.name} ({agency.acronym})
                    </a>
                    <p className="text-muted-foreground mt-1 line-clamp-2">{agency.description}</p>
                    {agency.filing_deadline_note && (
                      <p className="text-accent font-medium mt-1 text-xs">{agency.filing_deadline_note}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
