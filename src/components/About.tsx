import { motion } from "framer-motion";
import { Download, GraduationCap, Code2 } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="section-padding px-4 sm:px-6">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-mono text-xs sm:text-sm mb-2">01.</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
            About <span className="gradient-text">Me</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              I'm Samad Bello, a passionate Frontend Developer and Computer Engineering student at the{" "}
              <span className="text-foreground font-medium">Federal University of Technology, Minna</span>. I specialize in building modern, responsive, and interactive web applications.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              My journey in frontend development began with a curiosity for how things work on the web. Today, I combine my engineering mindset with creative design to deliver digital experiences that are both functional and beautiful.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When I'm not coding, I'm exploring new technologies, contributing to open source, or sharing knowledge with the developer community.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-primary/30 text-primary font-medium text-xs sm:text-sm hover:bg-primary/10 transition-colors"
            >
              <Download size={16} /> Download CV
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="glass-card p-4 sm:p-6 hover-lift">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-sm sm:text-base mb-1">Education</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    B.Eng Computer Engineering
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">
                    Federal University of Technology, Minna
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 sm:p-6 hover-lift">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Code2 size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-sm sm:text-base mb-1">Focus</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Frontend Development, UI/UX, Modern Web Apps
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">
                    React · JavaScript · Responsive Design
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
