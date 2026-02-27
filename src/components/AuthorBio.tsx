import { Card } from "@/components/ui/card";
import { Linkedin, Twitter, Github } from "lucide-react";
import { TEAM_MEMBERS, type TeamMember } from "@/data/team";

interface AuthorBioProps {
  publishDate: string;
  readTime: string;
  /** Team member name to use as author. Defaults to founder. */
  authorName?: string;
}

export function AuthorBio({ publishDate, readTime, authorName }: AuthorBioProps) {
  const member: TeamMember = authorName
    ? TEAM_MEMBERS.find(m => m.name === authorName) || TEAM_MEMBERS[0]
    : TEAM_MEMBERS[0];

  return (
    <Card className="p-6 my-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <img 
          src={member.photo}
          alt={`${member.name} - ${member.role} at CMPSBL`}
          className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/20"
          width="96"
          height="96"
        />
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {member.orcid ? (
                  <a href={member.orcid} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {member.name}
                  </a>
                ) : member.name}
              </h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
              <div className="flex gap-2 mt-2">
                <a href="https://www.linkedin.com/company/cmpsbl" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://x.com/cmpsbl" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://github.com/cmpsbl" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
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
            {member.bio}
          </p>
        </div>
      </div>
    </Card>
  );
}
