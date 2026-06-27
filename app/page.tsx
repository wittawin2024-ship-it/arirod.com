import type { Metadata } from "next";
import HomeAssistantExperience from "@/components/HomeAssistantExperience";

export const metadata: Metadata = {
  title: "AraiRod AI | ผู้ช่วยดูแลรถยนต์ วิเคราะห์ปัญหาและแนะนำวิธีแก้ไข",
  description:
    "เล่าอาการรถของคุณให้ AraiRod AI วิเคราะห์ปัญหา แนะนำวิธีแก้ไข ประเมินความเร่งด่วน และช่วยหาอะไหล่หรืออู่ที่เหมาะสม",
};

export default function HomePage() {
  return (
    <>
      <HomeAssistantExperience />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AraiRod AI",
            alternateName: "AraiRod.com",
            url: "https://arairod.com",
            description:
              "AI Automotive Assistant ผู้ช่วยวิเคราะห์ปัญหารถยนต์ แนะนำวิธีแก้ไข และช่วยหาอะไหล่หรืออู่ที่เหมาะสม",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://arairod.com/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
