import pdfIcon from "@/assets/images/logos/pdf.png";
import docsIcon from "@/assets/images/logos/docs.png";
import sheetsIcon from "@/assets/images/logos/sheets.png";
import slidesIcon from "@/assets/images/logos/slides.png";
import imageIcon from "@/assets/images/logos/flat-color-icons_image-file.png";
import youtubeIcon from "@/assets/images/logos/youtube.png";
import githubIcon from "@/assets/images/logos/github.png";
import notionIcon from "@/assets/images/logos/notion.png";
import { TypeFileTypeConfig } from "@/types/TypeUpload";

export const FileTypes: TypeFileTypeConfig[] = [
  {
    type: "pdf",
    name: "PDF",
    image: pdfIcon,
    accept: ".pdf,application/pdf",
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    type: "doc",
    name: "Document",
    image: docsIcon,
    accept:
      ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    type: "image",
    name: "Image",
    image: imageIcon,
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  {
    type: "sheet",
    name: "Spreadsheet",
    image: sheetsIcon,
    accept:
      ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    type: "slides",
    name: "Presentation",
    image: slidesIcon,
    accept:
      ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    type: "video",
    name: "YouTube Video",
    image: youtubeIcon,
    accept: "",
    maxSize: 0,
    urlOnly: true,
  },
  {
    type: "github",
    name: "GitHub Repo",
    image: githubIcon,
    accept: "",
    maxSize: 0,
    comingSoon: true,
    urlOnly: true,
  },
  {
    type: "notion",
    name: "Notion Page",
    image: notionIcon,
    accept: "",
    maxSize: 0,
    comingSoon: true,
    urlOnly: true,
  },
];

// Helper function to get file type config
export const getFileTypeConfig = (fileType: string): TypeFileTypeConfig => {
  return FileTypes.find((ft) => ft.type === fileType) || FileTypes[0];
};

// Helper function to get all accepted file types
export const getAllAcceptedFileTypes = (): string[] => {
  return FileTypes.reduce((acc, ft) => {
    if (ft.accept) {
      acc.push(...ft.accept.split(","));
    }
    return acc;
  }, [] as string[]);
};
