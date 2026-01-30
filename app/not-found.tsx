export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Página não encontrada</p>
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          Voltar para a página inicial
        </a>
      </div>
    </div>
  )
}
