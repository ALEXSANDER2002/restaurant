"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useIdioma } from "@/contexts/idioma-context"

const idiomas = [
  { valor: "pt-BR", rotulo: "idioma.ptBR" },
  { valor: "en-US", rotulo: "idioma.enUS" },
  { valor: "es", rotulo: "idioma.es" },
]

export function SeletorIdioma() {
  const { idioma, alterarIdioma, t } = useIdioma()
  const [aberto, setAberto] = useState(false)

  const handleAlterarIdioma = (novoIdioma: string) => {
    alterarIdioma(novoIdioma as "pt-BR" | "en-US" | "es")
    setAberto(false)
  }

  const idiomaSelecionado = idiomas.find((i) => i.valor === idioma)

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          aria-label={t("idioma.selecionar")}
          className="w-full sm:w-auto justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{t(idiomaSelecionado?.rotulo || "")}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t("idioma.buscar")} />
          <CommandList>
            <CommandEmpty>{t("idioma.naoEncontrado")}</CommandEmpty>
            <CommandGroup>
              {idiomas.map((item) => (
                <CommandItem key={item.valor} value={item.valor} onSelect={() => handleAlterarIdioma(item.valor)}>
                  <Check className={cn("mr-2 h-4 w-4", idioma === item.valor ? "opacity-100" : "opacity-0")} />
                  {t(item.rotulo)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

