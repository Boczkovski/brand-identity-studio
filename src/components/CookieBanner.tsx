import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getConsent, initPixel, META_PIXEL_ID, needsConsent, setConsent } from "@/lib/meta-pixel";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void initPixel();
    if (META_PIXEL_ID && !getConsent()) void needsConsent().then(setOpen);
    const reopen = () => setOpen(true);
    window.addEventListener("poder:cookie-settings", reopen);
    return () => window.removeEventListener("poder:cookie-settings", reopen);
  }, []);

  if (!open) return null;
  const choose = (v: "granted" | "denied") => { setConsent(v); setOpen(false); };
  return (
    <div role="dialog" aria-label="Preferências de cookies" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-foreground bg-background p-5 text-foreground">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-6">Usamos o Pixel da Meta para medir visitas, cadastros e cliques no grupo e melhorar nossos anúncios. Você pode aceitar ou recusar. <Link to="/privacidade" className="font-bold underline">Política de Privacidade</Link>.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => choose("denied")}>Recusar</Button>
          <Button onClick={() => choose("granted")}>Aceitar</Button>
        </div>
      </div>
    </div>
  );
}
