import { motion } from "framer-motion";
import {
  Utensils,
  Wifi,
  Zap,
  WashingMachine,
  Home,
  Shield,
  Snowflake,
  Droplets,
  Tv,
  Car,
} from "lucide-react";

const facilities = [
  {
    icon: Utensils,
    title: "Pure Veg Meals",
    description: "3 times homemade vegetarian meals daily",
  },
  {
    icon: Wifi,
    title: "High-Speed Wi-Fi",
    description: "24×7 unlimited internet",
  },
  {
    icon: Zap,
    title: "Power Backup",
    description: "24×7 electricity backup",
  },
  {
    icon: WashingMachine,
    title: "Washing Machine",
    description: "Free access",
  },
  {
    icon: Home,
    title: "Spacious Rooms",
    description: "Clean & well-ventilated",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "CCTV & secure entry",
  },
  {
    icon: Snowflake,
    title: "AC Available",
    description: "On request",
  },
  {
    icon: Droplets,
    title: "RO Water",
    description: "24×7 purified drinking water",
  },
  {
    icon: Tv,
    title: "Common TV Room",
    description: "Relax & socialize",
  },
  {
    icon: Car,
    title: "Parking Space",
    description: "Two-wheeler parking",
  },
];

const Facilities = () => {
  return (
    <section id="facilities" className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
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
            Everything You{" "}
            <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
              Need
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Modern amenities designed for your comfort and convenience
          </p>
        </motion.div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {facilities.map((facility, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-all duration-300 text-center"
            >
              <motion.div 
                className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent flex items-center justify-center group-hover:bg-gradient-primary transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <facility.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-1">
                {facility.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {facility.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
