"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Idioma = "pt-BR" | "en-US" | "es"

interface ContextoIdioma {
  idioma: Idioma
  alterarIdioma: (novoIdioma: Idioma) => void
  t: (chave: string) => string
}

const ContextoIdioma = createContext<ContextoIdioma | undefined>(undefined)

// Traduções
const traducoes: Record<Idioma, Record<string, string>> = {
  "pt-BR": {
    // Geral
    "app.nome": "Restaurante Universitário",
    "app.descricao": "Sistema de venda de almoço do Restaurante Universitário",

    // Navegação
    "nav.inicio": "Início",
    "nav.cardapio": "Cardápio",
    "nav.sobre": "Sobre",
    "nav.entrar": "Entrar",
    "nav.sair": "Sair",
    "nav.minhaConta": "Minha Conta",

    // Página Inicial
    "home.bemVindo": "Bem-vindo ao Restaurante Universitário",
    "home.descricao":
      "Oferecemos refeições nutritivas e acessíveis para toda a comunidade acadêmica. Compre seu ticket de almoço de forma rápida e prática.",
    "home.servicos": "Nossos Serviços",
    "home.almoco": "Almoço Balanceado",
    "home.almocoDesc": "Refeições completas e nutritivas preparadas diariamente por nossa equipe.",
    "home.compra": "Compra Online",
    "home.compraDesc": "Adquira seus tickets de forma rápida e segura através da nossa plataforma.",
    "home.cardapio": "Cardápio Semanal",
    "home.cardapioDesc": "Consulte o cardápio da semana e planeje suas refeições com antecedência.",
    "home.horario": "Horário de Funcionamento",
    "home.horarioAlmoco": "Almoço",
    "home.diasFuncionamento": "Segunda a Sexta-feira",
    "home.horaFuncionamento": "11:00 - 14:00",

    // Login
    "login.titulo": "Entrar no Sistema",
    "login.descricao": "Acesse sua conta para comprar tickets ou gerenciar o sistema",
    "login.credenciais": "Credenciais",
    "login.qrcode": "QR Code",
    "login.email": "E-mail",
    "login.senha": "Senha",
    "login.lembrar": "Lembrar de mim",
    "login.entrar": "Entrar",
    "login.entrando": "Entrando...",
    "login.suporte": "Problemas para acessar? Entre em contato com o suporte.",
    "login.qrcode.instrucao": "Posicione o QR Code no centro da câmera para escanear",
    "login.qrcode.iniciar": "Iniciar Escaneamento",
    "login.qrcode.parar": "Parar Escaneamento",

    // Painel do Estudante
    "estudante.titulo": "Painel do Estudante",
    "estudante.comprar": "Comprar Ticket",
    "estudante.historico": "Histórico",
    "estudante.configuracoes": "Configurações",
    "estudante.comprarTicket": "Comprar Ticket de Almoço",
    "estudante.comprarDesc": "Adquira seu ticket para o almoço no Restaurante Universitário",
    "estudante.historicoCompras": "Histórico de Compras",
    "estudante.historicoDesc": "Visualize suas compras anteriores",
    "estudante.configConta": "Configurações da Conta",
    "estudante.configDesc": "Gerencie suas preferências e configurações de acessibilidade",
    "estudante.prefNotificacao": "Preferências de Notificação",
    "estudante.acessibilidade": "Acessibilidade",

    // Compra de Ticket
    "ticket.dataAlmoco": "Data do Almoço",
    "ticket.selecioneData": "Selecione uma data",
    "ticket.quantidade": "Quantidade",
    "ticket.maximo": "Máximo de 5 tickets por compra",
    "ticket.precoUnitario": "Preço unitário:",
    "ticket.total": "Total:",
    "ticket.finalizar": "Finalizar Compra",
    "ticket.processando": "Processando...",
    "ticket.sucesso": "Compra realizada com sucesso!",
    "ticket.sucessoDesc": "Seu ticket de almoço foi adquirido. Você pode visualizá-lo no seu histórico de compras.",
    "ticket.comprarOutro": "Comprar outro ticket",

    // Histórico
    "historico.id": "ID",
    "historico.data": "Data",
    "historico.quantidade": "Quantidade",
    "historico.valorTotal": "Valor Total",
    "historico.status": "Status",
    "historico.vazio": "Você ainda não possui histórico de compras.",
    "historico.pago": "Pago",
    "historico.pendente": "Pendente",
    "historico.cancelado": "Cancelado",

    // Painel do Administrador
    "admin.titulo": "Painel do Administrador",
    "admin.dashboard": "Dashboard",
    "admin.pedidos": "Pedidos",
    "admin.usuarios": "Usuários",
    "admin.dashboardVendas": "Dashboard de Vendas",
    "admin.dashboardDesc": "Visualize estatísticas e gráficos de vendas de almoço",
    "admin.listaPedidos": "Lista de Pedidos",
    "admin.pedidosDesc": "Gerencie os pedidos realizados",
    "admin.gerenciamentoUsuarios": "Gerenciamento de Usuários",
    "admin.usuariosDesc": "Administre os usuários do sistema",

    // Dashboard
    "dashboard.vendasHoje": "Total de Vendas Hoje",
    "dashboard.valorHoje": "Valor Total Hoje",
    "dashboard.mediaSemanal": "Média Semanal",
    "dashboard.ticketsVendidos": "Tickets vendidos hoje",
    "dashboard.faturamento": "Faturamento do dia",
    "dashboard.ticketsPorDia": "Tickets por dia (média)",
    "dashboard.vendasDiarias": "Vendas Diárias",
    "dashboard.vendasSemanais": "Vendas Semanais",
    "dashboard.vendasPorHora": "Vendas por Hora - Hoje",
    "dashboard.vendasPorDia": "Vendas por Dia - Esta Semana",

    // Pedidos
    "pedidos.buscar": "Buscar por ID ou nome do usuário...",
    "pedidos.usuario": "Usuário",
    "pedidos.acoes": "Ações",
    "pedidos.vazio": "Nenhum pedido encontrado.",
    "pedidos.confirmado": "Confirmado",
    "pedidos.confirmar": "Confirmar pedido",
    "pedidos.cancelar": "Cancelar pedido",

    // Usuários
    "usuarios.buscar": "Buscar por nome ou email...",
    "usuarios.novoUsuario": "Novo Usuário",
    "usuarios.nome": "Nome",
    "usuarios.email": "Email",
    "usuarios.tipo": "Tipo",
    "usuarios.status": "Status",
    "usuarios.acoes": "Ações",
    "usuarios.vazio": "Nenhum usuário encontrado.",
    "usuarios.ativo": "Ativo",
    "usuarios.inativo": "Inativo",
    "usuarios.admin": "Administrador",
    "usuarios.estudante": "Estudante",
    "usuarios.editar": "Editar usuário",
    "usuarios.excluir": "Excluir usuário",
    "usuarios.editarUsuario": "Editar Usuário",
    "usuarios.novoUsuarioTitulo": "Novo Usuário",
    "usuarios.editarDesc": "Edite as informações do usuário abaixo.",
    "usuarios.novoDesc": "Preencha as informações para criar um novo usuário.",
    "usuarios.nomeCompleto": "Nome completo",
    "usuarios.emailPlaceholder": "email@exemplo.com",
    "usuarios.senha": "Senha",
    "usuarios.selecioneTipo": "Selecione o tipo",
    "usuarios.selecioneStatus": "Selecione o status",
    "usuarios.cancelar": "Cancelar",
    "usuarios.criar": "Criar",
    "usuarios.salvar": "Salvar",
    "usuarios.salvando": "Salvando...",

    // Acessibilidade
    "acessibilidade.altoContraste": "Alto Contraste",
    "acessibilidade.modoEscuro": "Modo Escuro",
    "acessibilidade.modoClaro": "Modo Claro",
    "acessibilidade.vlibras": "VLibras",
    "acessibilidade.irConteudo": "Ir para o conteúdo principal",

    // Rodapé
    "rodape.descricao": "Oferecendo refeições nutritivas e acessíveis para toda a comunidade acadêmica.",
    "rodape.linksUteis": "Links Úteis",
    "rodape.contato": "Contato",
    "rodape.direitos": "Todos os direitos reservados.",

    // Idiomas
    "idioma.ptBR": "Português (Brasil)",
    "idioma.enUS": "English (US)",
    "idioma.es": "Español",
    "idioma.selecionar": "Selecionar idioma",
    "idioma.buscar": "Buscar idioma...",
    "idioma.naoEncontrado": "Nenhum idioma encontrado.",

    // Geral
    "geral.fechar": "Fechar",
    "geral.ajuda": "Ajuda",
    "geral.voltar": "Voltar",
    "geral.avancar": "Avançar",
    "geral.confirmar": "Confirmar",
    "geral.cancelar": "Cancelar",
    "geral.salvar": "Salvar",
    "geral.editar": "Editar",
    "geral.excluir": "Excluir",
    "geral.adicionar": "Adicionar",
    "geral.pesquisar": "Pesquisar",
    "geral.filtrar": "Filtrar",
    "geral.ordenar": "Ordenar",
    "geral.carregando": "Carregando...",
    "geral.erro": "Erro",
    "geral.sucesso": "Sucesso",
    "geral.aviso": "Aviso",
    "geral.info": "Informação",

    // Login
    "login.sucessoLogin": "Login realizado com sucesso!",
    "login.mostrarSenha": "Mostrar senha",
    "login.ocultarSenha": "Ocultar senha",
    "login.ajuda.email.titulo": "Ajuda com Email",
    "login.ajuda.email.descricao": "Digite o email que você usou para se cadastrar no sistema.",
    "login.ajuda.senha.titulo": "Ajuda com Senha",
    "login.ajuda.senha.descricao": "Digite sua senha. Caso tenha esquecido, entre em contato com o suporte.",

    // Home
    "home.ajuda.servicos.titulo": "Nossos Serviços",
    "home.ajuda.servicos.descricao":
      "Oferecemos diversos serviços para atender às necessidades da comunidade acadêmica. Clique em cada card para saber mais.",
    "home.ajuda.horario.titulo": "Horário de Funcionamento",
    "home.ajuda.horario.descricao":
      "O Restaurante Universitário funciona de segunda a sexta-feira, das 11:00 às 14:00, para o almoço.",
  },
  "en-US": {
    // General
    "app.nome": "University Restaurant",
    "app.descricao": "University Restaurant lunch sales system",

    // Navigation
    "nav.inicio": "Home",
    "nav.cardapio": "Menu",
    "nav.sobre": "About",
    "nav.entrar": "Login",
    "nav.sair": "Logout",
    "nav.minhaConta": "My Account",

    // Home Page
    "home.bemVindo": "Welcome to the University Restaurant",
    "home.descricao":
      "We offer nutritious and affordable meals for the entire academic community. Buy your lunch ticket quickly and conveniently.",
    "home.servicos": "Our Services",
    "home.almoco": "Balanced Lunch",
    "home.almocoDesc": "Complete and nutritious meals prepared daily by our team.",
    "home.compra": "Online Purchase",
    "home.compraDesc": "Get your tickets quickly and securely through our platform.",
    "home.cardapio": "Weekly Menu",
    "home.cardapioDesc": "Check the weekly menu and plan your meals in advance.",
    "home.horario": "Opening Hours",
    "home.horarioAlmoco": "Lunch",
    "home.diasFuncionamento": "Monday to Friday",
    "home.horaFuncionamento": "11:00 AM - 2:00 PM",

    // Login
    "login.titulo": "Login to the System",
    "login.descricao": "Access your account to buy tickets or manage the system",
    "login.credenciais": "Credentials",
    "login.qrcode": "QR Code",
    "login.email": "Email",
    "login.senha": "Password",
    "login.lembrar": "Remember me",
    "login.entrar": "Login",
    "login.entrando": "Logging in...",
    "login.suporte": "Having trouble accessing? Contact support.",
    "login.qrcode.instrucao": "Position the QR Code in the center of the camera to scan",
    "login.qrcode.iniciar": "Start Scanning",
    "login.qrcode.parar": "Stop Scanning",

    // Student Panel
    "estudante.titulo": "Student Panel",
    "estudante.comprar": "Buy Ticket",
    "estudante.historico": "History",
    "estudante.configuracoes": "Settings",
    "estudante.comprarTicket": "Buy Lunch Ticket",
    "estudante.comprarDesc": "Get your ticket for lunch at the University Restaurant",
    "estudante.historicoCompras": "Purchase History",
    "estudante.historicoDesc": "View your previous purchases",
    "estudante.configConta": "Account Settings",
    "estudante.configDesc": "Manage your preferences and accessibility settings",
    "estudante.prefNotificacao": "Notification Preferences",
    "estudante.acessibilidade": "Accessibility",

    // Ticket Purchase
    "ticket.dataAlmoco": "Lunch Date",
    "ticket.selecioneData": "Select a date",
    "ticket.quantidade": "Quantity",
    "ticket.maximo": "Maximum of 5 tickets per purchase",
    "ticket.precoUnitario": "Unit price:",
    "ticket.total": "Total:",
    "ticket.finalizar": "Complete Purchase",
    "ticket.processando": "Processing...",
    "ticket.sucesso": "Purchase completed successfully!",
    "ticket.sucessoDesc": "Your lunch ticket has been purchased. You can view it in your purchase history.",
    "ticket.comprarOutro": "Buy another ticket",

    // History
    "historico.id": "ID",
    "historico.data": "Date",
    "historico.quantidade": "Quantity",
    "historico.valorTotal": "Total Value",
    "historico.status": "Status",
    "historico.vazio": "You don't have any purchase history yet.",
    "historico.pago": "Paid",
    "historico.pendente": "Pending",
    "historico.cancelado": "Canceled",

    // Admin Panel
    "admin.titulo": "Administrator Panel",
    "admin.dashboard": "Dashboard",
    "admin.pedidos": "Orders",
    "admin.usuarios": "Users",
    "admin.dashboardVendas": "Sales Dashboard",
    "admin.dashboardDesc": "View statistics and charts of lunch sales",
    "admin.listaPedidos": "Orders List",
    "admin.pedidosDesc": "Manage the orders placed",
    "admin.gerenciamentoUsuarios": "User Management",
    "admin.usuariosDesc": "Manage system users",

    // Dashboard
    "dashboard.vendasHoje": "Today's Total Sales",
    "dashboard.valorHoje": "Today's Total Value",
    "dashboard.mediaSemanal": "Weekly Average",
    "dashboard.ticketsVendidos": "Tickets sold today",
    "dashboard.faturamento": "Today's revenue",
    "dashboard.ticketsPorDia": "Tickets per day (average)",
    "dashboard.vendasDiarias": "Daily Sales",
    "dashboard.vendasSemanais": "Weekly Sales",
    "dashboard.vendasPorHora": "Sales by Hour - Today",
    "dashboard.vendasPorDia": "Sales by Day - This Week",

    // Orders
    "pedidos.buscar": "Search by ID or user name...",
    "pedidos.usuario": "User",
    "pedidos.acoes": "Actions",
    "pedidos.vazio": "No orders found.",
    "pedidos.confirmado": "Confirmed",
    "pedidos.confirmar": "Confirm order",
    "pedidos.cancelar": "Cancel order",

    // Users
    "usuarios.buscar": "Search by name or email...",
    "usuarios.novoUsuario": "New User",
    "usuarios.nome": "Name",
    "usuarios.email": "Email",
    "usuarios.tipo": "Type",
    "usuarios.status": "Status",
    "usuarios.acoes": "Actions",
    "usuarios.vazio": "No users found.",
    "usuarios.ativo": "Active",
    "usuarios.inativo": "Inactive",
    "usuarios.admin": "Administrator",
    "usuarios.estudante": "Student",
    "usuarios.editar": "Edit user",
    "usuarios.excluir": "Delete user",
    "usuarios.editarUsuario": "Edit User",
    "usuarios.novoUsuarioTitulo": "New User",
    "usuarios.editarDesc": "Edit the user information below.",
    "usuarios.novoDesc": "Fill in the information to create a new user.",
    "usuarios.nomeCompleto": "Full name",
    "usuarios.emailPlaceholder": "email@example.com",
    "usuarios.senha": "Password",
    "usuarios.selecioneTipo": "Select type",
    "usuarios.selecioneStatus": "Select status",
    "usuarios.cancelar": "Cancel",
    "usuarios.criar": "Create",
    "usuarios.salvar": "Save",
    "usuarios.salvando": "Saving...",

    // Accessibility
    "acessibilidade.altoContraste": "High Contrast",
    "acessibilidade.modoEscuro": "Dark Mode",
    "acessibilidade.modoClaro": "Light Mode",

    "acessibilidade.vlibras": "VLibras",
    "acessibilidade.irConteudo": "Go to main content",

    // Footer
    "rodape.descricao": "Offering nutritious and affordable meals for the entire academic community.",
    "rodape.linksUteis": "Useful Links",
    "rodape.contato": "Contact",
    "rodape.direitos": "All rights reserved.",

    // Languages
    "idioma.ptBR": "Portuguese (Brazil)",
    "idioma.enUS": "English (US)",
    "idioma.es": "Spanish",
    "idioma.selecionar": "Select language",
    "idioma.buscar": "Search language...",
    "idioma.naoEncontrado": "No language found.",
  },
  es: {
    // General
    "app.nome": "Restaurante Universitario",
    "app.descricao": "Sistema de venta de almuerzos del Restaurante Universitario",

    // Navigation
    "nav.inicio": "Inicio",
    "nav.cardapio": "Menú",
    "nav.sobre": "Acerca de",
    "nav.entrar": "Entrar",
    "nav.sair": "Salir",
    "nav.minhaConta": "Mi Cuenta",

    // Home Page
    "home.bemVindo": "Bienvenido al Restaurante Universitario",
    "home.descricao":
      "Ofrecemos comidas nutritivas y accesibles para toda la comunidad académica. Compre su ticket de almuerzo de forma rápida y práctica.",
    "home.servicos": "Nuestros Servicios",
    "home.almoco": "Almuerzo Balanceado",
    "home.almocoDesc": "Comidas completas y nutritivas preparadas diariamente por nuestro equipo.",
    "home.compra": "Compra Online",
    "home.compraDesc": "Adquiera sus tickets de forma rápida y segura a través de nuestra plataforma.",
    "home.cardapio": "Menú Semanal",
    "home.cardapioDesc": "Consulte el menú de la semana y planifique sus comidas con anticipación.",
    "home.horario": "Horario de Funcionamiento",
    "home.horarioAlmoco": "Almuerzo",
    "home.diasFuncionamento": "Lunes a Viernes",
    "home.horaFuncionamento": "11:00 - 14:00",

    // Login
    "login.titulo": "Entrar al Sistema",
    "login.descricao": "Acceda a su cuenta para comprar tickets o administrar el sistema",
    "login.credenciais": "Credenciales",
    "login.qrcode": "Código QR",
    "login.email": "Correo electrónico",
    "login.senha": "Contraseña",
    "login.lembrar": "Recordarme",
    "login.entrar": "Entrar",
    "login.entrando": "Entrando...",
    "login.suporte": "¿Problemas para acceder? Contacte al soporte.",
    "login.qrcode.instrucao": "Posicione el código QR en el centro de la cámara para escanear",
    "login.qrcode.iniciar": "Iniciar Escaneo",
    "login.qrcode.parar": "Detener Escaneo",

    // Student Panel
    "estudante.titulo": "Panel del Estudiante",
    "estudante.comprar": "Comprar Ticket",
    "estudante.historico": "Historial",
    "estudante.configuracoes": "Configuraciones",
    "estudante.comprarTicket": "Comprar Ticket de Almuerzo",
    "estudante.comprarDesc": "Adquiera su ticket para el almuerzo en el Restaurante Universitario",
    "estudante.historicoCompras": "Historial de Compras",
    "estudante.historicoDesc": "Visualice sus compras anteriores",
    "estudante.configConta": "Configuraciones de la Cuenta",
    "estudante.configDesc": "Administre sus preferencias y configuraciones de accesibilidad",
    "estudante.prefNotificacao": "Preferencias de Notificación",
    "estudante.acessibilidade": "Accesibilidad",

    // Ticket Purchase
    "ticket.dataAlmoco": "Fecha del Almuerzo",
    "ticket.selecioneData": "Seleccione una fecha",
    "ticket.quantidade": "Cantidad",
    "ticket.maximo": "Máximo de 5 tickets por compra",
    "ticket.precoUnitario": "Precio unitario:",
    "ticket.total": "Total:",
    "ticket.finalizar": "Finalizar Compra",
    "ticket.processando": "Procesando...",
    "ticket.sucesso": "¡Compra realizada con éxito!",
    "ticket.sucessoDesc": "Su ticket de almuerzo ha sido adquirido. Puede visualizarlo en su historial de compras.",
    "ticket.comprarOutro": "Comprar otro ticket",

    // History
    "historico.id": "ID",
    "historico.data": "Fecha",
    "historico.quantidade": "Cantidad",
    "historico.valorTotal": "Valor Total",
    "historico.status": "Estado",
    "historico.vazio": "Aún no tiene historial de compras.",
    "historico.pago": "Pagado",
    "historico.pendente": "Pendiente",
    "historico.cancelado": "Cancelado",

    // Admin Panel
    "admin.titulo": "Panel del Administrador",
    "admin.dashboard": "Dashboard",
    "admin.pedidos": "Pedidos",
    "admin.usuarios": "Usuarios",
    "admin.dashboardVendas": "Dashboard de Ventas",
    "admin.dashboardDesc": "Visualice estadísticas y gráficos de ventas de almuerzo",
    "admin.listaPedidos": "Lista de Pedidos",
    "admin.pedidosDesc": "Administre los pedidos realizados",
    "admin.gerenciamentoUsuarios": "Gestión de Usuarios",
    "admin.usuariosDesc": "Administre los usuarios del sistema",

    // Dashboard
    "dashboard.vendasHoje": "Total de Ventas Hoy",
    "dashboard.valorHoje": "Valor Total Hoy",
    "dashboard.mediaSemanal": "Promedio Semanal",
    "dashboard.ticketsVendidos": "Tickets vendidos hoy",
    "dashboard.faturamento": "Facturación del día",
    "dashboard.ticketsPorDia": "Tickets por día (promedio)",
    "dashboard.vendasDiarias": "Ventas Diarias",
    "dashboard.vendasSemanais": "Ventas Semanales",
    "dashboard.vendasPorHora": "Ventas por Hora - Hoy",
    "dashboard.vendasPorDia": "Ventas por Día - Esta Semana",

    // Orders
    "pedidos.buscar": "Buscar por ID o nombre de usuario...",
    "pedidos.usuario": "Usuario",
    "pedidos.acoes": "Acciones",
    "pedidos.vazio": "No se encontraron pedidos.",
    "pedidos.confirmado": "Confirmado",
    "pedidos.confirmar": "Confirmar pedido",
    "pedidos.cancelar": "Cancelar pedido",

    // Users
    "usuarios.buscar": "Buscar por nombre o correo electrónico...",
    "usuarios.novoUsuario": "Nuevo Usuario",
    "usuarios.nome": "Nombre",
    "usuarios.email": "Correo electrónico",
    "usuarios.tipo": "Tipo",
    "usuarios.status": "Estado",
    "usuarios.acoes": "Acciones",
    "usuarios.vazio": "No se encontraron usuarios.",
    "usuarios.ativo": "Activo",
    "usuarios.inativo": "Inactivo",
    "usuarios.admin": "Administrador",
    "usuarios.estudante": "Estudiante",
    "usuarios.editar": "Editar usuario",
    "usuarios.excluir": "Eliminar usuario",
    "usuarios.editarUsuario": "Editar Usuario",
    "usuarios.novoUsuarioTitulo": "Nuevo Usuario",
    "usuarios.editarDesc": "Edite la información del usuario a continuación.",
    "usuarios.novoDesc": "Complete la información para crear un nuevo usuario.",
    "usuarios.nomeCompleto": "Nombre completo",
    "usuarios.emailPlaceholder": "correo@ejemplo.com",
    "usuarios.senha": "Contraseña",
    "usuarios.selecioneTipo": "Seleccione tipo",
    "usuarios.selecioneStatus": "Seleccione estado",
    "usuarios.cancelar": "Cancelar",
    "usuarios.criar": "Crear",
    "usuarios.salvar": "Guardar",
    "usuarios.salvando": "Guardando...",

    // Accessibility
    "acessibilidade.altoContraste": "Alto Contraste",
    "acessibilidade.modoEscuro": "Modo Oscuro",
    "acessibilidade.modoClaro": "Modo Claro",
    "acessibilidade.vlibras": "VLibras",
    "acessibilidade.irConteudo": "Ir al contenido principal",

    // Footer
    "rodape.descricao": "Ofreciendo comidas nutritivas y accesibles para toda la comunidad académica.",
    "rodape.linksUteis": "Enlaces Útiles",
    "rodape.contato": "Contacto",
    "rodape.direitos": "Todos los derechos reservados.",

    // Languages
    "idioma.ptBR": "Portugués (Brasil)",
    "idioma.enUS": "Inglés (EE.UU.)",
    "idioma.es": "Español",
    "idioma.selecionar": "Seleccionar idioma",
    "idioma.buscar": "Buscar idioma...",
    "idioma.naoEncontrado": "No se encontró ningún idioma.",
  },
}

export function ProvedorIdioma({ children }: { children: React.ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>("pt-BR")

  useEffect(() => {
    const idiomaArmazenado = localStorage.getItem("idioma") as Idioma | null
    if (idiomaArmazenado && Object.keys(traducoes).includes(idiomaArmazenado)) {
      setIdioma(idiomaArmazenado)
    }
  }, [])

  const alterarIdioma = (novoIdioma: Idioma) => {
    setIdioma(novoIdioma)
    localStorage.setItem("idioma", novoIdioma)

    // Atualizar o atributo lang do HTML
    document.documentElement.lang = novoIdioma
  }

  // Função para obter a tradução de uma chave
  const t = (chave: string): string => {
    return traducoes[idioma][chave] || chave
  }

  const valor = {
    idioma,
    alterarIdioma,
    t,
  }

  return <ContextoIdioma.Provider value={valor}>{children}</ContextoIdioma.Provider>
}

export function useIdioma() {
  const contexto = useContext(ContextoIdioma)

  if (contexto === undefined) {
    throw new Error("useIdioma deve ser usado dentro de um ProvedorIdioma")
  }

  return contexto
}

