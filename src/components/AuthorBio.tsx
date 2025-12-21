import { Card } from "@/components/ui/card";
import { Linkedin, Twitter, Facebook, Github } from "lucide-react";
import founderPhoto from "@/assets/founder-kenneth-sweet.png";

interface AuthorBioProps {
  publishDate: string;
  readTime: string;
}

export function AuthorBio({ publishDate, readTime }: AuthorBioProps) {
  return (
    <Card className="p-6 my-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <img 
          src={founderPhoto}
          alt="Kenneth E. Sweet Jr. - Founder of PromptFluid and Creator of Cascade AI" 
          className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/20"
          width="96"
          height="96"
        />
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">Kenneth E Sweet Jr</h3>
              <p className="text-sm text-muted-foreground">Founder & Security Engineer</p>
              <div className="flex gap-2 mt-2">
                <a href="https://www.linkedin.com/in/kennethesweetjr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://x.com/kennethesweetjr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/share/1DoXokS8zW/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://github.com/SweetKenneth" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <time dateTime={publishDate}>{new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
              <span>•</span>
              <span>{readTime}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kenneth E. Sweet Jr. is the founder of PromptFluid and the creator of Cascade and SimNap — the first documented AI systems capable of autonomous dreaming, reflection, and self-improvement. He builds intelligent ecosystems that learn while you sleep, evolve in real time, and uncover business opportunities hidden between the lines of normal analytics.
          </p>
        </div>
      </div>
    </Card>
  );
}
