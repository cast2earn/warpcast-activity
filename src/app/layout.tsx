import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import PrivyWrapper from "@/components/PrivyWrapper";

// Konfigurasi font Press Start 2P
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Metadata untuk Frame Embed Mini Apps
export const metadata = {
  title: "Farcaster Activity",
  description: "View your Farcaster activity and points",
  openGraph: {
    title: "Farcaster Activity",
    description: "Check your Farcaster activity stats and points!",
    images: [
      {
        url: "https://www.cast2earn.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "Farcaster Activity Preview",
      },
    ],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://www.cast2earn.fun/og-image.png",
      aspectRatio: "3:2",
      button: {
        title: "View My Activity Score",
        action: {
          type: "launch_frame",
          name: "FarcasterActivity",
          url: "https://www.cast2earn.fun",
          splashImageUrl: "https://www.cast2earn.fun/splash.png",
          splashBackgroundColor: "#0052FF",
        },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pressStart2P.className}>
      <body>
        <PrivyWrapper>{children}</PrivyWrapper>
      </body>
    </html>
  );
}