import HeroSection from "@/components/HeroSection";
import PainPointsSection from "@/components/PainPointsSection";
import DetectionMockupSection from "@/components/DetectionMockupSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TechPrivacySection from "@/components/TechPrivacySection";
import DataPanelSection from "@/components/DataPanelSection";
import FooterCTASection from "@/components/FooterCTASection";
import ModelPreloader from "@/components/ModelPreloader";

export default function Home() {
  return (
    <>
      <ModelPreloader />
      <HeroSection />
      <PainPointsSection />
      <DetectionMockupSection />
      <FeaturesSection />
      <TestimonialsSection />
      <TechPrivacySection />
      <DataPanelSection />
      <FooterCTASection />
    </>
  );
}