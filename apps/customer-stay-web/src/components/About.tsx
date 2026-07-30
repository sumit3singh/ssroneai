import { motion } from "framer-motion";
import { GraduationCap, Award, Clock, MapPin } from "lucide-react";

const highlights = [
  {
    icon: GraduationCap,
    title: "Student-Friendly",
    description: "Ideal for students & working professionals",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Well-maintained facilities & amenities",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "No strict curfew",
  },
  {
    icon: MapPin,
    title: "Prime Location",
    description: "Near colleges, offices & transport",
  },
];

const About = () => {
  return (
    <section id="about" className="section-padding bg-blush relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Your Home{" "}
              <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
                Away From Home
              </span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                At The Baithak, we understand the importance of a
                comfortable and safe living environment. Our mission is to
                provide a home-like atmosphere where students, professionals,
                and guests can thrive.
              </p>
              <p>
                With <strong className="text-foreground">10 years of experience</strong> in
                hospitality, we've created a space that combines comfort,
                convenience, and community. From nutritious homemade meals to
                modern amenities, every aspect is designed with your well-being
                in mind.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card shadow-soft hover:shadow-card transition-all duration-300"
                >
                  <div className="p-2 rounded-lg bg-accent">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-10 blur-2xl" />
            <div className="relative bg-gradient-hero rounded-3xl p-8 md:p-12 shadow-elevated">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-8 text-center">
                Why Choose Us
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "10+", label: "Years Experience" },
                  { value: "1300+", label: "Residents Served" },
                  { value: "4.9/5", label: "Average Rating" },
                  { value: "100%", label: "Satisfaction Rate" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center p-4"
                  >
                    <span className="text-3xl md:text-4xl font-bold text-primary-foreground block">
                      {stat.value}
                    </span>
                    <span className="text-primary-foreground/70 text-sm">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
