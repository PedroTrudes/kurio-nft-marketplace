import {Link} from "@tanstack/react-router";

export default function NotFoundPage(){
    return(

        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#140D0A]">
      <h1 className="text-5xl font-bold text-[#D58B48]">
        404
      </h1>

      <p className="text-white">
        Página não encontrada.
      </p>

      <Link
        to="/"
        className="rounded-md bg-[#D58B48] px-6 py-3 text-[#140D0A]"
        >
        Voltar para o início
      </Link>
    </main>
    )
}