import { HeroSection1 } from './blocks/hero-section-1';
import { FeaturesSection } from './blocks/features-section';
import { HowItWorksSection } from './blocks/how-it-works-section';
import { BenefitsSection } from './blocks/benefits-section';
import { UseCasesSection } from './blocks/use-cases-section';
import { FAQSection } from './blocks/faq-section';
import { Footer } from './blocks/footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection1 />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Use Cases Section */}
      <UseCasesSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}