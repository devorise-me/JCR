import Footer from "@/components/Footer";
import Main from "@/components/Main";
import Nav from "@/components/Navigation/Nav";

export default function Home() {
  return (
    <main className="box-border min-h-screen w-full flex flex-col">
      <Nav />
      <div className="flex-1 w-full px-2 sm:px-4 md:px-8">
        <Main />
      </div>
      <Footer />
    </main>
  );
}
