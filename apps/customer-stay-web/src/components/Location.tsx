import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@ssrone/ui/customer";

const nearbyPlaces = [
  { name: "Central University of Haryana", distance: "0.3 km" },
  { name: "Railway Station", distance: "10 km" },
  { name: "Bus Stand", distance: "9 km" },
  { name: "Market", distance: "Very close" },
];

const Location = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-accent/50 rounded-full blur-3xl" />

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
              Conveniently{" "}
              <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
                Located
              </span>
            </h2>

            <motion.div
              className="flex items-start gap-4 mb-8"
              whileHover={{ x: 5 }}
            >
              <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  SSR One AI
                </h3>
                <p className="text-muted-foreground">
                  Near CUH Gate No. 1
                  <br />
                  City – 123029
                </p>
              </div>
            </motion.div>

            {/* Nearby Places */}
            <div className="mb-8">
              <h4 className="font-semibold text-foreground mb-4">
                Nearby Places:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {nearbyPlaces.map((place, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-primary" />
                    <div>
                      <span className="text-sm text-foreground">
                        {place.name}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {place.distance}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="hero"
                size="lg"
                className="rounded-full"
                onClick={() =>
                  window.open(
                    "https://maps.google.com/?q=Central+University+of+Haryana",
                    "_blank"
                  )
                }
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-2 bg-gradient-primary rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-elevated bg-accent">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.123456789!2d76.789!3d28.789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQ3JzIwLjQiTiA3NsKwNDcnMjAuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SSR One AI Location"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Location;
