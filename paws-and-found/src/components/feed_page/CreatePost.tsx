import { useState, useEffect, useRef } from 'react';
import { FiImage, FiMapPin, FiX } from 'react-icons/fi';
import { supabase } from '../../lib/auth/supabaseClient';
import { useNotification } from '../../contexts/NotificationContext';
import { ImageStorage } from '../../lib/storage/imageStorage';

interface CreatePostProps {
  user: any;
  onPostCreated: () => void;
}

export default function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'lost' | 'found' | 'adoption'>('lost');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useNotification();

  // Get user's location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get a readable address
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              
              // Format a nice location string
              const locationString = [
                data.locality || data.city,
                data.principalSubdivision || data.countryName
              ].filter(Boolean).join(', ');
              
              setLocation(locationString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } catch (error) {
              // Fallback to coordinates if geocoding fails
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
            setLocationLoading(false);
          },
          (error) => {
            console.log('Location access denied or unavailable:', error);
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }
    } catch (error) {
      console.log('Geolocation not supported');
      setLocationLoading(false);
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Filter out duplicate files based on name and size
      setSelectedImages(prev => {
        const newFiles = files.filter(newFile => 
          !prev.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size &&
            existingFile.lastModified === newFile.lastModified
          )
        );
        return [...prev, ...newFiles].slice(0, 4); // Max 4 images
      });
    }
    
    // Reset the input value to allow selecting the same file again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !petName.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];

      // Upload images if any are selected
      if (selectedImages.length > 0) {
        try {
          showSuccess('Uploading images...');
          const uploadResults = await ImageStorage.uploadImages(selectedImages, user.id);
          imageUrls = uploadResults.map(result => result.publicUrl);
        } catch (imageError) {
          showError('Failed to upload images: ' + (imageError as Error).message);
          setLoading(false);
          return;
        }
      }      // Create the post with image URLs
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            pet_name: petName.trim(),
            pet_type: petType.trim(),
            location: location.trim(),
            status,
            image_urls: imageUrls,
            likes: 0,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      showSuccess('Post created successfully!');
      
      // Reset form
      setContent('');
      setPetName('');
      setPetType('');
      setLocation('');
      setStatus('lost');
      setSelectedImages([]);
      
      onPostCreated();
    } catch (error: any) {
      showError('Failed to create post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Selection */}
        <div>
          <label className="block text-lg font-semibold text-white mb-4 drop-shadow-lg">
            Post Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: 'lost', label: 'Lost Pet', emoji: '🔍', color: 'from-red-500/80 to-red-600/80' },
              { value: 'found', label: 'Found Pet', emoji: '✅', color: 'from-green-500/80 to-green-600/80' },
              { value: 'adoption', label: 'For Adoption', emoji: '💙', color: 'from-blue-500/80 to-blue-600/80' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value as any)}
                className={`p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl backdrop-blur-sm border ${
                  status === option.value
                    ? `bg-gradient-to-r ${option.color} text-white border-white/30`
                    : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
              Pet Name *
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 hover:border-white/50"
              placeholder="e.g., Buddy, Luna..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
              Pet Type
            </label>
            <input
              type="text"
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 hover:border-white/50"
              placeholder="e.g., Golden Retriever, Tabby Cat..."
            />
          </div>
        </div>        <div>
          <label className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 pr-12 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 hover:border-white/50"
              placeholder={locationLoading ? "Getting your location..." : "e.g., Downtown Park, Main Street..."}
              disabled={locationLoading}
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white/70 hover:text-blue-300 transition-all duration-300 disabled:opacity-50"
              title="Get current location"
            >
              <FiMapPin className={`w-5 h-5 ${locationLoading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>        <div>
          <label className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
            Description *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 hover:border-white/50 resize-none"
            placeholder="Describe the pet, circumstances, and any other relevant details..."
            required
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
            Photos (Optional)
          </label>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          {/* Image preview grid */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/80"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add photo button */}
          {selectedImages.length < 4 && (
            <button
              type="button"
              onClick={handleImageSelect}
              className="w-full p-4 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-xl text-white/80 hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FiImage className="w-5 h-5" />
              <span>Add Photos ({selectedImages.length}/4)</span>
            </button>
          )}
        </div>        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm text-white rounded-xl hover:from-blue-600/80 hover:to-purple-600/80 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}