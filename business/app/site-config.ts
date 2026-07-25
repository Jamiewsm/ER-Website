import type { Metadata } from "next";

export const siteUrl = "https://business.er-coaching.com";
export const businessEmail = "hello@er-coaching.com";
/** 문의 폼 제출 시 Cloudflare Email Routing으로 전달되는 수신 수신함 */
export const inquiryNotifyEmail = "restoration.son@gmail.com";
export const contactApiPath = "/api/contact";

export const legalOperator = {
  name: "에니어그램 포 레스토레이션",
  representative: "손지영",
  registrationNumber: "347-64-00804",
  address: "부산광역시 해운대구 재반로 166, 2층 S259호",
};

const socialImage = {
  url: "/og.png",
  width: 1731,
  height: 909,
  alt: "ER Business — 사람을 이해하면, 팀의 성과가 달라집니다.",
};

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url: path,
      locale: "ko_KR",
      siteName: "ER Business",
      title: `${title} | ER Business`,
      description,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ER Business`,
      description,
      images: [socialImage.url],
    },
  };
}
