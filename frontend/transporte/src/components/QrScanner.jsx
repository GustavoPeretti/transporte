import { useEffect, useRef, useState } from 'react'

const SCANNER_ID = 'html5qr-scanner-container'

export default function QrScanner({ onScan }) {
  const [status, setStatus] = useState('iniciando') // iniciando | ativo | erro
  const [erro, setErro] = useState('')
  const scannerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return

      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => {
            scanner.stop().catch(() => {})
            onScan(text)
          },
          () => {},
        )
        .then(() => { if (!cancelled) setStatus('ativo') })
        .catch((err) => {
          if (cancelled) return
          setStatus('erro')
          setErro(err?.message || 'Não foi possível acessar a câmera.')
        })
    })

    return () => {
      cancelled = true
      const s = scannerRef.current
      if (s?.isScanning) s.stop().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="space-y-3">
      {status === 'iniciando' && (
        <p className="py-6 text-center text-sm text-slate-500">Acessando câmera...</p>
      )}
      {status === 'erro' && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{erro}</p>
      )}

      {/*
        O container SEMPRE está no DOM e nunca usa display:none.
        O html5-qrcode mede offsetWidth/offsetHeight ao inicializar — se o
        elemento estiver oculto com display:none essas medidas retornam 0 e
        o vídeo é criado sem dimensões, ficando invisível mesmo após aparecer.
      */}
      <div
        id={SCANNER_ID}
        className="overflow-hidden rounded-xl"
        style={{ display: status === 'erro' ? 'none' : 'block' }}
      />

      {status === 'ativo' && (
        <p className="text-center text-xs text-slate-400">Aponte para o QR code da carteirinha</p>
      )}
    </div>
  )
}
