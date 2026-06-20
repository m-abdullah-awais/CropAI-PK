import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Leaf className="size-4 text-primary" />
          CropAI PK
        </div>
        <p className="mt-2 max-w-2xl">
          Crop recommendation, yield prediction, and rotation planning for
          Pakistan. Recommendations use reference-grounded synthetic data and
          live weather — validate against local soil tests before field use.
        </p>
        <p className="mt-3 text-xs">
          Yield data: FAO (1990–2013). Weather: Open-Meteo. For research and
          educational use.
        </p>
      </div>
    </footer>
  );
}
