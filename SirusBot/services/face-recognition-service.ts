import * as faceapi from "face-api.js"

class FaceRecognitionService {
  private modelsLoaded = false
  private modelPath = "/models"

  // Carregar modelos do face-api.js
  async loadModels(onProgress?: (progress: number) => void): Promise<void> {
    if (this.modelsLoaded) {
      console.log("✅ Modelos já carregados")
      return
    }

    try {
      console.log("📦 Carregando modelos de reconhecimento facial...")

      const models = [
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelPath),
      ]

      let loaded = 0
      const total = models.length

      for (const model of models) {
        await model
        loaded++
        if (onProgress) {
          onProgress((loaded / total) * 100)
        }
      }

      this.modelsLoaded = true
      console.log("✅ Modelos carregados com sucesso")
    } catch (error) {
      console.error("❌ Erro ao carregar modelos:", error)
      throw new Error("Falha ao carregar modelos de reconhecimento facial")
    }
  }

  // Detectar face e extrair descritor
  async detectFace(
    imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<Float32Array | null> {
    if (!this.modelsLoaded) {
      await this.loadModels()
    }

    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        return null
      }

      return detection.descriptor
    } catch (error) {
      console.error("❌ Erro ao detectar face:", error)
      return null
    }
  }

  // Cadastrar face de um usuário
  async registerFace(
    usuarioId: string,
    descriptors: Float32Array[]
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const response = await fetch("/api/facial/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          descriptors: Array.from(descriptors[0]),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.erro || "Erro ao cadastrar face")
      }

      return { sucesso: true }
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar face:", error)
      return { sucesso: false, erro: error.message }
    }
  }

  // Verificar face de um usuário
  async verifyFace(
    usuarioId: string,
    descriptor: Float32Array
  ): Promise<{ sucesso: boolean; similaridade?: number; erro?: string }> {
    try {
      const response = await fetch("/api/facial/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          descriptor: Array.from(descriptor),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.erro || "Erro ao verificar face")
      }

      const data = await response.json()
      return {
        sucesso: data.sucesso,
        similaridade: data.similaridade,
      }
    } catch (error: any) {
      console.error("❌ Erro ao verificar face:", error)
      return { sucesso: false, erro: error.message }
    }
  }

  // Comparar dois descritores
  compareDescriptors(
    descriptor1: Float32Array,
    descriptor2: Float32Array
  ): number {
    return faceapi.euclideanDistance(descriptor1, descriptor2)
  }

  // Verificar se os modelos estão carregados
  areModelsLoaded(): boolean {
    return this.modelsLoaded
  }
}

// Exportar instância singleton
export const faceRecognitionService = new FaceRecognitionService()

