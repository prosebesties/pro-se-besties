import { useListInsights, useGetFeaturedInsights, useSubmitInsightQuestion } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Send, MessageSquareQuote } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListInsightsQueryKey } from "@workspace/api-client-react";

const questionSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters").max(500, "Keep it concise"),
  submitter_name: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function Insights() {
  const { data: insights, isLoading } = useListInsights();
  const { data: featuredInsights, isLoading: isLoadingFeatured } = useGetFeaturedInsights();
  const submitQuestion = useSubmitInsightQuestion();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      submitter_name: "",
    },
  });

  const onSubmit = (data: QuestionFormValues) => {
    submitQuestion.mutate({
      data: {
        question: data.question,
        submitter_name: data.submitter_name || null,
        category: "general"
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Question Submitted",
          description: "Thank you. Our experts will review your question.",
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListInsightsQueryKey() });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Legal Insights</h1>
        <p className="text-lg text-muted-foreground">
          Practical answers to common workplace legal questions, curated by employment attorneys and HR professionals.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Main Content: Q&A Feed */}
        <div className="md:col-span-8 space-y-8">
          
          {isLoadingFeatured ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : featuredInsights && featuredInsights.length > 0 ? (
            <div className="mb-12 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="text-accent" /> Featured Answers
              </h2>
              {featuredInsights.map((insight) => (
                <Card key={insight.id} className="border-2 border-primary/10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-full" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-secondary text-foreground">
                        {insight.category || "General"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl leading-tight">{insight.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    {insight.answer ? (
                      <div className="prose prose-sm max-w-none text-foreground/80">
                        {insight.answer}
                      </div>
                    ) : (
                      <p className="italic">Awaiting response from an expert...</p>
                    )}
                  </CardContent>
                  {insight.contributor_name && (
                    <CardFooter className="bg-secondary/30 pt-4 pb-4 border-t mt-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                          {insight.contributor_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{insight.contributor_name}</p>
                          <p className="text-muted-foreground text-xs">{insight.contributor_title}</p>
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : null}

          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Community Questions</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : insights && insights.length > 0 ? (
              <div className="space-y-4">
                {insights.filter(i => !i.is_featured).map((insight) => (
                  <Card key={insight.id} className="border-0 shadow-sm bg-white">
                    <CardHeader className="py-4">
                      <div className="flex gap-4">
                        <MessageSquareQuote className="text-muted-foreground/40 shrink-0 h-6 w-6" />
                        <div>
                          <CardTitle className="text-lg font-medium leading-snug mb-2">{insight.question}</CardTitle>
                          {insight.answer ? (
                            <p className="text-sm text-muted-foreground line-clamp-3">{insight.answer}</p>
                          ) : (
                            <p className="text-sm text-accent/80 italic">Question submitted, awaiting review.</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No questions have been asked yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar: Ask a Question Form */}
        <div className="md:col-span-4 sticky top-24">
          <Card className="border-0 shadow-md bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Ask an Expert</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Can't find what you're looking for? Submit an anonymous question for our contributors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="What would you like to know?" 
                            className="bg-primary-foreground/10 border-primary-foreground/20 text-white placeholder:text-primary-foreground/50 resize-none h-24 focus-visible:ring-white/30"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="submitter_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Name (Optional)" 
                            className="bg-primary-foreground/10 border-primary-foreground/20 text-white placeholder:text-primary-foreground/50 focus-visible:ring-white/30 h-10"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent/90 text-white font-medium rounded-full"
                    disabled={submitQuestion.isPending}
                  >
                    {submitQuestion.isPending ? "Submitting..." : (
                      <>Submit Question <Send className="ml-2 w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
