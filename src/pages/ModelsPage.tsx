import Navbar from '../components/Navbar';
import Models from '../components/Models';
import Footer from '../components/Footer';

export default function ModelsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Models />
      </main>
      <Footer />
    </>
  );
}
