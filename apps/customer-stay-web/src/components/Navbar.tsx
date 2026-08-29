import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@ssrone/ui/customer";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Facilities", href: "#facilities" },
  { name: "Rooms", href: "#rooms" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-rose-dark/95 backdrop-blur-xl shadow-elevated py-3"
        : "bg-rose-dark/90 backdrop-blur-md py-4"
        }`}
      style={{ top: isScrolled ? "32px" : "36px" }}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo with hover glow */}
        <motion.a
          href="#home"
          className="flex flex-col items-start relative group"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-xl md:text-2xl font-display font-bold text-primary-foreground relative">
            SSR One AI
            {/* Glow effect */}
            <span className="absolute inset-0 blur-lg bg-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </span>
          <span className="text-xs md:text-sm text-primary-foreground/80 -mt-1">
            Modern Stay Experience
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className="relative text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium py-1 group"
              whileHover={{ y: -1 }}
            >
              {link.name}
              {/* Animated underline */}
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
              />
              {/* Glow effect */}
              <span className="absolute inset-0 rounded-md bg-primary-foreground/0 group-hover:bg-primary-foreground/5 transition-colors" />
            </motion.button>
          ))}

          <ThemeToggle />

          {/* Premium Book Now Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="hero"
              size="default"
              onClick={() => scrollToSection("#contact")}
              className="relative overflow-hidden rounded-full px-6 animate-pulse"
            >
              <span className="relative z-10">Book Now</span>
              {/* Shimmer effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            className="text-primary-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-rose-dark/98 backdrop-blur-xl overflow-hidden"
          >
            <nav className="container-custom py-6 flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(link.href)}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-base font-medium py-2 text-left"
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-4 w-full rounded-full"
                  onClick={() => scrollToSection("#contact")}
                >
                  Book Now
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
