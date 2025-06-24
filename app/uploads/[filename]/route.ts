import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Validar nome do arquivo para evitar path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    const filepath = join(process.cwd(), "uploads", filename)
    
    if (!existsSync(filepath)) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    const file = await readFile(filepath)
    
    // Determinar tipo de conteúdo baseado na extensão
    const extension = filename.split('.').pop()?.toLowerCase()
    let contentType = "application/octet-stream"
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = "image/jpeg"
        break
      case 'png':
        contentType = "image/png"
        break
      case 'gif':
        contentType = "image/gif"
        break
      case 'webp':
        contentType = "image/webp"
        break
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache por 1 ano
      },
    })

  } catch (error) {
    console.error("Erro ao servir arquivo:", error)
    return new NextResponse("Erro interno do servidor", { status: 500 })
  }
} 