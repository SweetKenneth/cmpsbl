import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function AdminBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const formatBreadcrumb = (str: string) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        to="/os"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{formatBreadcrumb(name)}</span>
            ) : (
              <Link
                to={routeTo}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {formatBreadcrumb(name)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
