import {Button} from "@/components/ui/button";
import './App.css'

function App() {
  return (
      <main className="flex min-h-screen items-center justify-center bg-[#140D0A]">
        <h1 className="text-4xl font-bold text-[#D58B48]">
          KURIO NFT MARKETPLACE
        </h1>
        <Button className="bg-[#D58B48] text-[#140D0A] hover:bg-[#E5A365]" 
        onClick={() => alert("funcionando!")}>
          Exportar NFTs
        </Button>
      </main>
  )
}

export default App
