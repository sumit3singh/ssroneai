import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Heart } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Facilities", href: "#facilities" },
  { name: "Rooms", href: "#rooms" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const policies = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "Refund Policy", href: "#" },
];

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-rose-dark text-primary-foreground relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />

      <div className="container-custom section-padding pb-8 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="mb-4">
              <span className="text-2xl font-display font-bold block">
                SSR One AI
              </span>
              <span className="text-primary-foreground/70 text-sm">
                Modern Stay Experience
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Your trusted home away from home. Premium shared and private stay options with modern amenities and a supportive environment.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all text-sm inline-block"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2">
              {policies.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-gold" />
                <span className="text-primary-foreground/70 text-sm">
                  SSR One AI,
                  <br />
                  Near CUH Gate No. 1
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold" />
                <a
                  href="tel:+917056841994"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  +91 7056841994
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold" />
                <a
                  href="mailto:thessronecafe@gmail.com"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  thessronecafe@gmail.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-primary-foreground/50 text-sm flex items-center justify-center gap-1">
            © {new Date().getFullYear()} SSR One AI. Made with{" "}
            <Heart className="w-3 h-3 text-primary fill-primary" /> All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
