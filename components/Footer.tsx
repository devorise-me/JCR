import {
  FaEnvelope,
  FaMobileAlt,
  FaInstagram,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white w-full py-20 px-10">
      <div className="container flex items-start justify-between max-sm:flex-col max-sm:items-center max-sm:gap-5 max-sm:p-0">
        <div className="text-right max-sm:text-center">
          <h2 className="font-bold text-3xl">رياضة الهجن الأردنية</h2>
          <p>البطولات المحلية في الاردن لسباق الهجن</p>
          <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13872.90061804163!2d35.5189175!3d29.6262032!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1500ebd250cabcb3%3A0xb7f08658dd3db1c4!2sSheikh%20Zayed%20Bin%20Sultan%20Al%20Nahyan%20Camel%20Stadium!5e0!3m2!1sen!2sjo!4v1726321189938!5m2!1sen!2sjo" className="border-0 max-w-[600px] aspect-square w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div className="flex flex-col items-end justify-center gap-3 max-sm:items-center">
          <h2 className="font-bold text-3xl">تواصل معنا</h2>
          <p>
            <span className="flex items-center gap-2">
              <a className="underline" href="mailto:info@crfjo.com">
                info@crfjo.com
              </a>
              : ايميل <FaEnvelope />
            </span>
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/desert_magic/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram
                size={40}
                color="#FFFFFF"
                className="border-2 border-white rounded-full p-2"
              />
            </a>
            <a
              href="https://www.facebook.com/desert.Magic.rum/?locale=ar_AR"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook
                size={40}
                color="#FFFFFF"
                className="border-2 border-white rounded-full p-2"
              />
            </a>
            <a
              href="https://www.youtube.com/@camelracejo/videos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube
                size={40}
                color="#FFFFFF"
                className="border-2 border-white rounded-full p-2"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="container flex items-center mt-5 max-sm:p-0">
        <span className="w-full border border-1 border-white h-[1px] max-sm:hidden" />
        <p className="whitespace-nowrap mx-2 max-sm:text-center max-sm:w-full">
          جميع الحقوق محفوظة &copy; 2024
        </p>
      </div>
      <div className="container flex items-center mt-5 max-sm:p-0">
        <p className="whitespace-nowrap mx-2 max-sm:text-center text-xs max-sm:w-full">
          powered by Devorise Media and Business Solutions
        </p>
      </div>
    </footer>
  );
};

export default Footer;
