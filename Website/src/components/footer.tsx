"use client";

import * as React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden flex flex-col items-center justify-end pt-16 sm:pt-28 pb-2 sm:pb-4 select-none pointer-events-none">
      {/* Giant EnvOS Wordmark with decreased opacity and black fade, moved down */}
      <div className="relative w-full max-w-6xl h-32 sm:h-52 md:h-68 lg:h-80 opacity-20 [mask-image:linear-gradient(to_bottom,black_15%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_15%,transparent_92%)] translate-y-4 sm:translate-y-8">
        <Image
          src="/envos-wordmark.png"
          alt="EnvOS"
          fill
          priority
          className="object-contain"
        />
        {/* Gradient overlay to dissolve seamlessly into the black page bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
      </div>
    </footer>
  );
}

export default Footer;
