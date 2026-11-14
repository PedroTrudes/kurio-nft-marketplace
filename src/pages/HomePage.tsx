import { Button } from "@/components/ui/button";

export default function HomePage() {
    return(
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#140D0A]">
      <h1 className="text-4xl font-bold text-[#D58B48]">
        KURIO NFT MARKETPLACE
      </h1>

      <p className="text-white">
        Explore nossa coleção de NFTs exclusivos.
      </p>

      <Button className="bg-[#D58B48] text-[#140D0A] hover:bg-[#E5A365]">
        Explorar NFTs
      </Button>
    </main>
    )
}