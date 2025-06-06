import type { PhotoCredit } from '../../types';
import PhotoCreditComponent from './PhotoCredit';

interface BackgroundImageProps {
  bgUrl: string;
  photoCredit: PhotoCredit | null;
}

export default function BackgroundImage({ bgUrl, photoCredit }: BackgroundImageProps) {
  return (
    <div 
      className="w-1/2 bg-gray-800 bg-cover bg-center min-h-screen relative"
      style={{ 
        backgroundImage: bgUrl ? `url(${bgUrl})` : 'none'
      }}
    >
      {/* Loading state */}
      {!bgUrl && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-lg">Loading image...</div>
        </div>
      )}
      
      {/* Photo attribution - Compliant with Unsplash API requirements */}
      {bgUrl && photoCredit && (
        <PhotoCreditComponent photoCredit={photoCredit} />
      )}
    </div>
  );
}
