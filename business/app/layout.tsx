import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { businessEmail, legalOperator, siteUrl } from "./site-config";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ER Business | 기업교육·조직 컨설팅",
    template: "%s | ER Business",
  },
  description:
    "개인의 욕구·성향·강점을 팀의 소통, 역할 배치, 업무 실행으로 연결하는 기업교육·조직 컨설팅.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "ko_KR",
    siteName: "ER Business",
    title: "ER Business | 사람을 이해하면, 팀의 성과가 달라집니다",
    description:
      "사람을 읽고, 역할을 맞추고, 팀의 성과를 설계하는 기업교육·조직 컨설팅.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "ER Business — 사람을 이해하면, 팀의 성과가 달라집니다.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ER Business | 기업교육·조직 컨설팅",
    description:
      "개인의 욕구·성향·강점을 소통, 역할, 실행으로 연결합니다.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#17271b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "ER Business",
    legalName: legalOperator.name,
    url: siteUrl,
    email: businessEmail,
    description:
      "개인의 동기·성향·강점을 팀의 소통, 역할 배치, 업무 실행으로 연결하는 기업교육·조직 컨설팅.",
    areaServed: ["KR", "US"],
  };

  return (
    <html lang="ko">
      <body className={geist.variable}>
        <a className="skip-link" href="#main-content">
          본문으로 바로가기
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
