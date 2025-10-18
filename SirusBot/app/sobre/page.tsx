"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Utensils, 
  Heart, 
  Shield, 
  Award,
  Building,
  Calendar
} from "lucide-react"
import { motion } from "framer-motion"
import { useTema } from "@/components/provedor-tema"
import { cn } from "@/lib/utils"

export default function SobrePage() {
  const { contraste } = useTema()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const stats = [
    { icon: Users, label: "Usuários Atendidos", value: "2.500+", color: "text-blue-600" },
    { icon: Utensils, label: "Refeições/Dia", value: "800+", color: "text-green-600" },
    { icon: Calendar, label: "Anos de Serviço", value: "15+", color: "text-purple-600" },
    { icon: Award, label: "Certificação de Qualidade", value: "ISO", color: "text-orange-600" },
  ]

  return (
    <div className={cn(
      "min-h-screen py-12",
      contraste === "alto" ? "bg-black text-white" : "bg-gradient-to-br from-blue-50 to-white"
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold mb-6",
            contraste === "alto" ? "text-white" : "text-[#0B2F67]"
          )}>
            Sobre o SIRUS
          </h1>
          <p className={cn(
            "text-xl max-w-3xl mx-auto leading-relaxed",
            contraste === "alto" ? "text-white/80" : "text-gray-600"
          )}>
            Sistema Integrado de Restaurante Universitário Simplificado - 
            Promovendo alimentação de qualidade e acessível para toda a comunidade acadêmica
          </p>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={cn(
                "text-center shadow-lg hover:shadow-xl transition-shadow duration-300",
                contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
              )}>
                <CardContent className="pt-6">
                  <stat.icon className={cn("h-8 w-8 mx-auto mb-3", stat.color)} />
                  <div className={cn(
                    "text-2xl font-bold mb-1",
                    contraste === "alto" ? "text-white" : "text-gray-900"
                  )}>
                    {stat.value}
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    contraste === "alto" ? "text-white/70" : "text-gray-600"
                  )}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Seções Principais */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Nossa História */}
          <motion.section variants={itemVariants}>
            <Card className={cn(
              "shadow-lg",
              contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-2xl flex items-center gap-3",
                  contraste === "alto" ? "text-white" : "text-[#0B2F67]"
                )}>
                  <Building className="h-6 w-6" />
                  Nossa História
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className={cn(
                  "text-lg leading-relaxed mb-4",
                  contraste === "alto" ? "text-white/80" : "text-gray-700"
                )}>
                  O Restaurante Universitário da UNIFESSPA foi criado com o objetivo de oferecer 
                  alimentação de qualidade e acessível para estudantes, professores e funcionários. 
                  Desde sua inauguração, tem sido um pilar fundamental na vida acadêmica, 
                  proporcionando um espaço de convivência e nutrição adequada.
                </p>
                <p className={cn(
                  "leading-relaxed",
                  contraste === "alto" ? "text-white/80" : "text-gray-700"
                )}>
                  Com o lançamento do SIRUS (Sistema Integrado de Restaurante Universitário Simplificado), 
                  modernizamos completamente o processo de compra e gestão de tickets, tornando a experiência 
                  mais prática e eficiente para toda a comunidade acadêmica.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {/* Missão, Visão e Valores */}
          <motion.section variants={itemVariants}>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className={cn(
                "shadow-lg",
                contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-xl flex items-center gap-2",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67]"
                  )}>
                    <Heart className="h-5 w-5 text-red-500" />
                    Missão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    "leading-relaxed",
                    contraste === "alto" ? "text-white/80" : "text-gray-700"
                  )}>
                    Oferecer alimentação de qualidade, nutritiva e acessível, contribuindo para 
                    o bem-estar e desenvolvimento da comunidade acadêmica da UNIFESSPA.
                  </p>
                </CardContent>
              </Card>

              <Card className={cn(
                "shadow-lg",
                contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-xl flex items-center gap-2",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67]"
                  )}>
                    <Award className="h-5 w-5 text-yellow-500" />
                    Visão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    "leading-relaxed",
                    contraste === "alto" ? "text-white/80" : "text-gray-700"
                  )}>
                    Ser referência em alimentação universitária na região, reconhecido pela 
                    excelência na qualidade dos serviços e inovação tecnológica.
                  </p>
                </CardContent>
              </Card>

              <Card className={cn(
                "shadow-lg",
                contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-xl flex items-center gap-2",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67]"
                  )}>
                    <Shield className="h-5 w-5 text-green-500" />
                    Valores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className={cn(
                    "space-y-2 text-sm leading-relaxed",
                    contraste === "alto" ? "text-white/80" : "text-gray-700"
                  )}>
                    <li>• Qualidade alimentar</li>
                    <li>• Acessibilidade econômica</li>
                    <li>• Sustentabilidade ambiental</li>
                    <li>• Inovação tecnológica</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Informações de Funcionamento */}
          <motion.section variants={itemVariants}>
            <Card className={cn(
              "shadow-lg",
              contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-2xl flex items-center gap-3",
                  contraste === "alto" ? "text-white" : "text-[#0B2F67]"
                )}>
                  <Clock className="h-6 w-6" />
                  Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className={cn(
                      "font-semibold mb-4 text-lg",
                      contraste === "alto" ? "text-white" : "text-gray-900"
                    )}>
                      Horários de Atendimento
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Segunda a Sexta:</span>
                        <Badge variant="secondary">11h00 - 14h00 (Almoço)</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábados e Domingos:</span>
                        <Badge variant="outline">Fechado</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Jantar:</span>
                        <Badge variant="outline">Não servimos</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={cn(
                      "font-semibold mb-4 text-lg",
                      contraste === "alto" ? "text-white" : "text-gray-900"
                    )}>
                      Valores das Refeições
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Estudantes Subsidiados:</span>
                        <Badge className="bg-green-100 text-green-800">R$ 2,00</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Não Subsidiados/Visitantes:</span>
                        <Badge className="bg-blue-100 text-blue-800">R$ 13,00</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Contato */}
          <motion.section variants={itemVariants}>
            <Card className={cn(
              "shadow-lg",
              contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-2xl flex items-center gap-3",
                  contraste === "alto" ? "text-white" : "text-[#0B2F67]"
                )}>
                  <Phone className="h-6 w-6" />
                  Entre em Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <strong>Endereço:</strong>
                        <p className="text-sm text-gray-600">
                          Campus Universitário - Folha 31, Quadra 07, Lote Especial<br />
                          Marabá - PA, CEP: 68507-590
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <strong>Telefone:</strong>
                        <p className="text-sm text-gray-600">(94) 2101-7040</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <strong>E-mail:</strong>
                        <p className="text-sm text-gray-600">ru@unifesspa.edu.br</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={cn(
                      "font-semibold mb-4",
                      contraste === "alto" ? "text-white" : "text-gray-900"
                    )}>
                      Suporte Técnico SIRUS
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Para dúvidas sobre o sistema ou problemas com tickets digitais:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">suporte.sirus@unifesspa.edu.br</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">(94) 2101-7041</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}