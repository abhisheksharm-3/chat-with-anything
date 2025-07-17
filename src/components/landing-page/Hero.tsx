import Image from 'next/image';
import ButtonCta from './ButtonCta';

import youtubeImg from '@/assets/images/logos/youtube.png';
import githubImg from '@/assets/images/logos/github.png';
import notionImg from '@/assets/images/logos/notion.png';
import sheetsImg from '@/assets/images/logos/sheets.png';
import docsImg from '@/assets/images/logos/docs.png';
import pdfImg from '@/assets/images/logos/pdf.png';
import imageFileImg from '@/assets/images/logos/flat-color-icons_image-file.png';
import slidesImg from '@/assets/images/logos/slides.png';
import { WordRotate } from '../magicui/word-rotate';
import GlowBackground from '../shared/GlowBackground';

const Hero = () => {
  return (
    <section className='relative mx-auto space-y-20 px-4 overflow-hidden min-h-[80vh] flex items-center border-b border-primary/10'>
      {/* Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-grid-pattern" />
        {/* Radial blur to fade grid into background */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#121212] opacity-90" />
      </div>
      
      <GlowBackground />
      
      {/* Floating Logos - Responsive positioning */}
      <div className="absolute inset-0 z-0 max-w-6xl mx-auto">
        {/* YouTube Logo */}
        <div className="absolute top-[25%] left-[35%] md:top-[30%] md:left-[13%] rotate-18 opacity-70">
          <Image src={youtubeImg} alt="YouTube Logo" width={60} height={60} className="w-[45px] h-auto md:w-[60px]" />
        </div>
        
        {/* GitHub Logo */}
        <div className="absolute top-[25%] right-[33%] md:top-[30%] md:right-[25%] rotate-8 opacity-70">
          <Image src={githubImg} alt="GitHub Logo" width={60} height={60} className="w-[45px] h-auto md:w-[60px]" />
        </div>
        
        {/* Notion Logo */}
        <div className="absolute bottom-[45%] left-[28%] md:bottom-[5%] md:left-[13%] -rotate-17 opacity-70">
          <Image src={notionImg} alt="Notion Logo" width={60} height={60} className="w-[35px] h-auto md:w-[50px]" />
        </div>
        
        {/* Google Sheets Logo */}
        <div className="absolute bottom-[45%] right-[28%] md:top-[85%] md:right-[10%] -rotate-10 opacity-70">
          <Image src={sheetsImg} alt="Google Sheets Logo" width={60} height={60} className="w-[45px] h-auto md:w-[60px]" />
        </div>
        
        {/* Google Docs Logo */}
        <div className="absolute bottom-[55%] right-[15%] md:bottom-[20%] md:right-[23%] rotate-17 opacity-70">
          <Image src={docsImg} alt="Google Docs Logo" width={60} height={60} className="w-[45px] h-auto md:w-[60px]" />
        </div>
        
        {/* PDF Logo */}
        <div className="absolute top-[27%] left-[10%] md:top-[55%] md:left-[0%] -rotate-16 opacity-70">
          <Image src={pdfImg} alt="PDF Logo" width={60} height={60} className="w-[45px] h-auto md:w-[60px]" />
        </div>
        
        {/* Image Logo */}
        <div className="absolute bottom-[53%] left-[10%] md:bottom-[25%] md:left-[25%] -rotate-16 opacity-70">
          <Image src={imageFileImg} alt="Image Logo" width={60} height={60} className="w-[45px] h-auto md:w-[60px]" />
        </div>
        
        {/* Slides Logo */}
        <div className="absolute top-[28%] right-[10%] md:top-[40%] md:right-[12%] rotate-6 opacity-70">
          <Image src={slidesImg} alt="Slides Logo" width={40} height={40} className="w-[35px] h-auto md:w-[50px]" />
        </div>
      </div>
      
      <div className='flex flex-col justify-center relative z-10 w-full'>
        <div className='space-y-6 max-w-2xl mx-auto'>
          <div className='text-center text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight'>
            Now chat with any <WordRotate className='font-bold' words={["PDF", "Google Docs", "Google Sheets", "YouTube Video", "Slides", "Image", "Video", "URL"]} />
          </div>
          <div className='max-w-md mx-auto text-center text-base md:text-lg text-gray-400 mt-20 px-10 md:mt-10'>
            Using doc2text ask questions, get information from a document, image, video, URL, github repo and more.
          </div>
        </div>
        <div className='mt-10 min-w-96 mx-auto px-12 md:px-0'>
          <ButtonCta className='py-6' showArrow={true} />
        </div>
      </div>
    </section>
  );
};

export default Hero;