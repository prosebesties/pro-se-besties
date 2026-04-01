import { useState } from "react";
import { useListReferrals, useGetReferralCategories } from "@workspace/api-client-react";
import { ListReferralsCategory } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, Phone, Mail, ExternalLink, Scale, HeartHandshake, Briefcase, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Referrals() {
  const [activeCategory, setActiveCategory] = useState<ListReferralsCategory | undefined>(undefined);
  
  const { data: categories, isLoading: isLoadingCategories } = useGetReferralCategories();
  const { data: referrals, isLoading: isLoadingReferrals } = useListReferrals(
    activeCategory ? { category: activeCategory } : undefined,
    { query: { keepPreviousData: true } }
  );

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'lawyer': return <Scale className="w-5 h-5" />;
      case 'therapist': return <HeartHandshake className="w-5 h-5" />;
      case 'consultant': return <Briefcase className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Find Your Team</h1>
        <p className="text-lg text-muted-foreground">
          A vetted directory of professionals who are trauma-aware and friendly to workers navigating employment issues.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={activeCategory === undefined ? "default" : "outline"}
          onClick={() => setActiveCategory(undefined)}
          className={cn(
            "rounded-full px-6",
            activeCategory === undefined ? "bg-primary text-white" : "bg-white"
          )}
        >
          All Resources
        </Button>
        
        {isLoadingCategories ? (
          <>
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </>
        ) : categories?.map((cat) => (
          <Button
            key={cat.category}
            variant={activeCategory === cat.category ? "default" : "outline"}
            onClick={() => setActiveCategory(cat.category as ListReferralsCategory)}
            className={cn(
              "rounded-full px-6 capitalize flex gap-2 items-center",
              activeCategory === cat.category ? "bg-primary text-white" : "bg-white"
            )}
          >
            {getCategoryIcon(cat.category)}
            {cat.category}
            <span className="ml-1 opacity-60 text-xs">({cat.count})</span>
          </Button>
        ))}
      </div>

      {/* Referrals Grid */}
      {isLoadingReferrals ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : referrals && referrals.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {referrals.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="uppercase tracking-wider text-[10px] bg-secondary text-primary font-bold">
                    {item.category}
                  </Badge>
                  <div className="flex gap-1">
                    {item.accepts_pro_se && (
                      <Badge variant="outline" title="Accepts Pro Se (self-represented) clients" className="text-[10px] border-accent/30 text-accent bg-accent/5">
                        Pro Se Friendly
                      </Badge>
                    )}
                    {item.sliding_scale && (
                      <Badge variant="outline" className="text-[10px] border-green-600/30 text-green-700 bg-green-50">
                        Sliding Scale
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.specialties.map(spec => (
                    <span key={spec} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                      {spec}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-foreground/80 mb-6 line-clamp-3 flex-1">
                  {item.description}
                </p>
                
                <div className="space-y-2 mt-auto text-sm text-muted-foreground pt-4 border-t">
                  {(item.location || item.is_remote) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      <span>
                        {item.location} {item.is_remote && item.location && '•'} {item.is_remote && 'Remote Available'}
                      </span>
                    </div>
                  )}
                  {item.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary/60" />
                      <a href={`mailto:${item.email}`} className="hover:text-primary transition-colors">{item.email}</a>
                    </div>
                  )}
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary/60" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                  {item.website && (
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="w-4 h-4 text-primary/60" />
                      <a 
                        href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-medium hover:underline flex items-center"
                      >
                        Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No resources found</h3>
          <p className="text-muted-foreground mt-2">Try selecting a different category or check back later.</p>
        </div>
      )}
    </div>
  );
}
