import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string) => {
    return sonnerToast.success(message)
  },
  error: (message: string) => {
    return sonnerToast.error(message)
  },
  info: (message: string) => {
    return sonnerToast.info(message)
  },
  warning: (message: string) => {
    return sonnerToast.warning(message)
  },
  message: (message: string) => {
    return sonnerToast.message(message)
  },
  promise: <T>(promise: Promise<T>, opts: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  }) => {
    return sonnerToast.promise(promise, opts)
  },
  custom: (component: React.ReactNode) => {
    return sonnerToast.custom(component as any)
  },
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id)
  }
}

export { toast as useToast }