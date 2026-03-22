import { motion } from "framer-motion";

const skills = [
  { name: "HTML", level: 95, icon: "🌐" },
  { name: "CSS", level: 90, icon: "🎨" },
  { name: "JavaScript", level: 88, icon: "⚡" },
  { name: "React", level: 85, icon: "⚛️" },
  { name: "Git", level: 80, icon: "🔀" },
  { name: "Responsive Design", level: 92, icon: "📱" },
];

const Skills = () => {
  return (
    <section id="skills" className="section-padding bg-secondary/20 px-4 sm:px-6">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-mono text-xs sm:text-sm mb-2">02.</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
            My <span className="gradient-text">Skills</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card p-4 sm:p-6 hover-lift group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0">{skill.icon}</span>
                  <h3 className="font-display font-semibold text-sm sm:text-base truncate">{skill.name}</h3>
                </div>
                <span className="text-primary font-mono text-xs sm:text-sm font-bold shrink-0 ml-2">
                  {skill.level}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
