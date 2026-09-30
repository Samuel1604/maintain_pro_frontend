interface PageIntroProps {
  title: string;
  description: string;
}

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div className="relative pl-4">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-0 w-1 rounded-full bg-gradient-to-b from-primary via-primary/70 to-primary/20"
      />
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
