import { Press_Start_2P } from "next/font/google";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function NotFound() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100 font-pixel ${pressStart2P.className}`}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-text">Page Not Found</h1>
        <p className="text-text">Sorry, the page you are looking for does not exist.</p>
      </div>
    </main>
  );
}