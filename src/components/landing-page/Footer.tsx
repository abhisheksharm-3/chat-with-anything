// This component is used to display the website's footer section.
import Link from 'next/link';

const Footer = () => {
  return (
    <div className="py-10 text-center text-gray-400 text-sm">
      <div className="flex justify-center items-center gap-3 flex-wrap">
        <span>© 2023 Doc2Text</span>
        <span>•</span>
        <Link href="/terms" className="hover:text-gray-300">
          Terms of service
        </Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-gray-300">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default Footer;
