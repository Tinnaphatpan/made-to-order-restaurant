const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

export default function MenuCard({ item, onAddToCart }) {
  const imgSrc = item.image || FALLBACK_IMAGE;

  return (
    <article className="card overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <figure className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = FALLBACK_IMAGE; }}
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white font-semibold text-sm bg-black/40 px-3 py-1 rounded-full">หมดชั่วคราว</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-gray-600">
            {item.category?.icon} {item.category?.name}
          </span>
        </div>
        {item.preparationTime && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              ⏱ {item.preparationTime} นาที
            </span>
          </div>
        )}
      </figure>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base leading-tight mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">{item.description}</p>
        )}

        <footer className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span className="font-bold text-orange-500 text-xl">฿{item.price.toFixed(0)}</span>
          <button
            disabled={!item.isAvailable}
            onClick={() => onAddToCart(item)}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            + เพิ่ม
          </button>
        </footer>
      </div>
    </article>
  );
}
