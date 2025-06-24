"use client";
import { useState } from "react";
import { OptimizedImage } from "../../../utils/imageOptimization";

export default function ImageSlider({ photos = [], title = "" }) {
  const [current, setCurrent] = useState(0);
  if (!photos.length)
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">
        no image found
      </div>
    );

  const goTo = (idx) => setCurrent(idx);
  const prev = () =>
    setCurrent((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  const next = () =>
    setCurrent((prev) => (prev === photos.length - 1 ? 0 : prev + 1));

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full flex justify-center mb-4">
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow p-1 z-10"
          aria-label="back"
        >
          <span className="text-2xl">&#8592;</span>
        </button>
        <OptimizedImage
          src={photos[current]}
          alt={title + " " + (current + 1)}
          width={420}
          height={320}
          className="rounded-xl object-cover shadow-md"
        />
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow p-1 z-10"
          aria-label="next"
        >
          <span className="text-2xl">&#8594;</span>
        </button>
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={
                "border-2 rounded " +
                (idx === current ? "border-blue-500" : "border-transparent")
              }
            >
              <OptimizedImage
                src={photo}
                alt={title + " thumbnail " + (idx + 1)}
                width={60}
                height={45}
                className="rounded object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
