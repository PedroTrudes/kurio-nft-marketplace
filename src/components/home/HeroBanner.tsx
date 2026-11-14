import { ArrowRight } from "lucide-react";
import HeroCarousel from "./HeroCarousel";

export default function HeroBanner() {
  function handleExplore() {
    document.getElementById("catalog")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-14">
      <div className="hidden min-h-[360px] items-center justify-between gap-8 md:flex lg:gap-12">
        <div className="min-w-0 flex-1">
          <p className="mb-5 text-xs tracking-wider text-kurio-text">
            Bem-vindo à Kurio
          </p>

          <h1 className="mb-6 text-2xl font-bold leading-tight text-kurio-text lg:text-5xl">
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h1>

          <p className="mb-8 max-w-md text-sm leading-7 text-kurio-text-muted">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>

          <button
            type="button"
            onClick={handleExplore}
            className="rounded-md bg-kurio-primary px-7 py-3 text-xs font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover"
          >
            EXPLORAR
          </button>
        </div>

        <div className="w-full min-w-0 max-w-[420px] flex-1">
          <HeroCarousel variant="desktop" />
        </div>
      </div>

      <div className="relative isolate min-h-[300px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#775037] via-[#583823] to-[#2A1A14] sm:min-h-[330px] md:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute left-[-42%] top-1/2 aspect-square w-[95%] -translate-y-1/2 rounded-full bg-[#C18A5B]/20"
          />

          <div
            className="absolute left-[10%] top-1/2 aspect-square w-[95%] -translate-y-1/2 rounded-full bg-[#D09A65]/15"
          />
        </div>

        <div
          className="pointer-events-none relative z-10 flex min-h-[300px] flex-col justify-center px-5 py-8 pb-12 min-[500px]:pl-[10%] min-[650px]:pl-[15%] min-[768px]:pl-[18%] sm:min-h-[330px]"
        >
          <p className="mb-3 text-[10px] font-medium text-white">
            Bem-vindo à Kurio
          </p>

          <h1 className="mb-4 max-w-[190px] text-lg font-bold leading-snug text-white in-[500px]:max-w-[240px] min-[768px]:text-2xl">
            SEJA DONO DA
            <br />
            CULTURA DIGITAL
          </h1>

          <p className="max-w-[170px] text-[10px] leading-5 text-[#E7C9AE]">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>

          <button
            type="button"
            onClick={handleExplore}
            className="pointer-events-auto mt-3 flex w-fit items-center gap-2 text-xs font-bold text-kurio-primary"
          >
            EXPLORAR
            <ArrowRight size={16} />
          </button>
        </div>

        <HeroCarousel variant="mobile" />
      </div>
    </section>
  );
}
