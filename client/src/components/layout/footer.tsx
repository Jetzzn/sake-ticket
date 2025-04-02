import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    { name: "About", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
  ];

  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {footerLinks.map((link) => (
            <div key={link.name} className="px-5 py-2">
              <Link
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                {link.name}
              </Link>
            </div>
          ))}
        </nav>
        
        <div className="mt-8 flex justify-center space-x-6">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{social.name}</span>
              <social.icon className="h-6 w-6" />
            </a>
          ))}
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} OrderTracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
