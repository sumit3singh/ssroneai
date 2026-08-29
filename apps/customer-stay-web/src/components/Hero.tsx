import { motion } from "framer-motion";
import { Button } from "@ssrone/ui/customer";
import { Users, Star, Clock, Shield, Utensils, UserCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const trustIcons = [
  { icon: Shield, label: "CCTV Secured" },
  { icon: Utensils, label: "Pure Veg Food" },
  { icon: UserCheck, label: "Parent Verified" },
];

const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-120px)] flex items-center justify-center pt-32 scroll-mt-28"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        initial={{ scale: 1.02 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={heroBg}
          alt="The ssrone common area"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-dark/85 via-rose-dark/75 to-rose-dark/95" />
      </motion.div>

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:40px_40px]" />

      {/* Content */}
      <div className="container-custom relative z-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold/20 to-primary-foreground/10 border border-gold/30 text-primary-foreground/90 text-sm font-medium mb-6 backdrop-blur-sm"
          >
            <Shield className="w-4 h-4 text-gold" />
            Safe & Trusted Accommodation
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-primary-foreground/80 font-medium mb-4"
          >
            SSR One AI
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-primary-foreground mb-6"
          >
            Premium Stay
            <span className="relative">
              <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
                Solutions
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-gold rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-primary-foreground/90 mb-4"
          >
            Welcome to SSR One AI stay experience
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-primary-foreground/70 mb-8"
          >
            Safe • Comfortable • Homely Living
          </motion.p>

          {/* Animated Trust Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {trustIcons.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10"
              >
                <item.icon className="w-4 h-4 text-gold" />
                <span className="text-sm text-primary-foreground/90">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="hero"
                size="xl"
                onClick={() => scrollToSection("#contact")}
                className="rounded-full px-10 relative overflow-hidden group"
              >
                <span className="relative z-10">Book Now</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="heroOutline"
                size="xl"
                onClick={() => scrollToSection("#about")}
                className="rounded-full px-10"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12"
          >
            {[
              { icon: Users, value: "1300+", label: "Happy Residents" },
              { icon: Star, value: "4.9★", label: "Rating", iconColor: "text-amber-400" },
              { icon: Clock, value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -5, scale: 1.02 }}
                className="flex flex-col items-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/10 shadow-lg"
              >
                <stat.icon className={`w-8 h-8 mb-2 ${stat.iconColor || "text-primary-foreground"}`} />
                <span className="text-3xl md:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </span>
                <span className="text-primary-foreground/80 text-sm">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/40 flex justify-center pt-2">
          <motion.div
            className="w-1 h-3 bg-primary-foreground/60 rounded-full"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
