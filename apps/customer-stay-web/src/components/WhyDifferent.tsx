import { motion } from "framer-motion";
import { Shield, Utensils, Heart, Clock, Users, CheckCircle2, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "24/7 CCTV surveillance",
  },
  {
    icon: Utensils,
    title: "Homely Food",
    description: "Nutritious pure veg meals",
  },
  {
    icon: Heart,
    title: "Caring Staff",
    description: "Friendly & supportive team",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "No strict curfew",
  },
  {
    icon: Users,
    title: "Community Feel",
    description: "Like-minded residents",
  },
  {
    icon: CheckCircle2,
    title: "Trusted by Parents",
    description: "Peace of mind guaranteed",
  },
  {
    icon: Award,
    title: "100% Trusted",
    description: "Verified by parents & residents",
  },
];

const WhyDifferent = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              More Than Just{" "}
              <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
                Accommodation
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              At SSR One AI, we don't just provide rooms—we provide a{" "}
              <strong className="text-foreground">home</strong>.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-lg bg-accent group-hover:bg-primary">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="h-48 md:h-64 rounded-2xl bg-gradient-hero flex items-center justify-center p-6 shadow-elevated"
                >
                  <div className="text-center">
                    <span className="text-4xl md:text-5xl font-bold text-primary-foreground block mb-2">
                      10+
                    </span>
                    <span className="text-primary-foreground/70 text-sm">
                      Years of Trust
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="h-32 md:h-40 rounded-2xl bg-accent flex items-center justify-center p-4 shadow-soft"
                >
                  <div className="text-center">
                    <span className="text-3xl md:text-4xl font-bold text-foreground block mb-1">
                      1300+
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Happy Students
                    </span>
                  </div>
                </motion.div>
              </div>
              <div className="space-y-4 pt-8">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="h-32 md:h-40 rounded-2xl bg-secondary flex items-center justify-center p-4 shadow-soft"
                >
                  <div className="text-center">
                    <span className="text-3xl md:text-4xl font-bold text-foreground block mb-1">
                      100%
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Safety Guaranteed
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="h-48 md:h-64 rounded-2xl bg-card border border-border flex items-center justify-center p-6 shadow-card"
                >
                  <div className="text-center">
                    <span className="text-4xl md:text-5xl font-bold text-primary block mb-2">
                      4.9★
                    </span>
                    <span className="text-muted-foreground text-sm">
                      Resident Rating
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
