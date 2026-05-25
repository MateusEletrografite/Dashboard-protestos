import { AlertCircle, FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

interface UploadDropzoneProps {
  isParsing: boolean
  error: string
  fileName: string
  onFile: (file: File) => Promise<void>
}

export function UploadDropzone({ isParsing, error, fileName, onFile }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file || isParsing) {
      return
    }

    void onFile(file)
  }

  return (
    <section
      className={`rounded-lg border bg-white transition ${
        isDragging ? 'border-finance-blue ring-4 ring-finance-blue/10' : 'border-surface-line'
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFile(event.dataTransfer.files?.[0])
      }}
    >
      <div className="flex flex-col justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-strong">Base de dados</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            {fileName ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-ink-body">
                <FileSpreadsheet size={15} className="shrink-0 text-finance-teal" />
                <span className="truncate">{fileName}</span>
              </span>
            ) : (
              <span>Importe uma planilha Excel para iniciar a análise.</span>
            )}
            <span className="hidden sm:inline">Arraste o arquivo para esta faixa ou use o botão de importação.</span>
          </div>
          {error ? (
            <div className="mt-2 flex items-start gap-2 text-sm text-finance-red">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={isParsing}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-ink-strong px-3.5 text-sm font-semibold text-white transition hover:bg-finance-blue disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={15} />
          {isParsing ? 'Processando' : 'Importar Excel'}
        </button>
      </div>
    </section>
  )
}
