/**
 * Blog Post: Adding Persistent Memory to LangChain in 10 Minutes
 * Step-by-step tutorial for LangChain developers
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function LangChainMemoryIntegration() {
  return (
    <>
      <SEO 
        title="LangChain Persistent Memory Integration"
        description="Add persistent, cross-session memory to LangChain agents with a drop-in replacement for ConversationBufferMemory. Quick setup guide."
        type="article"
        publishedTime="2026-02-02"
        keywords={['LangChain persistent memory', 'LangChain memory replacement', 'cross-session agent memory', 'context engineering']}
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
            
            <Badge variant="outline" className="mb-4">Tutorial</Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Adding Persistent Memory to LangChain in 10 Minutes
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              A step-by-step guide to giving your LangChain agents memory that lasts.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                February 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                10 min read
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl prose prose-invert prose-lg">
            <h2>The Problem with LangChain's Built-in Memory</h2>
            <p>
              LangChain's memory classes are great for within-session context, but they all share a fundamental limitation: <strong>they don't persist across sessions</strong>.
            </p>
            
            <p>
              When your user comes back tomorrow, your agent has forgotten everything. No preferences, no conversation history, no learned context.
            </p>
            
            <h2>What We're Building</h2>
            <p>
              By the end of this tutorial, you'll have:
            </p>
            <ul>
              <li>A LangChain agent with cross-session memory</li>
              <li>Automatic context injection based on relevance</li>
              <li>Zero changes to your existing agent logic</li>
            </ul>
            
            <h2>Step 1: Get Your API Key</h2>
            <p>
              First, grab a free API key from the <Link to="/devtools">Developer Tools</Link> page. The free tier gives you 1,000 requests per day.
            </p>
            
            <h2>Step 2: Install the SDK</h2>
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`pip install cmpsbl-memory`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Step 3: Create the Memory Wrapper</h2>
            <p>
              Here's the key insight: we create a custom memory class that wraps CMPSBL's persistent memory while maintaining LangChain's interface.
            </p>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`from langchain.memory.chat_memory import BaseChatMemory
from cmpsbl_memory import PersistentMemory
import os

class CMPSBLMemory(BaseChatMemory):
    """LangChain-compatible persistent memory backed by CMPSBL."""
    
    def __init__(self, agent_id: str, **kwargs):
        super().__init__(**kwargs)
        self.memory = PersistentMemory(
            api_key=os.getenv("CMPSBL_API_KEY"),
            agent_id=agent_id
        )
    
    @property
    def memory_variables(self):
        return ["context"]
    
    def load_memory_variables(self, inputs: dict) -> dict:
        # Get the user's input
        user_input = inputs.get("input", "")
        
        # Retrieve relevant memories
        result = self.memory.recall(user_input, limit=5)
        
        # Format as context string
        context = result.get("contextString", "")
        return {"context": context}
    
    def save_context(self, inputs: dict, outputs: dict) -> None:
        # Store the interaction
        user_input = inputs.get("input", "")
        ai_output = outputs.get("output", "")
        
        # Save both sides of the conversation
        self.memory.store(
            f"User: {user_input}\\nAssistant: {ai_output}",
            metadata={"type": "conversation"}
        )
    
    def clear(self) -> None:
        # Optional: implement memory clearing
        pass`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Step 4: Use It in Your Chain</h2>
            <p>
              Now you can use your persistent memory exactly like any other LangChain memory:
            </p>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`from langchain.chains import ConversationChain
from langchain.chat_models import ChatOpenAI

# Create the chain with persistent memory
chain = ConversationChain(
    llm=ChatOpenAI(model="gpt-4"),
    memory=CMPSBLMemory(agent_id="my-support-agent"),
    verbose=True
)

# First conversation
response = chain.predict(input="My name is Sarah and I prefer dark mode")
print(response)

# ... days later, in a new session ...

response = chain.predict(input="What's my name again?")
print(response)  # "Your name is Sarah!"`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>Step 5: Add Importance Scoring (Optional)</h2>
            <p>
              For more sophisticated memory management, you can mark certain memories as important:
            </p>
            
            <Card className="not-prose my-6">
              <CardContent className="p-4">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`def save_context(self, inputs: dict, outputs: dict) -> None:
    user_input = inputs.get("input", "")
    ai_output = outputs.get("output", "")
    
    # Detect important information
    is_important = any(keyword in user_input.lower() for keyword in [
        "my name is", "i prefer", "remember that", "important"
    ])
    
    self.memory.store(
        f"User: {user_input}\\nAssistant: {ai_output}",
        metadata={
            "type": "conversation",
            "important": is_important
        }
    )`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>That's It!</h2>
            <p>
              Your LangChain agent now has persistent memory that survives across sessions, automatically retrieves relevant context, and requires zero infrastructure on your end.
            </p>
            
            <div className="not-prose my-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                What You've Accomplished
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Cross-session memory persistence
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Semantic retrieval of relevant context
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Drop-in replacement for LangChain memory
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  No vector database to manage
                </li>
              </ul>
            </div>
            
            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/devtools">
                  Get Your API Key
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/docs/persistent-memory">
                  Full API Reference
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
