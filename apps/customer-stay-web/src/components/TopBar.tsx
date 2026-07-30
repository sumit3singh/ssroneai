import { Phone, MessageCircle, Clock } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-gradient-to-r from-primary via-rose-medium to-primary py-2 px-4">
      <div className="container-custom flex items-center justify-center md:justify-between gap-4 text-primary-foreground text-xs md:text-sm">
        {/* Left - Contact */}
        <div className="flex items-center gap-4 md:gap-6">
          <a 
            href="tel:+918683849395" 
            className="flex items-center gap-1.5 hover:text-gold transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">+91 8683849395</span>
          </a>
          
          <span className="hidden sm:block w-px h-4 bg-primary-foreground/30" />
          
          <a
            href="https://wa.me/918683849395"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-gold transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Chat Now</span>
          </a>
        </div>

        {/* Right - Hours */}
        <div className="hidden md:flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>Office Hours: 6 AM – 11 PM</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
