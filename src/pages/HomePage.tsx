import { useNFTs } from "@/features/nft/hooks/useNFTs";

export default function HomePage() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useNFTs();

  if (isPending) {
    return (
      <main className="min-h-screen bg-[#140D0A] p-10 text-white">
        <p>Carregando NFTs...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#140D0A] p-10 text-white">
        <h1 className="mb-4 text-2xl">
          Erro ao carregar NFTs
        </h1>

        <p className="mb-4">{error.message}</p>

        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-orange-500 px-4 py-2 text-black"
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#140D0A] p-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-[#D58B48]">
          KURIO NFT MARKETPLACE
        </h1>

        <h2 className="mb-6 text-2xl font-semibold">
          NFTs disponíveis
        </h2>

        {data.data.length === 0 ? (
          <p>Nenhum NFT encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((nft) => (
              <article
                key={nft.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#241813]"
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="aspect-square w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="mb-2 text-xl font-semibold">
                    {nft.name}
                  </h3>

                  <p className="mb-4 text-sm text-gray-400">
                    {nft.collection}
                  </p>

                  <p className="text-lg font-bold text-[#D58B48]">
                    {nft.price} {nft.currency}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Disponíveis: {nft.availableQuantity}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}