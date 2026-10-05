/** Testo semplice con "## Titolo" per i sottotitoli e righe vuote tra i paragrafi. */
export default function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}|\n(?=## )/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-4 leading-relaxed text-neutral-800">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) {
          const [title, ...rest] = b.slice(3).split("\n");
          return (
            <div key={i}>
              <h2 className="mb-2 mt-6 text-xl font-bold text-neutral-900">{title}</h2>
              {rest.length > 0 && <p className="whitespace-pre-line">{rest.join("\n")}</p>}
            </div>
          );
        }
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}
