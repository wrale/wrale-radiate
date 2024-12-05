export const HealthDashboard = () => {
  return (
    <div className="max-w-4xl p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Display Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
        
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Playback Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Playing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
