import { Suspense, lazy } from "react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LazySection from "@/components/LazySection";
import SectionDivider from "@/components/SectionDivider";

const About = lazy(() => import("@/components/About"));
const SafetySection = lazy(() => import("@/components/SafetySection"));
const Facilities = lazy(() => import("@/components/Facilities"));
const Rooms = lazy(() => import("@/components/Rooms"));
const WhyDifferent = lazy(() => import("@/components/WhyDifferent"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const Location = lazy(() => import("@/components/Location"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingElements = lazy(() => import("@/components/FloatingElements"));
const FloatingButtons = lazy(() => import("@/components/FloatingButtons"));
const ScrollProgress = lazy(() => import("@/components/ScrollProgress"));

const sectionFallback = (
  <div className="section-padding bg-background/70 animate-pulse">
    <div className="mx-auto h-24 rounded-3xl bg-muted" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen relative pt-[120px]">
      {/* Scroll Progress */}
      <Suspense fallback={null}>
        <ScrollProgress />
      </Suspense>

      {/* Floating Decorative Elements */}
      <Suspense fallback={null}>
        <FloatingElements />
      </Suspense>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <TopBar />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        <Hero />

        <SectionDivider variant="wave" className="bg-background" />
        <LazySection loader={() => import("@/components/About")} fallback={sectionFallback} />

        <SectionDivider variant="curve" flip className="bg-blush" />
        <LazySection loader={() => import("@/components/SafetySection")} fallback={sectionFallback} />

        <SectionDivider variant="wave" className="bg-background" />
        <LazySection loader={() => import("@/components/Facilities")} fallback={sectionFallback} />

        <SectionDivider variant="curve" className="bg-background" />
        <LazySection loader={() => import("@/components/Rooms")} fallback={sectionFallback} />

        <SectionDivider variant="wave" flip className="bg-blush" />
        <LazySection loader={() => import("@/components/WhyDifferent")} fallback={sectionFallback} />

        <SectionDivider variant="curve" className="bg-background" />
        <LazySection loader={() => import("@/components/Testimonials")} fallback={sectionFallback} />

        <SectionDivider variant="wave" flip className="bg-blush" />
        <LazySection loader={() => import("@/components/Location")} fallback={sectionFallback} />

        <SectionDivider variant="curve" className="bg-background" />
        <LazySection loader={() => import("@/components/Contact")} fallback={sectionFallback} />
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      {/* Floating Buttons */}
      <Suspense fallback={null}>
        <FloatingButtons />
      </Suspense>
    </div>
  );
};

export default Index;
