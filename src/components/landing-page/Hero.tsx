// This component serves as the primary visual and textual introduction on the homepage.
// It typically includes a headline, a subheading, and a call-to-action (CTA) button to engage users right from the start.
// This component plays a crucial role in setting the tone and providing key information about the product or service.

import Image from 'next/image';
import ButtonCta from './ButtonCta';
import GlowEffect from './GlowEffect';

import youtubeImg from '@/assets/images/logos/youtube.png';
import githubImg from '@/assets/images/logos/github.png';
import notionImg from '@/assets/images/logos/notion.png';
import sheetsImg from '@/assets/images/logos/sheets.png';
import docsImg from '@/assets/images/logos/docs.png';
import pdfImg from '@/assets/images/logos/pdf.png';
import imageFileImg from '@/assets/images/logos/flat-color-icons_image-file.png';
import slidesImg from '@/assets/images/logos/slides.png';
import { WordRotate } from '../magicui/word-rotate';

const Hero = () => {
  return (
    <section className='relative mx-auto space-y-20 px-4 overflow-hidden min-h-[80vh] flex items-center border-b border-primary/10'>
      {/* Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-grid-pattern" />
        {/* Radial blur to fade grid into background */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#121212] opacity-90" />
      </div>
      
      {/* Reusable Glow Effect */}
      <GlowEffect 
        color="#5463FF" 
        intensity="medium" 
        variant="centered" 
      />
      
      {/* Floating Logos */}
      <div className="absolute inset-0 z-0 max-w-6xl mx-auto">
        <div className="absolute top-[30%] left-[10%] rotate-18">
          <Image src={youtubeImg} alt="YouTube Logo" width={60} height={60} />
        </div>
        <div className="absolute top-[35%] right-[15%] rotate-8">
          <Image src={githubImg} alt="GitHub Logo" width={60} height={60} />
        </div>
        <div className="absolute bottom-[5%] left-[13%] -rotate-17">
          <Image src={notionImg} alt="Notion Logo" width={60} height={60} />
        </div>
        <div className="absolute top-[85%] right-[10%] -rotate-10">
          <Image src={sheetsImg} alt="Google Sheets Logo" width={60} height={60} />
        </div>
        <div className="absolute bottom-[20%] right-[23%] rotate-17">
          <Image src={docsImg} alt="Google Docs Logo" width={60} height={60} />
        </div>
        <div className="absolute top-[55%] -rotate-16">
          <Image src={pdfImg} alt="PDF Logo" width={60} height={60} />
        </div>
        <div className="absolute bottom-[25%] left-[25%] -rotate-16">
          <Image src={imageFileImg} alt="Image Logo" width={60} height={60} />
        </div>
        <div className="absolute top-[45%] right-[2%] rotate-16">
          <Image src={slidesImg} alt="Slides Logo" width={60} height={60} />
        </div>
      </div>
      
      <div className='flex flex-col justify-center relative z-10 w-full'>
        <div className='space-y-6 max-w-2xl mx-auto'>
          <div className='text-center text-4xl md:text-5xl font-extralight tracking-tight text-white'>
            Now chat with any <WordRotate className='font-bold' words={["PDF", "Google Docs", "Google Sheets", "YouTube Video", "Slides", "Image", "Video", "URL"]} />
          </div>
          <div className='max-w-md mx-auto text-center text-lg text-gray-400 mt-6'>
            Using doc2text ask questions, get information from a document, image, video, URL, github repo and more.
          </div>
        </div>
        <div className='mt-10 min-w-96 mx-auto'>
          <ButtonCta className='py-6' />
        </div>
      </div>
    </section>
  );
};

export default Hero;