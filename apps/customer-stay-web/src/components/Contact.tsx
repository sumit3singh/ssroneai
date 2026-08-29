import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@ssrone/ui/customer";
import { Input } from "@ssrone/ui/customer";
import { Textarea } from "@ssrone/ui/customer";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Phone,
    label: "Call",
    value: "+91 8683849395",
    href: "tel:+918683849395",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 8683849395",
    href: "https://wa.me/918683849395",
  },
  {
    icon: Mail,
    label: "Email",
    value: "thessronecafe@gmail.com",
    href: "mailto:thessronecafe@gmail.com",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "6 AM – 11 PM",
    href: null,
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    roomType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Show success animation
    setIsSubmitted(true);

    // Create WhatsApp message
    const whatsappMessage = `Hello! I'm interested in booking a room at SSR One AI. My name is ${formData.name}, email: ${formData.email}, room type: ${formData.roomType}. Message: ${formData.message}`;

    setTimeout(() => {
      window.open(
        `https://wa.me/918683849395?text=${encodeURIComponent(whatsappMessage)}`,
        "_blank"
      );
      setIsSubmitted(false);
    }, 1500);

    toast({
      title: "Redirecting to WhatsApp",
      description: "Please send the message to complete your inquiry.",
    });
  };

  return (
    <section id="contact" className="section-padding bg-blush relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
            Book Your{" "}
            <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
              Stay Today
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Get in touch with us to reserve your room
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-display font-bold text-foreground mb-6">
              Contact Information
            </h3>
            <div className="space-y-4 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  {info.href ? (
                    <a
                      href={info.href}
                      target={info.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-soft hover:shadow-card transition-all group"
                    >
                      <div className="p-3 rounded-lg bg-accent group-hover:bg-primary transition-colors">
                        <info.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block">
                          {info.label}
                        </span>
                        <span className="font-medium text-foreground">
                          {info.value}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-soft">
                      <div className="p-3 rounded-lg bg-accent">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block">
                          {info.label}
                        </span>
                        <span className="font-medium text-foreground">
                          {info.value}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Quick WhatsApp */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="hero"
                size="lg"
                className="w-full rounded-full relative overflow-hidden group"
                onClick={() => window.open("https://wa.me/918683849395", "_blank")}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-3xl p-6 md:p-8 shadow-card relative overflow-hidden"
          >
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-card z-10 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h4 className="text-xl font-display font-bold text-foreground">
                      Message Sent!
                    </h4>
                    <p className="text-muted-foreground">Redirecting to WhatsApp...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <h3 className="text-xl font-display font-bold text-foreground mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="h-12 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="h-12 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <select
                  value={formData.roomType}
                  onChange={(e) =>
                    setFormData({ ...formData, roomType: e.target.value })
                  }
                  className="w-full h-12 px-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="">Preferred Room Type</option>
                  <option value="Single Occupancy">Single Occupancy</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                </select>
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  className="resize-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="hero" size="lg" type="submit" className="w-full rounded-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
