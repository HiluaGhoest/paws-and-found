import type { PhotoCredit } from '../../types';

interface PhotoCreditProps {
  photoCredit: PhotoCredit;
}

export default function PhotoCreditComponent({ photoCredit }: PhotoCreditProps) {
  return (
    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded backdrop-blur-sm max-w-xs">
      <div className="text-center">
        Photo by{' '}
        <a
          href={photoCredit.photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:text-blue-200 underline font-medium"
        >
          {photoCredit.photographer}
        </a>
        {' '}on{' '}
        <a
          href={photoCredit.unsplashUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:text-blue-200 underline font-medium"
        >
          Unsplash
        </a>
      </div>
    </div>
  );
}
