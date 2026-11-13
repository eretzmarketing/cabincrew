import "@fontsource/great-vibes/400.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import { FONTES, textoDoCampo, type Dados, type Modelo } from "@/lib/certificados";

/**
 * O certificado em si: imagem de fundo e campos posicionados em % (escala junto com a largura).
 * Usado no editor do admin, na página do aluno e na impressão em PDF.
 */
export default function CertificadoArte({ modelo, dados, site, selecionado, aoApertar }: {
  modelo: Modelo; dados: Dados; site: string; selecionado?: string | null;
  aoApertar?: (id: string, e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="certificado relative w-full overflow-hidden bg-white select-none" style={{ aspectRatio: `${modelo.largura} / ${modelo.altura}`, containerType: "inline-size" }}>
      {modelo.imagem
        // eslint-disable-next-line @next/next/no-img-element -- imagem de fundo do certificado (pasta de mídia)
        ? <img src={`/midia/${modelo.imagem}`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        : <div className="absolute inset-[3%] border-[0.4cqw] border-double border-[#c9a14a]" />}
      {modelo.campos.filter((c) => c.visivel).map((c) => {
        const desloc = c.alinhamento === "center" ? "-50%" : c.alinhamento === "right" ? "-100%" : "0";
        return (
          <div key={c.id} onPointerDown={aoApertar ? (e) => aoApertar(c.id, e) : undefined}
            className={`absolute leading-tight ${aoApertar ? "cursor-move touch-none" : ""} ${selecionado === c.id ? "outline-2 outline-offset-2 outline-dashed outline-[#2563eb]" : aoApertar ? "hover:outline-1 hover:outline-dashed hover:outline-[#2563eb]/60" : ""}`}
            style={{
              left: `${c.x}%`, top: `${c.y}%`, transform: `translate(${desloc}, -50%)`, width: `${c.largura}%`,
              fontSize: `${c.tamanho}cqw`, color: c.cor, fontFamily: FONTES[c.fonte]?.familia, fontWeight: c.negrito ? 700 : 400,
              textAlign: c.alinhamento, whiteSpace: "pre-line",
            }}>
            {textoDoCampo(c, dados, site)}
          </div>
        );
      })}
    </div>
  );
}
