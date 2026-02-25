/**
 * Blog Post: Building Agents That Learn: A Practical Guide
 * Technical deep-dive on learning agents
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Brain, Sparkles, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function BuildingAgentsThatLearn() {
  return (
    <>
      <SEO 
        title="Building Agents That Learn from Experience"
        description="Architectural patterns for AI agents that improve through experience — from competency scoring to heuristic extraction at runtime."
        type="article"
        publishedTime="2026-02-05"
        keywords={['building learning agents', 'self-improving AI agents', 'competency scoring', 'agentic AI patterns', 'adaptive intelligence']}
      />
      <PublicNav />
      
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-12 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
            
            <Badge variant="outline" className="mb-4">Architecture</Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Building Agents That Learn:<br />A Practical Guide
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Patterns for creating AI agents that get better with every interaction.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                February 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                15 min read
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl prose prose-invert prose-lg">
            <p className="lead">
              Most AI agents are frozen in time. They're as good (or bad) on day one as they are on day one thousand. But it doesn't have to be this way.
            </p>
            
            <h2>The Learning Loop</h2>
            <p>
              A learning agent follows a continuous cycle:
            </p>
            
            <div className="not-prose my-8">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-primary">1</span>
                      </div>
                      <h4 className="font-semibold text-sm">Observe</h4>
                      <p className="text-xs text-muted-foreground">Take in new information</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-primary">2</span>
                      </div>
                      <h4 className="font-semibold text-sm">Remember</h4>
                      <p className="text-xs text-muted-foreground">Store what matters</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-primary">3</span>
                      </div>
                      <h4 className="font-semibold text-sm">Apply</h4>
                      <p className="text-xs text-muted-foreground">Use past knowledge</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-primary">4</span>
                      </div>
                      <h4 className="font-semibold text-sm">Reflect</h4>
                      <p className="text-xs text-muted-foreground">Evaluate outcomes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <h2>Pattern 1: Preference Learning</h2>
            <p>
              The simplest form of learning: remembering what users prefer.
            </p>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// When user expresses a preference
const preferencePatterns = [
  /i prefer (.+)/i,
  /i like (.+)/i,
  /always (.+)/i,
  /never (.+)/i
];

function detectPreference(input: string) {
  for (const pattern of preferencePatterns) {
    const match = input.match(pattern);
    if (match) {
      return {
        type: 'preference',
        value: match[1],
        confidence: 0.9
      };
    }
  }
  return null;
}

// Store with high importance
if (preference) {
  await agent.store(
    \`User preference: \${preference.value}\`,
    { important: true, type: 'preference' }
  );
}`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Pattern 2: Error Correction</h2>
            <p>
              When users correct your agent, that's learning signal. Capture it.
            </p>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Detect correction signals
const correctionPatterns = [
  /no,? (actually|that's wrong)/i,
  /you're wrong/i,
  /incorrect/i,
  /not (.+), it's (.+)/i
];

async function handleCorrection(
  originalResponse: string, 
  correctionInput: string
) {
  // Store the correction as a learning event
  await agent.store(
    "CORRECTION: When asked about X, responded with " +
    "original but user corrected. Use corrected info in future.",
    { 
      important: true, 
      type: 'correction',
      originalResponse,
      correction: correctionInput
    }
  );
}`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Pattern 3: Implicit Feedback</h2>
            <p>
              Not all feedback is explicit. User behavior tells you a lot.
            </p>
            
            <ul>
              <li><strong>Quick follow-up questions</strong> — Agent's response was incomplete</li>
              <li><strong>Rephrasing</strong> — Agent didn't understand the first time</li>
              <li><strong>Abandonment</strong> — Response wasn't helpful</li>
              <li><strong>Thanks/acknowledgment</strong> — Response was good</li>
            </ul>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Track implicit signals
function analyzeInteraction(
  response: string,
  followUp: string,
  timeToFollowUp: number
) {
  const signals = {
    positive: /thanks|great|perfect|exactly/i.test(followUp),
    confusion: /what|huh|don't understand/i.test(followUp),
    rephrasing: cosineSimilarity(response, followUp) < 0.3,
    quickFollowUp: timeToFollowUp < 5000 // under 5 seconds
  };
  
  if (signals.positive) {
    // Reinforce this type of response
    await agent.store(
      \`Successful response pattern for: \${extractTopic(response)}\`,
      { type: 'success-pattern', response }
    );
  }
  
  if (signals.confusion || signals.rephrasing) {
    // Mark as needs improvement
    await agent.store(
      \`Response caused confusion: \${response.slice(0, 100)}...\`,
      { type: 'improvement-needed', response }
    );
  }
}`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Pattern 4: Knowledge Accumulation</h2>
            <p>
              Some interactions add to the agent's knowledge base rather than just preferences.
            </p>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// When user shares factual information
async function learnFact(input: string, response: string) {
  const factPatterns = [
    /FYI:? (.+)/i,
    /just so you know,? (.+)/i,
    /for future reference,? (.+)/i
  ];
  
  for (const pattern of factPatterns) {
    const match = input.match(pattern);
    if (match) {
      await agent.store(
        \`Learned fact: \${match[1]}\`,
        { type: 'knowledge', source: 'user-provided' }
      );
    }
  }
}

// Also learn from successful tool use
async function learnFromToolUse(tool: string, input: any, result: any) {
  if (result.success) {
    await agent.store(
      \`Successfully used \${tool} with input pattern: \${JSON.stringify(input)}\`,
      { type: 'tool-knowledge', tool }
    );
  }
}`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Putting It Together</h2>
            <p>
              A learning agent combines all these patterns into a coherent system:
            </p>
            
            <div className="not-prose my-8 space-y-3">
              {[
                "Observe every interaction for learning signals",
                "Store preferences with high importance",
                "Capture corrections as priority memories",
                "Track implicit feedback through behavior",
                "Accumulate knowledge from user sharing",
                "Use recalled context to improve responses"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            
            <h2>The Result: Compound Improvement</h2>
            <p>
              With these patterns in place, your agent compounds its improvements over time:
            </p>
            
            <ul>
              <li>Day 1: Generic responses based on base model knowledge</li>
              <li>Week 1: Remembers user preferences and past conversations</li>
              <li>Month 1: Anticipates needs, avoids past mistakes, uses learned knowledge</li>
              <li>Month 6: Feels like a personalized assistant that truly knows the user</li>
            </ul>
            
            <p>
              This is the difference between an AI tool and an AI partner—and it's enabled entirely by persistent memory.
            </p>
            
            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/persistent-memory">
                  Start Building
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/devtools">
                  Try the Playground
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </main>
      
      <EnhancedFooter />
    </>
  );
}
