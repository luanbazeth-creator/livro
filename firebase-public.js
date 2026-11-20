// Página pública do livro: somente leitura, sem autenticação.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getFirestore, getDoc, doc } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const settings = window.LIVRO_FIREBASE;
if (settings?.projectId) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(settings);
    const db = getFirestore(app);
    const ids = ['capa', 'foto-1', 'foto-2', 'foto-3'];
    const docs = await Promise.allSettled([
      getDoc(doc(db, 'livro', 'publicacao')),
      ...ids.map(id => getDoc(doc(db, 'livro_fotos', id)))
    ]);
    const textos = docs[0].status === 'fulfilled' && docs[0].value.exists() ? docs[0].value.data() : null;
    const fotos = {};
    ids.forEach((id, i) => {
      const result = docs[i+1];
      if (result.status === 'fulfilled' && result.value.exists()) fotos[id] = result.value.data();
    });
    const apply = () => window.LIVRO_ATUALIZAR?.(textos, fotos);
    if (typeof window.LIVRO_ATUALIZAR === 'function') apply();
    else window.addEventListener('livro:ready', apply, { once: true });
  } catch (error) {
    // Na ausência de permissão/rede o livro continua visível com seu conteúdo padrão.
    console.warn('Não foi possível sincronizar o livro com o Firebase:', error);
  }
}
