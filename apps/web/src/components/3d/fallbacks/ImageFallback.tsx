'use client';

import Image from 'next/image';

interface ImageFallbackProps {
  src?: string;
  alt?: string;
}

export const ImageFallback = ({
  src = '/images/hero-fallback.jpg',
  alt = 'Hero background',
}: ImageFallbackProps) => {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
    </div>
  );
};
