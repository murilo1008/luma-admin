"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import {
  Upload,
  X,
  Check,
  FileText,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface AddPolicyDialogProps {
  trigger: ReactNode
  clientId: string
  clientName: string
  onUploadComplete?: () => void
}

export function AddPolicyDialog({ 
  trigger, 
  clientId, 
  clientName, 
  onUploadComplete 
}: AddPolicyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  // Função para resetar dados da apólice
  const resetPolicyData = () => {
    setSelectedFiles([])
    setUploadProgress({})
    setUploadErrors({})
    setDragActive(false)
  }

  // Funções para manipular arquivos
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== files.length) {
      toast.error("Apenas arquivos PDF são permitidos", {
        description: "Selecione apenas arquivos no formato PDF"
      })
    }

    if (pdfFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...pdfFiles])
      toast.success(`${pdfFiles.length} arquivo(s) PDF selecionado(s)`, {
        description: "Arquivos prontos para upload"
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    toast.info("Arquivo removido")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Simular upload (aqui você integraria com seu serviço de upload real)
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo PDF")
      return
    }

    const loadingToast = toast.loading("Enviando documentos...", {
      description: `Fazendo upload de ${selectedFiles.length} arquivo(s) para ${clientName}`
    })

    try {
      // Simular upload com progresso
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        if (!file) continue
        
        // Simular progresso de upload
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }))
        }
      }

      toast.success("Documentos enviados com sucesso! 📄", {
        description: `${selectedFiles.length} arquivo(s) da apólice de ${clientName} foram processados`
      })

      // Chamar callback se fornecido
      if (onUploadComplete) {
        onUploadComplete()
      }

      // Fechar dialog e limpar
      resetPolicyData()
      setIsOpen(false)

    } catch (error) {
      toast.error("Erro no upload", {
        description: "Ocorreu um erro ao enviar os arquivos"
      })
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetPolicyData()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Enviar Documentos da Apólice
          </DialogTitle>
          <DialogDescription>
            Faça upload dos documentos da apólice de {clientName}. 
            Você pode enviar múltiplos arquivos PDF incluindo a apólice, coberturas, beneficiários e documentos relacionados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Área de Upload */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                dragActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {dragActive ? 'Solte os arquivos aqui' : 'Arraste e solte seus PDFs aqui'}
                </p>
                <p className="text-sm text-muted-foreground">
                  ou <span className="text-primary font-medium cursor-pointer hover:underline">clique para selecionar</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Suporte apenas para arquivos PDF • Máximo 10MB por arquivo
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Arquivos Selecionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Arquivos Selecionados ({selectedFiles.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpar Todos
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[file.name] || 0
                  const isUploading = progress > 0 && progress < 100
                  const isCompleted = progress === 100

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          isCompleted ? 'bg-green-100 text-green-600' :
                          isUploading ? 'bg-blue-100 text-blue-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : isUploading ? (
                            <Upload className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            {isUploading && (
                              <>
                                <span>•</span>
                                <span>{progress}% enviado</span>
                              </>
                            )}
                            {isCompleted && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">Enviado</span>
                              </>
                            )}
                          </div>
                          
                          {/* Barra de Progresso */}
                          {isUploading && (
                            <div className="mt-2 w-full bg-muted rounded-full h-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {!isUploading && !isCompleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-red-500 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          {selectedFiles.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Documentos que podem ser incluídos:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Apólice principal do seguro</li>
                    <li>• Condições gerais e especiais</li>
                    <li>• Formulário de beneficiários</li>
                    <li>• Comprovantes de pagamento</li>
                    <li>• Documentos de cobertura adicional</li>
                    <li>• Qualquer outro documento relacionado</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetPolicyData()
              setIsOpen(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUploadFiles}
            disabled={selectedFiles.length === 0}
            className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Enviar {selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s)` : 'Documentos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
