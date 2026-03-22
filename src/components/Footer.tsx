import { Github, Linkedin, Twitter, ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left order-2 sm:order-1">
          © {new Date().getFullYear()} Samad Bello. All rights reserved.
        </p>

        <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-2">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-secondary/50 rounded-lg">
            <Github size={18} />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-secondary/50 rounded-lg">
            <Linkedin size={18} />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-secondary/50 rounded-lg">
            <Twitter size={18} />
          </a>
        </div>

        <button
          onClick={scrollToTop}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors order-3"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
