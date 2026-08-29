import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sumit Singh",
    role: "MSc Computer Science",
    subtitle: "Ex-Student of CUH",
    text: "This stay has been my home for the past 10 years. The food feels just like home, staff is supportive, and the environment is perfect for studies.",
    rating: 5,
    avatar: "🏡",
  },
  {
    name: "Priya Sharma",
    role: "B.Tech Final Year",
    subtitle: "CUH Student",
    text: "Finding SSR One AI was a blessing. The safety measures give my parents peace of mind, and I've made lifelong friends here.",
    rating: 5,
    avatar: "👩‍💻",
  },
  {
    name: "Anjali Verma",
    role: "Working Professional",
    subtitle: "IT Company",
    text: "Flexible timings, great food, and a supportive community. Highly recommend for anyone looking for quality accommodation.",
    rating: 5,
    avatar: "🏢",
  },
  {
    name: "Neha Gupta",
    role: "B.Sc Final Year",
    subtitle: "CUH Student",
    text: "The best stay experience I've had! Clean rooms, amazing food, and the staff treats you like family. Worth every penny.",
    rating: 5,
    avatar: "✨",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="section-padding bg-blush relative overflow-hidden">
      {/* Quote watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Quote className="w-96 h-96 text-primary/5" />
      </div>

      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
              Residents Say
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Trusted by hundreds of residents and professionals
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl p-6 shadow-card relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent opacity-60" />

              {/* Avatar */}
              <div className="text-4xl mb-4">{testimonials[currentIndex].avatar}</div>

              {/* Stars with animation */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star className="w-4 h-4 fill-gold text-gold" />
                  </motion.div>
                ))}
              </div>

              <p className="text-muted-foreground mb-6 italic leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              <div>
                <h4 className="font-semibold text-foreground">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-sm text-primary">{testimonials[currentIndex].role}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonials[currentIndex].subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-card border border-border shadow-soft hover:shadow-card transition-shadow"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-primary" : "bg-muted-foreground/30"
                    }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-card border border-border shadow-soft hover:shadow-card transition-shadow"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elevated transition-all duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-accent opacity-60 group-hover:opacity-100 transition-opacity" />

              {/* Avatar */}
              <div className="text-4xl mb-4">{testimonial.avatar}</div>

              {/* Stars with animation */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Star className="w-4 h-4 fill-gold text-gold" />
                  </motion.div>
                ))}
              </div>

              <p className="text-muted-foreground mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>

              <div>
                <h4 className="font-semibold text-foreground">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-primary">{testimonial.role}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
