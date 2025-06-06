import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import PostDetailModal from './PostDetailModal';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaSearch, FaCheck, FaPhone } from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { MdPets } from 'react-icons/md';

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

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleLike();
  };

  const getUserDisplayName = () => {
    if (post.profiles?.email) {
      return post.profiles.email.split('@')[0]; // Use the part before @ as display name
    }
    return 'Anonymous User';
  };

  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
        return (
          <span className="flex items-center gap-1">
            <FaSearch className="w-3 h-3" />
            Lost Pet
          </span>
        );
      case 'found':
        return (
          <span className="flex items-center gap-1">
            <FaCheck className="w-3 h-3" />
            Found Pet
          </span>
        );
      case 'adoption':
        return (
          <span className="flex items-center gap-1">
            <MdPets className="w-3 h-3" />
            For Adoption
          </span>
        );
      default:
        return status;
    }
  };return (
    <>      <div 
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl hover:shadow-xl hover:border-white/30 transition-all duration-300 cursor-pointer max-w-sm mx-auto"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Header */}
        <div className="p-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg text-sm">
                {getUserInitial()}
              </div>
              <div>
                <div className="font-semibold text-white text-xs">
                  {getUserDisplayName()}
                </div>
                <div className="text-xs text-white/70">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm border shadow-lg ${getStatusStyle(post.status)}`}>
              {getStatusLabel(post.status)}
            </span>
          </div>
        </div>        {/* Main Image - Fill vertical space */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div 
            className="relative w-full h-screen max-h-[70vh] group"
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={post.image_urls[0]}
              alt={`${post.pet_name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                console.warn('Failed to load image:', post.image_urls![0]);
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(post.image_urls![0], '_blank');
              }}
            />
              {/* Overlay Buttons */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Action Buttons - Bottom Right */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-3">
                {/* Profile Picture Button */}
                <button
                  className="w-12 h-12 flex items-center justify-center transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle profile click
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitial()}
                  </div>
                </button>                {/* Like Button */}
                <button
                  className="w-12 h-12 flex items-center justify-center transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                >
                  {isLiked ? (
                    <FaHeart className="w-6 h-6 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-6 h-6 text-white" />
                  )}
                </button>

                {/* Comments Button */}
                <button
                  className="w-12 h-12 flex items-center justify-center transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailModal(true); // Open detail modal for comments
                  }}
                >
                  <FaComment className="w-6 h-6 text-white" />
                </button>

                {/* Share Button */}
                <button
                  className="w-12 h-12 flex items-center justify-center transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `${post.pet_name} - ${getStatusLabel(post.status)}`,
                        text: post.content,
                        url: window.location.href
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <FaShare className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            {/* Image count indicator if multiple images */}
            {post.image_urls.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                1 / {post.image_urls.length}
              </div>
            )}
          </div>
        )}

        {/* Content Below Image */}
        <div className="p-3">
          {/* Pet Name and Type */}
          <h3 className="text-lg font-bold text-white mb-1">
            {post.pet_name}
            {post.pet_type && <span className="text-white/80 font-normal text-sm"> • {post.pet_type}</span>}
          </h3>          {/* Location */}
          {post.location && (
            <div className="flex items-center text-blue-300 text-xs font-medium mb-2">
              <IoLocationSharp className="w-3 h-3 mr-1" />
              <span>{post.location}</span>
            </div>
          )}          {/* Like count */}
          {likeCount > 0 && (
            <div className="flex items-center text-red-400 text-xs font-medium mb-2">
              <FaHeart className="w-3 h-3 mr-1" />
              <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Description */}
          <div className="text-white/90 text-xs leading-relaxed">
            {showFullDescription ? (
              <div>
                <p className="whitespace-pre-wrap">{post.content}</p>
                <button
                  className="text-blue-300 hover:text-blue-200 font-medium mt-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullDescription(false);
                  }}
                >
                  Show less
                </button>
              </div>
            ) : (
              <div>
                <p>{truncateDescription(post.content, 80)}</p>
                {post.content.length > 80 && (
                  <button
                    className="text-blue-300 hover:text-blue-200 font-medium text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullDescription(true);
                    }}
                  >
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>
        </div>        {/* Actions */}
        <div className="border-t border-white/20 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-b-2xl">
          <div className="flex justify-center">
            <button 
              className="flex items-center space-x-2 text-white/80 hover:text-green-300 transition-all duration-300 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <FaPhone className="w-4 h-4" />
              <span className="text-sm">Contact</span>
            </button>
          </div>
        </div>
      </div>

    <PostDetailModal 
      post={post}
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
    />
    </>
  );
}