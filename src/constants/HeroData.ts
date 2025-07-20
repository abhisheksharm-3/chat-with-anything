import youtubeImg from "@/assets/images/logos/youtube.png";
import githubImg from "@/assets/images/logos/github.png";
import notionImg from "@/assets/images/logos/notion.png";
import sheetsImg from "@/assets/images/logos/sheets.png";
import docsImg from "@/assets/images/logos/docs.png";
import pdfImg from "@/assets/images/logos/pdf.png";
import imageFileImg from "@/assets/images/logos/flat-color-icons_image-file.png";
import slidesImg from "@/assets/images/logos/slides.png";

// Floating logo configurations
export const FloatingLogosData = [
  {
    src: youtubeImg,
    alt: "YouTube Logo",
    position: "top-[25%] left-[35%] md:top-[30%] md:left-[13%]",
    rotation: "rotate-18",
    size: "w-[45px] h-auto md:w-[60px]",
    width: 60,
    height: 60,
  },
  {
    src: githubImg,
    alt: "GitHub Logo",
    position: "top-[25%] right-[33%] md:top-[30%] md:right-[25%]",
    rotation: "rotate-8",
    size: "w-[45px] h-auto md:w-[60px]",
    width: 60,
    height: 60,
  },
  {
    src: notionImg,
    alt: "Notion Logo",
    position: "bottom-[45%] left-[28%] md:bottom-[5%] md:left-[13%]",
    rotation: "-rotate-17",
    size: "w-[35px] h-auto md:w-[50px]",
    width: 60,
    height: 60,
  },
  {
    src: sheetsImg,
    alt: "Google Sheets Logo",
    position: "bottom-[45%] right-[28%] md:top-[85%] md:right-[10%]",
    rotation: "-rotate-10",
    size: "w-[45px] h-auto md:w-[60px]",
    width: 60,
    height: 60,
  },
  {
    src: docsImg,
    alt: "Google Docs Logo",
    position: "bottom-[55%] right-[15%] md:bottom-[20%] md:right-[23%]",
    rotation: "rotate-17",
    size: "w-[45px] h-auto md:w-[60px]",
    width: 60,
    height: 60,
  },
  {
    src: pdfImg,
    alt: "PDF Logo",
    position: "top-[27%] left-[10%] md:top-[55%] md:left-[0%]",
    rotation: "-rotate-16",
    size: "w-[45px] h-auto md:w-[60px]",
    width: 60,
    height: 60,
  },
  {
    src: imageFileImg,
    alt: "Image Logo",
    position: "bottom-[53%] left-[10%] md:bottom-[25%] md:left-[25%]",
    rotation: "-rotate-16",
    size: "w-[45px] h-auto md:w-[60px]",
    width: 60,
    height: 60,
  },
  {
    src: slidesImg,
    alt: "Slides Logo",
    position: "top-[28%] right-[10%] md:top-[40%] md:right-[12%]",
    rotation: "rotate-6",
    size: "w-[35px] h-auto md:w-[50px]",
    width: 40,
    height: 40,
  },
];

// Word rotate options
export const RotateWords = [
  "PDF",
  "Google Docs",
  "Google Sheets",
  "YouTube Video",
  "Slides",
  "Image",
  "Video",
  "URL",
];
