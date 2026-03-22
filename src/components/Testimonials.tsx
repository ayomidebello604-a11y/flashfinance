import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "Samad delivered a clean and responsive website ahead of schedule. His attention to detail and code quality is impressive.",
    name: "Ahmed K.",
    role: "Project Collaborator",
  },
  {
    text: "Working with Samad was a great experience. He understood the requirements quickly and built exactly what we needed.",
    name: "Fatima O.",
    role: "Client",
  },
  {
    text: "His React skills are solid, and he's always eager to learn new technologies. A reliable teammate for any frontend project.",
    name: "David M.",
    role: "Fellow Developer",
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-mono text-sm mb-2">05.</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12">
            What People <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 hover-lift"
            >
              <Quote size={20} className="text-primary/40 mb-4" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div>
                <p className="font-display font-semibold text-sm">{t.name}</p>
                <p className="text-muted-foreground/70 text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
