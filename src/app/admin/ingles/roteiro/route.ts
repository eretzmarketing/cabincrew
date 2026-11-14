import { cursoIdioma } from "@/lib/cursos-dados";
import { roteiroCompleto } from "@/lib/roteiro-idioma";

export const GET = async () => roteiroCompleto(await cursoIdioma("english"), "flight-attendant-english-roteiro.txt");
