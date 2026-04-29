import { lazy, Suspense } from 'react';
import Navbar from '../components/Navbar';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const PurpleAmbientBg = lazy(() => import('../components/PurpleAmbientBg'));

export default function FAQPage() {
  return (
    <>
      <Suspense fallback={null}>
        <PurpleAmbientBg />
      </Suspense>
      <Navbar />
      <main className="pt-20">
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
