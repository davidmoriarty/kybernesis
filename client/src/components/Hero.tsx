// Hero.tsx
export function Hero({ title }: { title: string }) {
  return (
    <section className="w-full py-32 bg-slate-50">
      <div className="max-w-5xl mx-auto px-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight leading-snug">
          {title}
        </h1>
      </div>
    </section>
  );
}
