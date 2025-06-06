interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <h3 className="font-semibold text-white mb-1 drop-shadow-lg">{user.email}</h3>
          <p className="text-sm text-blue-300">Pet Lover</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30">
        <h3 className="font-semibold text-white mb-4 drop-shadow-lg">Community Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-white/80">🔍 Lost Pets</span>
            <span className="font-semibold text-white">12</span>
          </div>
          <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-white/80">✅ Found Pets</span>
            <span className="font-semibold text-white">8</span>
          </div>
          <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-white/80">💙 Adoptions</span>
            <span className="font-semibold text-white">25</span>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30">
        <h3 className="font-semibold text-white mb-4 drop-shadow-lg">💡 Quick Tips</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl">
            <p className="text-white/90">Always include clear photos and detailed descriptions</p>
          </div>
          <div className="p-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl">
            <p className="text-white/90">Add your location to help others find you</p>
          </div>
          <div className="p-3 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl">
            <p className="text-white/90">Check posts regularly for updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}