import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../misc/Modal';

interface Post {
  id: string;
  content: string;
  pet_name: string;
  pet_type: string;
  location: string;
  status: 'lost' | 'found' | 'adoption';
  created_at: string;
  user_id: string;
  image_urls?: string[];
  profiles?: {
    email: string;
  };
}

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!post) return null;

  const getUserDisplayName = () => {
    if (post.profiles?.email) {
      return post.profiles.email.split('@')[0];
    }
    return 'Anonymous User';
  };

  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'lost':
        return 'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white border-red-400/30';
      case 'found':
        return 'bg-gradient-to-r from-green-500/80 to-green-600/80 text-white border-green-400/30';
      case 'adoption':
        return 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white border-blue-400/30';
      default:
        return 'bg-white/10 text-white/80 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'lost':
        return '🔍 Lost Pet';
      case 'found':
        return '✅ Found Pet';
      case 'adoption':
        return '💙 For Adoption';
      default:
        return status;
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleContactClick = () => {
    if (post.profiles?.email) {
      window.location.href = `mailto:${post.profiles.email}?subject=Regarding ${post.pet_name} - ${getStatusLabel(post.status)}&body=Hi, I saw your post about ${post.pet_name} and would like to get in touch.`;
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.pet_name} - ${getStatusLabel(post.status)}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`${post.pet_name} - Details`}
      >
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xl">
              {getUserInitial()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-white drop-shadow-lg">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-white/70">
                    Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border shadow-lg ${getStatusStyle(post.status)}`}>
                  {getStatusLabel(post.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Pet Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              {post.pet_name}
              {post.pet_type && <span className="text-white/80 font-normal"> • {post.pet_type}</span>}
            </h2>
            
            {post.location && (
              <div className="flex items-center text-blue-300 text-lg font-medium mb-4">
                <span>📍 {post.location}</span>
              </div>
            )}

            <div className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg">
              {post.content}
            </div>
          </div>

          {/* Images Gallery */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
                Photos ({post.image_urls.length})
              </h3>
              <div className={`grid gap-4 ${
                post.image_urls.length === 1 ? 'grid-cols-1' :
                post.image_urls.length === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {post.image_urls.map((imageUrl, index) => (
                  <div key={index} className="relative group overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`${post.pet_name} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl border border-white/20 group-hover:border-white/40 transition-all duration-300 cursor-pointer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        console.warn('Failed to load image:', imageUrl);
                      }}
                      onClick={() => handleImageClick(index)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                        View Full Size
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-white/80">
                <span className="text-lg mr-2">📧</span>
                <span className="text-blue-300">{post.profiles?.email || 'Email not available'}</span>
              </div>
              <div className="text-white/70 text-sm">
                Click the contact button below to send an email directly to the pet owner.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleContactClick}
              className="flex-1 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm text-white py-4 rounded-xl hover:from-blue-600/80 hover:to-purple-600/80 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <span className="text-xl">📞</span>
              <span>Contact Owner</span>
            </button>
            
            <button
              onClick={handleShareClick}
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-white py-4 px-6 rounded-xl transition-all duration-300 font-semibold flex items-center space-x-2"
            >
              <span className="text-xl">📤</span>
              <span>Share</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Lightbox Modal */}
      {showImageModal && post.image_urls && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={`${post.pet_name} - Photo ${selectedImageIndex + 1} of ${post.image_urls.length}`}
        >
          <div className="space-y-4">
            <div className="relative">
              <img
                src={post.image_urls[selectedImageIndex]}
                alt={`${post.pet_name} - Image ${selectedImageIndex + 1}`}
                className="w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>
            
            {post.image_urls.length > 1 && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : post.image_urls!.length - 1)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-white py-2 px-4 rounded-xl transition-all duration-300 font-semibold"
                >
                  ← Previous
                </button>
                <span className="flex items-center text-white/80 px-4">
                  {selectedImageIndex + 1} / {post.image_urls.length}
                </span>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev < post.image_urls!.length - 1 ? prev + 1 : 0)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-white py-2 px-4 rounded-xl transition-all duration-300 font-semibold"
                >
                  Next →
                </button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {post.image_urls.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    index === selectedImageIndex ? 'border-blue-400' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-16 object-cover"
                  />
                  {index === selectedImageIndex && (
                    <div className="absolute inset-0 bg-blue-400/20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
