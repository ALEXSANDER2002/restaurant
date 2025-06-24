import * as faceapi from 'face-api.js'

export class FaceRecognitionService {
  private isInitialized = false
  private modelsLoaded = false

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      // Carregar os modelos necessários
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      ])

      this.modelsLoaded = true
      this.isInitialized = true
      console.log('✅ Face-API.js models loaded successfully')
      return true
    } catch (error) {
      console.error('❌ Error loading Face-API.js models:', error)
      return false
    }
  }

  async detectFace(video: HTMLVideoElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}, faceapi.TinyFaceDetectorOptions>, faceapi.FaceLandmarks68>> | null> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call initialize() first.')
    }

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      return detection || null
    } catch (error) {
      console.error('❌ Error detecting face:', error)
      return null
    }
  }

  async getFaceDescriptor(video: HTMLVideoElement): Promise<Float32Array | null> {
    const detection = await this.detectFace(video)
    return detection ? detection.descriptor : null
  }

  compareFaces(descriptor1: Float32Array, descriptor2: Float32Array): number {
    return faceapi.euclideanDistance(descriptor1, descriptor2)
  }

  isFaceMatch(distance: number, threshold: number = 0.6): boolean {
    return distance < threshold
  }

  // Salvar descritor facial no localStorage (para demo)
  saveFaceDescriptor(email: string, descriptor: Float32Array): void {
    const descriptorArray = Array.from(descriptor)
    localStorage.setItem(`face_descriptor_${email}`, JSON.stringify(descriptorArray))
  }

  // Carregar descritor facial do localStorage
  loadFaceDescriptor(email: string): Float32Array | null {
    const stored = localStorage.getItem(`face_descriptor_${email}`)
    if (stored) {
      const descriptorArray = JSON.parse(stored)
      return new Float32Array(descriptorArray)
    }
    return null
  }

  // Listar usuários com descritores faciais salvos
  getUsersWithFaceData(): string[] {
    const users: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('face_descriptor_')) {
        const email = key.replace('face_descriptor_', '')
        users.push(email)
      }
    }
    return users
  }

  // Remover descritor facial
  removeFaceDescriptor(email: string): void {
    localStorage.removeItem(`face_descriptor_${email}`)
  }
}

export const faceRecognitionService = new FaceRecognitionService() 