import Footer from "@/components/Footer";
import Main from "@/components/Main";
import Nav from "@/components/Navigation/Nav";

export default function Home() {
  return (
    <main className="box-border min-h-screen">
      <Nav />
      <Main />
      <Footer />
    </main>
  );
}
