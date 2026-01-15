// Hero.tsx
export function Hero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="w-full py-20 bg-gray-700 text-background">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center px-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight leading-snug">
          {title}
        </h1>
        <p className="max-w-[40ch] text-center font-medium text-xl tracking-tight leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
