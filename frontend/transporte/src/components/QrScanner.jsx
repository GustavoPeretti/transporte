import { useEffect, useRef, useState } from 'react'

// Scanner de QR code via câmera do dispositivo.
// Usa html5-qrcode de forma imperativa dentro de um useEffect para respeitar
// o ciclo de vida do React sem conflitos de DOM.
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
            // Para o scanner ao encontrar um código e avisa o pai.
            scanner.stop().catch(() => {})
            onScan(text)
          },
          () => {}, // erros por frame (QR não detectado) — ignorados
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
      <div id={SCANNER_ID} className={status === 'ativo' ? 'overflow-hidden rounded-xl' : 'hidden'} />
      {status === 'ativo' && (
        <p className="text-center text-xs text-slate-400">Aponte para o QR code da carteirinha</p>
      )}
    </div>
  )
}
