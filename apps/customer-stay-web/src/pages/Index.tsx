import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import SafetySection from "@/components/SafetySection";
import Facilities from "@/components/Facilities";
import Rooms from "@/components/Rooms";
import WhyDifferent from "@/components/WhyDifferent";
import Testimonials from "@/components/Testimonials";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import FloatingButtons from "@/components/FloatingButtons";
import ScrollProgress from "@/components/ScrollProgress";
import SectionDivider from "@/components/SectionDivider";

const Index = () => {
  return (
    <div className="min-h-screen relative pt-[120px] bg-background text-foreground antialiased selection:bg-rose-medium selection:text-white">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Background Floating Ambient Orbs */}
      <FloatingElements />

      {/* Fixed Top Bar & Navigation */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <TopBar />
      </div>
      <Navbar />

      {/* Main Page Sections - Eager Pre-Loaded for 0ms Scroll Latency */}
      <main className="relative z-10">
        <Hero />

        <SectionDivider variant="wave" className="bg-background" />
        <About />

        <SectionDivider variant="curve" flip className="bg-blush" />
        <SafetySection />

        <SectionDivider variant="wave" className="bg-background" />
        <Facilities />

        <SectionDivider variant="curve" className="bg-background" />
        <Rooms />

        <SectionDivider variant="wave" flip className="bg-blush" />
        <WhyDifferent />

        <SectionDivider variant="curve" className="bg-background" />
        <Testimonials />

        <SectionDivider variant="wave" flip className="bg-blush" />
        <Location />

        <SectionDivider variant="curve" className="bg-background" />
        <Contact />
      </main>

      <Footer />

      {/* Floating Call & WhatsApp Buttons */}
      <FloatingButtons />
    </div>
  );
};

export default Index;
