import { ESPANHOL } from "@/lib/cursos-idioma";
import { roteiroCompleto } from "@/lib/roteiro-idioma";

export const GET = () => roteiroCompleto(ESPANHOL, "flight-attendant-spanish-roteiro.txt");
