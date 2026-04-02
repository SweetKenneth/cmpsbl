/**
 * CmpsblNav — Factory-Era Flat Navigation
 * Clean dark command bar: Home · Memory Stream · Ascension · Pricing · Docs · Try · Login
 * Preserves all legacy routes — only navigation menu changes.
 */

import { useState, useEffect, useRef } from "react";
import { NpmAnnouncementBanner } from "./NpmAnnouncementBanner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  Command,
  Sparkles,
  Zap,
  Play,
  FileText,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { name: "Memory Stream", href: "/memory-stream", icon: Sparkles, badge: "LIVE", highlight: true },
  { name: "Ascension", href: "/ascension", icon: Zap },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Docs", href: "/documentation", icon: FileText },
  { name: "Try", href: "/try", icon: Play },
];

export function CmpsblNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const bannerHeight = 36;

  return (
    <>
      <NpmAnnouncementBanner />

      {/* ═══ HEADER ═══ */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{ top: bannerHeight }}
        className={cn(
          "fixed left-0 right-0 z-[10000] transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-background/80 backdrop-blur-md"
        )}
      >
        <div className={cn(
          "absolute inset-x-0 -bottom-px h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}>
          <div className="h-full w-full memory-stream-bar opacity-40" />
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-between h-16 lg:h-[72px]" role="navigation" aria-label="Main navigation">

            {/* Logo */}
            <Link
              to="/"
              className="relative group flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="CMPSBL Home"
            >
              <CmpsblLogo size="sm" priority className="transition-transform duration-300 group-hover:scale-105" />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">CMPSBL</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Signal → Silicon</span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {link.badge}
                    </span>
                  )}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-9 px-3 font-medium">
                      <Link to="/os">
                        <Command className="w-4 h-4 mr-1.5" />
                        Dashboard
                      </Link>
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSignOut}
                      className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-9 px-4 font-medium text-muted-foreground hover:text-foreground">
                      <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-lg h-9 px-4 font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Link to="/ascension">
                        Bring Us Your Tech
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 touch-manipulation border",
                  mobileMenuOpen
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-secondary border-border text-foreground"
                )}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileMenuOpen ? "close" : "menu"}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* ═══ MOBILE NAV ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <motion.div className="absolute inset-0 bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="relative h-full pt-28 pb-[env(safe-area-inset-bottom,2rem)] px-5 overflow-y-auto overscroll-contain"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 6rem)' }}
            >
              {/* Mobile Header */}
              <div className="mb-6">
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
                  <CmpsblLogo size="md" />
                  <div>
                    <div className="text-xl font-bold tracking-tight">CMPSBL</div>
                    <div className="text-xs text-muted-foreground font-medium">Signal → Silicon</div>
                  </div>
                </motion.div>
              </div>

              {/* Mobile Quick Links */}
              <div className="space-y-1 mb-8">
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + idx * 0.03 }}
                  >
                    <Link
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all touch-manipulation",
                        isActive(link.href)
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-card hover:bg-secondary border border-border"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        isActive(link.href) ? "bg-primary/10" : "bg-secondary"
                      )}>
                        <link.icon className={cn("w-4.5 h-4.5", isActive(link.href) ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className={cn("text-sm font-semibold", isActive(link.href) && "text-primary")}>{link.name}</span>
                        {link.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">{link.badge}</span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Auth */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="pt-6 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/os">
                        <Command className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} className="w-full h-11 rounded-xl">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/ascension">
                        Bring Us Your Tech
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Mobile Footer */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                <span>All Systems Operational</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer — accounts for fixed nav + banner */}
      <div style={{ height: `calc(${bannerHeight}px + 72px)` }} className="sm:hidden" />
      <div style={{ height: `calc(${bannerHeight}px + 64px)` }} className="hidden sm:block lg:hidden" />
      <div style={{ height: `calc(${bannerHeight}px + 72px)` }} className="hidden lg:block" />
    </>
  );
}
