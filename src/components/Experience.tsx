import { motion } from "framer-motion";

const timeline = [
  {
    year: "2023 — Present",
    title: "Frontend Developer",
    subtitle: "Freelance & Personal Projects",
    description: "Building modern web applications using React, JavaScript, and Tailwind CSS. Contributing to open-source projects and expanding my skill set.",
  },
  {
    year: "2022 — Present",
    title: "Computer Engineering Student",
    subtitle: "Federal University of Technology, Minna",
    description: "Studying core engineering principles, algorithms, and computer systems while specializing in frontend web development.",
  },
  {
    year: "2021 — 2022",
    title: "Self-Taught Developer",
    subtitle: "Online Learning Journey",
    description: "Started learning HTML, CSS, and JavaScript through online platforms. Built first projects and fell in love with frontend development.",
  },
];

const Experience = () => {
  return (
    <section id="experience" className="section-padding bg-secondary/20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-mono text-sm mb-2">04.</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12">
            Experience & <span className="gradient-text">Education</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary glow-effect z-10 mt-2" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <span className="text-primary font-mono text-xs">{item.year}</span>
                  <h3 className="font-display text-lg font-bold mt-1">{item.title}</h3>
                  <p className="text-muted-foreground/80 text-sm">{item.subtitle}</p>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
