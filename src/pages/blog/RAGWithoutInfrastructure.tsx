/**
 * Blog Post: RAG Without the Infrastructure Pain
 * Developer-focused content on simplifying RAG implementations
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Code, Database, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function RAGWithoutInfrastructure() {
  return (
    <>
      <SEO 
        title="RAG Without the Infrastructure Pain | CMPSBL Blog"
        description="How to implement retrieval-augmented generation without managing vector databases, embeddings pipelines, or complex infrastructure."
        keywords={['RAG', 'retrieval augmented generation', 'vector database', 'AI infrastructure', 'LLM memory']}
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
            
            <Badge variant="outline" className="mb-4">Developer Experience</Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              RAG Without the Infrastructure Pain
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Stop managing vector databases. Start shipping features.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                February 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                8 min read
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl prose prose-invert prose-lg">
            <h2>The RAG Tax</h2>
            <p>
              Every AI team building retrieval-augmented generation faces the same stack of decisions:
            </p>
            
            <ul>
              <li>Which vector database? (Pinecone, Weaviate, Qdrant, Chroma...)</li>
              <li>How to generate embeddings? (OpenAI, Cohere, local models...)</li>
              <li>How to chunk documents? (Fixed size, semantic, recursive...)</li>
              <li>How to manage updates and deletions?</li>
              <li>How to handle metadata filtering?</li>
              <li>How to monitor retrieval quality?</li>
            </ul>
            
            <p>
              This is what we call the <strong>RAG Tax</strong>—the infrastructure overhead that has nothing to do with your actual product.
            </p>
            
            <h2>What If Memory Just Worked?</h2>
            <p>
              CMPSBL's persistent memory abstracts away the entire RAG stack. You store content, you retrieve content. That's it.
            </p>
            
            <Card className="my-8 not-prose">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Before: Traditional RAG Setup
                </h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto mb-6">
{`// Setup embeddings
const embeddings = new OpenAIEmbeddings();

// Setup vector store
const vectorStore = await PineconeVectorStore.fromDocuments(
  docs, embeddings, { pineconeIndex }
);

// Create retriever
const retriever = vectorStore.asRetriever({
  k: 5,
  filter: { userId: currentUser.id }
});

// Build chain
const chain = RetrievalQAChain.fromLLM(llm, retriever);`}
                </pre>
                
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  After: CMPSBL Memory
                </h3>
                <pre className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg text-xs overflow-x-auto">
{`import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  apiKey: process.env.CMPSBL_API_KEY,
  agentId: 'my-agent'
});

// Store happens automatically
// Retrieval happens automatically
// You just use the agent`}
                </pre>
              </CardContent>
            </Card>
            
            <h2>The Three-Tier Memory Model</h2>
            <p>
              Unlike static vector databases, CMPSBL uses an intelligent three-tier memory system:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 not-prose my-8">
              <Card>
                <CardContent className="p-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </div>
                  <h4 className="font-semibold mb-1">Hot Memory</h4>
                  <p className="text-sm text-muted-foreground">
                    Frequently accessed, millisecond retrieval
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                  </div>
                  <h4 className="font-semibold mb-1">Warm Memory</h4>
                  <p className="text-sm text-muted-foreground">
                    Recent context, fast access
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                  <h4 className="font-semibold mb-1">Cold Memory</h4>
                  <p className="text-sm text-muted-foreground">
                    Long-term storage, archived
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <p>
              Memory automatically moves between tiers based on access patterns. No configuration required.
            </p>
            
            <h2>What You Don't Have to Manage</h2>
            <ul>
              <li><CheckCircle className="w-4 h-4 inline text-emerald-500 mr-2" />Vector database provisioning</li>
              <li><CheckCircle className="w-4 h-4 inline text-emerald-500 mr-2" />Embedding generation</li>
              <li><CheckCircle className="w-4 h-4 inline text-emerald-500 mr-2" />Index optimization</li>
              <li><CheckCircle className="w-4 h-4 inline text-emerald-500 mr-2" />Chunking strategies</li>
              <li><CheckCircle className="w-4 h-4 inline text-emerald-500 mr-2" />Metadata schemas</li>
              <li><CheckCircle className="w-4 h-4 inline text-emerald-500 mr-2" />Scaling infrastructure</li>
            </ul>
            
            <h2>Get Started in 5 Minutes</h2>
            <p>
              The free tier includes 1,000 requests per day—enough to build and test your entire integration.
            </p>
            
            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/persistent-memory">
                  Get Your Free API Key
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/docs/persistent-memory">
                  Read the Docs
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
