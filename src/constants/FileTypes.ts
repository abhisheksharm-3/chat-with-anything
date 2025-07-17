import pdfIcon from '@/assets/images/logos/pdf.png';
import docsIcon from '@/assets/images/logos/docs.png';
import sheetsIcon from '@/assets/images/logos/sheets.png';
import slidesIcon from '@/assets/images/logos/slides.png';
import imageIcon from '@/assets/images/logos/flat-color-icons_image-file.png';
import youtubeIcon from '@/assets/images/logos/youtube.png';
import githubIcon from '@/assets/images/logos/github.png';
import notionIcon from '@/assets/images/logos/notion.png'

export const fileTypes = [
  {
    id: 'pdf',
    name: 'PDF',
    image: pdfIcon,
  },
  {
    id: 'docs',
    name: 'Document',
    image: docsIcon,
  },
  {
    id: 'image',
    name: 'Image',
    image: imageIcon,
  },
  {
    id: 'sheets',
    name: 'Spreadsheet',
    image: sheetsIcon,
  },
  {
    id: 'slides',
    name: 'Presentation',
    image: slidesIcon,
  },
  {
    id: 'youtube',
    name: 'YouTube Video',
    image: youtubeIcon,
  },
  {
    id: 'github',
    name: 'GitHub Repo',
    image: githubIcon,
    comingSoon: true,
  },
  {
    id: 'notion',
    name: 'Notion Page',
    image: notionIcon,
    comingSoon: true,
  },
];