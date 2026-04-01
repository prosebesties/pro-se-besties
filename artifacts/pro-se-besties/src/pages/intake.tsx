import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSubmitIntake, IntakeSubmissionIssueType } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const intakeSchema = z.object({
  what_happened: z.string().min(10, "Please provide a brief description of what happened."),
  issue_type: z.nativeEnum(IntakeSubmissionIssueType),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(5, "Zip code is required"),
  employer_name: z.string().min(2, "Employer name is required"),
  employer_location: z.string().min(2, "Employer location is required"),
  incident_date: z.date({
    required_error: "Incident date is required",
  }),
  last_day_of_employment: z.date().optional().nullable(),
  reported_internally: z.boolean(),
  has_documentation: z.boolean(),
  additional_context: z.string().optional(),
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

export default function Intake() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitIntake = useSubmitIntake();
  const [step, setStep] = useState(1);

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      what_happened: "",
      issue_type: undefined,
      state: "",
      zip_code: "",
      employer_name: "",
      employer_location: "",
      reported_internally: false,
      has_documentation: false,
      additional_context: "",
    },
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["what_happened", "issue_type"]);
    } else if (step === 2) {
      isValid = await form.trigger(["employer_name", "employer_location", "state", "zip_code"]);
    } else if (step === 3) {
      isValid = await form.trigger(["incident_date", "reported_internally", "has_documentation"]);
    }
    
    if (isValid) {
      setStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = (data: IntakeFormValues) => {
    submitIntake.mutate({
      data: {
        ...data,
        incident_date: format(data.incident_date, "yyyy-MM-dd"),
        last_day_of_employment: data.last_day_of_employment ? format(data.last_day_of_employment, "yyyy-MM-dd") : null,
      }
    }, {
      onSuccess: (result) => {
        toast({
          title: "Intake submitted successfully",
          description: "We've generated a summary and next steps for you.",
        });
        setLocation(`/results/${result.id}`);
      },
      onError: () => {
        toast({
          title: "Error submitting intake",
          description: "Please try again later or contact support.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tell Us What Happened</h1>
        <p className="text-muted-foreground">
          Take your time. This information helps us categorize your situation and provide relevant next steps.
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mt-8 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className={cn("h-full bg-primary transition-all duration-500", step >= i ? "w-full" : "w-0")}
              />
            </div>
          ))}
        </div>
        <div className="text-sm font-medium text-muted-foreground">Step {step} of 4</div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Step 1: The Core Issue */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <FormField
                    control={form.control}
                    name="issue_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">What primary issue are you facing?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select an issue category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={IntakeSubmissionIssueType.discrimination}>Discrimination</SelectItem>
                            <SelectItem value={IntakeSubmissionIssueType.harassment}>Harassment</SelectItem>
                            <SelectItem value={IntakeSubmissionIssueType.retaliation}>Retaliation</SelectItem>
                            <SelectItem value={IntakeSubmissionIssueType.wrongful_termination}>Wrongful Termination</SelectItem>
                            <SelectItem value={IntakeSubmissionIssueType.hostile_work_environment}>Hostile Work Environment</SelectItem>
                            <SelectItem value={IntakeSubmissionIssueType.wage_theft}>Wage Theft</SelectItem>
                            <SelectItem value={IntakeSubmissionIssueType.other}>Other / Not Sure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="what_happened"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">In your own words, what happened?</FormLabel>
                        <FormDescription>
                          Focus on facts: who, what, when, and where. Do not include sensitive personal info like SSNs.
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the incident(s)..." 
                            className="min-h-[200px] text-base resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={nextStep} className="bg-primary text-white rounded-full px-8">
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Employer Details */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employer_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City / Location</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {usStates.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full px-6">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="bg-primary text-white rounded-full px-8">
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Timeline & Actions */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="incident_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>When did this happen?</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>For ongoing issues, pick the most recent date.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_day_of_employment"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Last day of employment (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>Leave blank if still employed.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <FormField
                      control={form.control}
                      name="reported_internally"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Have you reported this internally?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) => field.onChange(val === "true")}
                              defaultValue={field.value ? "true" : "false"}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="true" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes, to HR or Management</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="false" />
                                </FormControl>
                                <FormLabel className="font-normal">No, I haven't reported it</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_documentation"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you have documentation?</FormLabel>
                          <FormDescription>Emails, messages, performance reviews, etc.</FormDescription>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) => field.onChange(val === "true")}
                              defaultValue={field.value ? "true" : "false"}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="true" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="false" />
                                </FormControl>
                                <FormLabel className="font-normal">No / Not sure</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full px-6">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="bg-primary text-white rounded-full px-8">
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Final Details & Submit */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <FormField
                    control={form.control}
                    name="additional_context"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anything else we should know? (Optional)</FormLabel>
                        <FormDescription>
                          Any details about witnesses, impact on your health, or specific outcomes you are seeking.
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional context..." 
                            className="min-h-[150px] resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-secondary/50 p-4 rounded-lg border text-sm text-muted-foreground mt-8">
                    <p className="font-medium text-foreground mb-1">Confidentiality Notice</p>
                    <p>The information you provide is used strictly to generate your summary and next steps. Pro Se Besties is not a law firm, and submitting this form does not establish an attorney-client relationship.</p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full px-6" disabled={submitIntake.isPending}>
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-accent hover:bg-accent/90 text-white rounded-full px-8"
                      disabled={submitIntake.isPending}
                    >
                      {submitIntake.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Submit & View Next Steps"
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
