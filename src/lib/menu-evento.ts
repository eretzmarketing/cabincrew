/** Abre o menu completo do celular (ouvido por MenuMobile). */
export const EVENTO_MENU = "cc:abrir-menu";
export const abrirMenu = () => window.dispatchEvent(new Event(EVENTO_MENU));
