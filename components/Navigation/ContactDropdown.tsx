import { useState, useRef, useEffect } from "react";
import { FaEnvelope, FaPhone, FaInstagram, FaFacebook } from "react-icons/fa";

const ContactDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <li ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 "
      >
        تواصل معنا
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-56 bg-white text-black border rounded-lg shadow-lg z-50">
          <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100">
            <FaPhone className="text-blue-500" />
            <span>+962-7-1234-5678</span>
          </li>
          <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100">
            <FaEnvelope className="text-red-500" />
            <a className="underline" href="mailto:info@crfjo.com">
              info@crfjo.com
            </a>
          </li>
          <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100">
            <FaInstagram className="text-pink-500" />
            <a className="underline" href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer">
              @yourpage
            </a>
          </li>
          <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100">
            <FaFacebook className="text-blue-700" />
            <a className="underline" href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
              /yourpage
            </a>
          </li>
        </ul>
      )}
    </li>
  );
};

export default ContactDropdown;