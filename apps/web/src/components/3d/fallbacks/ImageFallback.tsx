'use client';

interface ImageFallbackProps {
  src?: string;
  alt?: string;
}

export const ImageFallback = ({
  src = '/images/hero-fallback.jpg',
  alt = 'Hero background',
}: ImageFallbackProps) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};
