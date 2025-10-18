import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { writeFile, unlink } from "fs/promises"
import { join, extname } from "path"
import { existsSync } from "fs"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"

interface JWTPayload {
  id: string
  email: string
  tipo_usuario: string
}

async function getUsuarioFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    const [usuario] = await db
      .select()
      .from(perfis)
      .where(eq(perfis.id, decoded.id))
    
    return usuario
  } catch (error) {
    return null
  }
}

// Upload de avatar
export async function POST(request: NextRequest) {
  try {
    const usuario = await getUsuarioFromToken(request)
    
    if (!usuario) {
      return NextResponse.json({ erro: "Usuário não autenticado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        erro: "Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF" 
      }, { status: 400 })
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        erro: "Arquivo muito grande. Máximo 5MB" 
      }, { status: 400 })
    }

    // Criar nome único para o arquivo
    const timestamp = Date.now()
    const extension = extname(file.name)
    const filename = `avatar_${usuario.id}_${timestamp}${extension}`
    
    // Salvar na pasta uploads
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadsDir = join(process.cwd(), "uploads")
    const filepath = join(uploadsDir, filename)
    
    await writeFile(filepath, buffer)
    
    // Remover avatar anterior se existir
    if (usuario.avatar_url) {
      const oldFilename = usuario.avatar_url.split('/').pop()
      if (oldFilename) {
        const oldFilepath = join(uploadsDir, oldFilename)
        if (existsSync(oldFilepath)) {
          try {
            await unlink(oldFilepath)
          } catch (error) {
            console.log("Erro ao remover avatar anterior:", error)
          }
        }
      }
    }
    
    // Atualizar URL no banco
    const avatarUrl = `/uploads/${filename}`
    
    await db
      .update(perfis)
      .set({ 
        avatar_url: avatarUrl,
        updated_at: new Date() 
      })
      .where(eq(perfis.id, usuario.id))

    return NextResponse.json({ 
      sucesso: true, 
      avatar_url: avatarUrl 
    })

  } catch (error: any) {
    console.error("Erro no upload de avatar:", error)
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 })
  }
}

// Remover avatar
export async function DELETE(request: NextRequest) {
  try {
    const usuario = await getUsuarioFromToken(request)
    
    if (!usuario) {
      return NextResponse.json({ erro: "Usuário não autenticado" }, { status: 401 })
    }

    // Remover arquivo se existir
    if (usuario.avatar_url) {
      const filename = usuario.avatar_url.split('/').pop()
      if (filename) {
        const filepath = join(process.cwd(), "uploads", filename)
        if (existsSync(filepath)) {
          try {
            await unlink(filepath)
          } catch (error) {
            console.log("Erro ao remover arquivo de avatar:", error)
          }
        }
      }
    }
    
    // Remover URL do banco
    await db
      .update(perfis)
      .set({ 
        avatar_url: null,
        updated_at: new Date() 
      })
      .where(eq(perfis.id, usuario.id))

    return NextResponse.json({ 
      sucesso: true 
    })

  } catch (error: any) {
    console.error("Erro ao remover avatar:", error)
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 })
  }
} 