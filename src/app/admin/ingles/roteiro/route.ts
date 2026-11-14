import { INGLES } from "@/lib/cursos-idioma";
import { roteiroCompleto } from "@/lib/roteiro-idioma";

export const GET = () => roteiroCompleto(INGLES, "flight-attendant-english-roteiro.txt");
