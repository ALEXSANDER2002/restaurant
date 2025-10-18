declare module "nprogress" {
  const NProgress: {
    configure: (options: Record<string, unknown>) => void
    start: () => void
    done: () => void
  }
  export default NProgress
} 