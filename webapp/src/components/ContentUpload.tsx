export const ContentUpload = () => {
  return (
    <div className="max-w-xl p-4 border rounded-lg">
      <form className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-1">
            Upload Video Content
          </label>
          <input
            type="file"
            id="file"
            className="w-full"
            accept="video/mp4,video/x-m4v,video/*"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </form>
    </div>
  )
}
