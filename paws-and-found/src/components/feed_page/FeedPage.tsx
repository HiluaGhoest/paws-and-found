import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import FeedHeader from './FeedHeader';
import PostList from './PostList';
import CreatePost from './CreatePost';
import Modal from '../misc/Modal';

interface FeedPageProps {
  user: any;
  onLogout: () => Promise<void>;
}

export default function FeedPage({ user, onLogout }: FeedPageProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostCreated = () => {
    setShowCreatePost(false);
    setRefreshPosts(prev => prev + 1); // Trigger posts refresh
  };  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-gray-900"></div>
      
      <div className="relative z-10">        <FeedHeader 
          user={user} 
          onLogout={onLogout}
        /><div className="max-w-lg mx-auto px-4 py-8">
            {/* Centered feed */}
            <div className="space-y-6">
              <PostList refreshTrigger={refreshPosts} />
            </div>
          </div>      </div>

      {/* Floating Create Post Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm text-white rounded-full shadow-2xl hover:from-blue-600/90 hover:to-purple-600/90 transition-all duration-300 hover:scale-110 z-40 border border-white/20"
      >
        <FiPlus className="w-6 h-6 mx-auto" />
      </button>

      {/* Create Post Modal */}
      <Modal 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)}
        title="Create a Post"
      >
        <CreatePost 
          user={user}
          onPostCreated={handlePostCreated}
        />
      </Modal>
    </div>
  );
}