import Navbar from "#src/components/Navbar";
import Hero from "#src/components/Hero";
import About from "#src/components/About";
import Skills from "#src/components/Skills";
import Projects from "#src/components/Projects";
import Experience from "#src/components/Experience";
import Testimonials from "#src/components/Testimonials";
import Contact from "#src/components/Contact";
import Footer from "#src/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
