import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaShare, FaSearch, FaCheck, FaPhone } from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { MdPets } from 'react-icons/md';
import { supabase } from '../../lib/auth/supabaseClient';
import ImageCarousel from '../misc/ImageCarousel';

interface Post {
  id: string;
  content: string;
  pet_name: string;
  pet_type: string;
  location: string;
  status: 'lost' | 'found' | 'adoption';
  created_at: string;
  user_id: string;
  likes?: number;
  image_urls?: string[];
  profiles?: {
    email: string;
  };
}

interface PostCardProps {
  post: Post;
}

interface OverlayInstance {
  id: number;
  animating: boolean;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export default function PostCard({ post }: PostCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [overlays, setOverlays] = useState<OverlayInstance[]>([]);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  // Check if current user has liked this post
  useEffect(() => {
    checkIfUserLikedPost();
  }, [post.id]);

  const checkIfUserLikedPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking like status:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (isLoadingLike) return;
    
    try {
      setIsLoadingLike(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isLiked) {
        // Unlike: Remove from post_likes table
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (error) {
          console.error('Error unliking post:', error);
          return;
        }

        // Update local state
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like: Add to post_likes table
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          });

        if (error) {
          console.error('Error liking post:', error);
          return;
        }

        // Update local state
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Always like, never unlike on double-click
      if (!isLiked && !isLoadingLike) {
        setIsLoadingLike(true);
        
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          });

        if (error) {
          console.error('Error liking post:', error);
          setIsLoadingLike(false);
          return;
        }

        // Update local state
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        setIsLoadingLike(false);
      }
    } catch (error) {
      console.error('Error handling double click like:', error);
      setIsLoadingLike(false);
    }
    
    const overlayId = Date.now() + Math.random(); // Unique ID for this overlay
    
    // Generate random offset and rotation
    const offsetX = (Math.random() - 0.5) * 100; // -50px to +50px
    const offsetY = (Math.random() - 0.5) * 60;  // -30px to +30px
    const rotation = (Math.random() - 0.5) * 60; // -30deg to +30deg
    
    // Add new overlay in hidden state with random positioning
    setOverlays(prev => [...prev, { 
      id: overlayId, 
      animating: false,
      offsetX,
      offsetY,
      rotation
    }]);
    
    // Trigger entrance animation after a brief delay
    setTimeout(() => {
      setOverlays(prev => prev.map(overlay => 
        overlay.id === overlayId ? { ...overlay, animating: true } : overlay
      ));
    }, 50);
    
    // Start fade out after 750ms
    setTimeout(() => {
      setOverlays(prev => prev.map(overlay => 
        overlay.id === overlayId ? { ...overlay, animating: false } : overlay
      ));
    }, 750);
    
    // Remove overlay completely after fade out animation completes
    setTimeout(() => {
      setOverlays(prev => prev.filter(overlay => overlay.id !== overlayId));
    }, 1050);
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
  };  return (
    <div 
      className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl hover:shadow-xl hover:border-white/30 transition-all duration-300 max-w-sm mx-auto"
      onDoubleClick={handleDoubleClick}
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
        </div>        {/* Image Carousel */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div className="relative group">
            <ImageCarousel
              images={post.image_urls}
              altText={post.pet_name}
              className="w-full h-screen max-h-[70vh]"
            />
            
            {/* Overlay Buttons */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {/* Action Buttons - Bottom Right */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-3 pointer-events-auto">
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
                </button>                {/* Comments Button - Removed since detail modal is removed */}
                
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
        </div>        {/* Double-click Overlays */}
        {overlays.map((overlay) => (
          <div 
            key={overlay.id}
            className="absolute inset-0 rounded-2xl flex items-center justify-center z-50 pointer-events-none transition-all duration-300 ease-out"
            style={{
              transform: `translate(${overlay.offsetX}px, ${overlay.offsetY}px) ${overlay.animating ? 'scale(1.1)' : 'scale(0.8)'}`,
              opacity: overlay.animating ? 1 : 0
            }}
          >
            <FaHeart 
              className="w-16 h-16 text-red-500 drop-shadow-2xl transition-all duration-300"
              style={{
                transform: `rotate(${overlay.rotation}deg) ${overlay.animating ? 'scale(1)' : 'scale(0.5)'}`
              }}
            />
          </div>
        ))}
      </div>
  );
}