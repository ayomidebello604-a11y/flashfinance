import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Dashboard",
    description: "A responsive admin dashboard with analytics, charts, and product management built with React and Tailwind CSS.",
    tech: ["React", "Tailwind CSS", "Recharts"],
    live: "#",
    github: "#",
    color: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    title: "Weather App",
    description: "A beautiful weather application with location search, forecasts, and animated weather icons using a public API.",
    tech: ["React", "API", "CSS Modules"],
    live: "#",
    github: "#",
    color: "from-blue-500/20 to-purple-500/20",
  },
  {
    title: "Task Manager",
    description: "A full-featured task management app with drag-and-drop, categories, and local storage persistence.",
    tech: ["React", "JavaScript", "DnD Kit"],
    live: "#",
    github: "#",
    color: "from-orange-500/20 to-rose-500/20",
  },
  {
    title: "Portfolio Template",
    description: "An open-source portfolio template for developers with dark mode, animations, and responsive design.",
    tech: ["React", "Framer Motion", "Tailwind"],
    live: "#",
    github: "#",
    color: "from-violet-500/20 to-fuchsia-500/20",
  },
];

const Projects = () => {
  return (
    <section id="projects" className="section-padding px-4 sm:px-6">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-mono text-xs sm:text-sm mb-2">03.</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
            Featured <span className="gradient-text">Projects</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card overflow-hidden hover-lift group flex flex-col"
            >
              {/* Gradient header */}
              <div className={`h-24 sm:h-40 bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                <span className="font-display text-base sm:text-lg font-semibold text-foreground/60 group-hover:text-foreground transition-colors text-center px-4">
                  {project.title}
                </span>
              </div>

              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="font-display text-base sm:text-lg font-bold mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed flex-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-primary/10 text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 sm:gap-4 flex-wrap">
                  <a
                    href={project.live}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink size={14} /> Live Demo
                  </a>
                  <a
                    href={project.github}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github size={14} /> Source Code
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
