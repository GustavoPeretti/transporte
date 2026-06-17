import TopBar from './TopBar'

// Casca de página: cabeçalho + área de conteúdo centralizada e responsiva.
export default function AppShell({ title, children }) {
  return (
    <div className="min-h-full">
      <TopBar title={title} />
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
    </div>
  )
}
