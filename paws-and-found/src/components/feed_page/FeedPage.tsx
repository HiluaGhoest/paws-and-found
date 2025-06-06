import { useState } from 'react';
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
      
      <div className="relative z-10">
        <FeedHeader 
          user={user} 
          onLogout={onLogout}
          onCreatePost={() => setShowCreatePost(true)}
        />          <div className="max-w-lg mx-auto px-4 py-8">
            {/* Centered feed */}
            <div className="space-y-6">
              <PostList refreshTrigger={refreshPosts} />
            </div>
          </div>
      </div>

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