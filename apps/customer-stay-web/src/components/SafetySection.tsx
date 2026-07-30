import { motion } from "framer-motion";
import { Shield, Lock, UserCheck, Heart, Phone } from "lucide-react";

const safetyFeatures = [
  {
    icon: Shield,
    title: "24/7 CCTV Surveillance",
    description: "Complete monitoring of common areas and entry points",
    color: "from-primary to-rose-medium",
  },
  {
    icon: Lock,
    title: "Secure Entry",
    description: "Controlled access with verified entry system",
    color: "from-rose-medium to-primary",
  },
  {
    icon: UserCheck,
    title: "Verified Residents",
    description: "Thorough background verification of all residents",
    color: "from-primary to-rose-medium",
  },
  {
    icon: Heart,
    title: "Caring Staff",
    description: "Trained and supportive staff available round the clock",
    color: "from-rose-medium to-primary",
  },
  {
    icon: Phone,
    title: "Parent-Friendly Communication",
    description: "Regular updates and open communication with parents",
    color: "from-primary to-rose-medium",
  },
];

const SafetySection = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      
      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Your Safety is Our Priority
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Safety & Care{" "}
            <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
              First
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We've built comprehensive safety measures to ensure peace of mind for you and your family
          </p>
        </motion.div>

        {/* Safety Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-hero text-primary-foreground shadow-elevated">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Trusted by 1300+ Parents & Students</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SafetySection;
