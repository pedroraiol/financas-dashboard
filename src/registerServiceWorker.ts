/**
 * Registra o service worker do PWA e recarrega a aba automaticamente quando uma
 * versão nova assume o controle.
 *
 * O sw.js gerado (registerType: "autoUpdate") já ativa a versão nova assim que ela
 * termina de instalar (skipWaiting + clientsClaim), mas isso só afeta requisições
 * futuras — uma aba já aberta continua rodando o JS antigo até recarregar. Sem esse
 * listener, quem está numa aba aberta há tempo (ex.: navegador desktop) fica preso
 * numa versão desatualizada até recarregar manualmente (às vezes mais de uma vez),
 * enquanto uma instalação nova no celular já pega a versão certa de cara.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" });
  });

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}
