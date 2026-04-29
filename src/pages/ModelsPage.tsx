import { lazy, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Models from '../components/Models';
import Footer from '../components/Footer';

const HoloCardsBg = lazy(() => import('../components/HoloCardsBg'));

export default function ModelsPage() {
  return (
    <>
      <Navbar />
      <main className="relative pt-20">
        <Suspense fallback={null}>
          <HoloCardsBg />
        </Suspense>
        <Models />
      </main>
      <Footer />
    </>
  );
}
