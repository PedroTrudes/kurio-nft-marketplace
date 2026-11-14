import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface HeroCarouselProps {
  variant?: "desktop" | "mobile";
}

const slides = [
  {
    id: "emerald-ape",
    image: "/assets/nfts/emerald-ape.png",
    alt: "NFT Emerald Ape",
  },
  {
    id: "violet-nomad",
    image: "/assets/nfts/violet-nomad.png",
    alt: "NFT Violet Nomad",
  },
  {
    id: "cosmic-bloom",
    image: "/assets/nfts/cosmic-bloom.png",
    alt: "NFT Cosmic Bloom",
  },
];

export default function HeroCarousel({
  variant = "desktop",
}: HeroCarouselProps) {
  const isMobile = variant === "mobile";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSelectedIndex();

    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi]);

  return (
    <div
      className={
        isMobile
          ? "absolute inset-0"
          : "relative w-full min-w-0"
      }
    >
      <div
        ref={emblaRef}
        aria-label="NFTs em destaque"
        aria-roledescription="carrossel"
        className={
  isMobile
    ? `
      absolute
      right-4
      top-1/2
      z-10
      w-[43%]
      max-w-[210px]
      -translate-y-1/2
      overflow-hidden
      rounded-2xl

      min-[500px]:right-[8%]
      min-[650px]:right-[12%]
      min-[768px]:right-[16%]
    `
    : "overflow-hidden"
}
      >
        <div
          className={
            isMobile
              ? "flex touch-pan-y -ml-3"
              : "flex touch-pan-y -ml-4"
          }
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${slides.length}`}
              className={
                isMobile
                  ? "min-w-0 flex-[0_0_100%] pl-3"
                  : "min-w-0 flex-[0_0_100%] pl-4"
              }
            >
              <div
                className={
                  isMobile
                    ? "aspect-square overflow-hidden rounded-2xl bg-kurio-surface"
                    : "aspect-square overflow-hidden rounded-3xl bg-kurio-surface"
                }
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isMobile && (
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Ir para o slide ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : undefined}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                selectedIndex === index
                  ? "bg-kurio-primary"
                  : "bg-kurio-primary/50"
              }`}
            />
          ))}
        </div>
      )}

      {!isMobile && (
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Ir para o slide ${index + 1}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  selectedIndex === index
                    ? "w-7 bg-kurio-primary"
                    : "w-2 bg-kurio-text-muted/40"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Slide anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-kurio-border text-kurio-text transition-colors hover:border-kurio-primary hover:text-kurio-primary"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={scrollNext}
              aria-label="Próximo slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-kurio-border text-kurio-text transition-colors hover:border-kurio-primary hover:text-kurio-primary"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}