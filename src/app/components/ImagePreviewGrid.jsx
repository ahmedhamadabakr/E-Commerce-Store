export default function ImagePreviewGrid({ previews, onRemove }) {
    if (!previews.length) return null;
  
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
        {previews.map((src, idx) => (
          <div key={idx} className="relative group">
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
              title="Remove image"
            >
              &times;
            </button>
            <img src={src} alt={`Product Image ${idx + 1}`} className="w-24 h-24 object-cover rounded-xl border" />
          </div>
        ))}
      </div>
    );
  }
  