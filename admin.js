import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const $ = s => document.querySelector(s);
const show = (s, visible) => { $(s).hidden = !visible; };
const fallback = window.LIVRO_CONFIG || {};
const firebase = window.LIVRO_FIREBASE;
const photoSlots = [
  {id:'capa',title:'A capa encantada',symbol:'♕',detail:'Uma foto vertical fica maravilhosa na capa.',fallback:'assets/ilustracao-capa.webp'},
  {id:'foto-1',title:'Nossa primeira lembrança',symbol:'♡',detail:'Um momento que merece ser guardado.'},
  {id:'foto-2',title:'Meu sorriso preferido',symbol:'✧',detail:'Uma foto daquele dia inesquecível.'},
  {id:'foto-3',title:'Nosso próximo capítulo',symbol:'❦',detail:'Mais um pedacinho de vocês.'}
];
const fields = [
  ['nomeDela','Nome dela','text'],['seuNome','Seu nome','text'],['dataInicio','Data de início do namoro (AAAA-MM-DD)','text'],
  ['dedicatória','A dedicatória','textarea'],['primeiraPagina','Antes de tudo...','textarea'],
  ['capituloUm','Quando tudo começou','textarea'],['textoEspecial','O meu feitiço favorito','textarea'],
  ['capituloDois','Nossas lembranças','textarea'],['textoMemorias','Introdução do álbum','textarea'],
  ['promessaUm','Primeira promessa','textarea'],['promessaDois','Segunda promessa','textarea'],['promessaTres','Terceira promessa','textarea'],
  ['carta','A carta secreta','textarea'],['ultimoRecado','O último recado','textarea']
];
const state = {};
const uidAtual = () => auth?.currentUser?.uid || '';

const imgStatus = (id,msg,ok=false)=>{const el=document.querySelector(`[data-status="${id}"]`); if(el){el.textContent=msg;el.className=`card-status ${ok?'success':''}`}};
function message(selector, text, error=false) {const el=$(selector);el.textContent=text;el.className=`${selector.includes('login')||selector.includes('words')?'feedback':'global-status'} ${error?'error':'success'}`;}
function readableError(err) {
  const code=err?.code||'';
  if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found'))return 'E-mail ou senha incorretos.';
  if(code.includes('too-many-requests'))return 'Muitas tentativas de login. Tente novamente mais tarde.';
  if(code.includes('unauthorized-domain'))return 'Domínio não autorizado no Firebase. Cadastre o domínio github.io do seu site em Authentication → Configurações → Domínios autorizados.';
  if(code.includes('permission-denied'))return 'O Firestore bloqueou o acesso. Abra Firebase → Firestore → Regras, substitua COLE_SEU_UID_AQUI pelo seu UID e clique em Publicar. Seu UID aparece acima neste painel.';
  if(code.includes('network-request-failed')||code.includes('unavailable'))return 'Sem conexão com o Firebase. Confira sua internet e tente novamente.';
  return String(err?.message||'Não foi possível completar esta ação.');
}
function renderFields() {
  const wrapper=$('#words-fields');
  for(const [key,label,type] of fields) {
    const box=document.createElement('div');box.className='word-field'+(key==='carta'?' wide':'');
    const lab=document.createElement('label');lab.textContent=label;lab.htmlFor='field-'+key;
    const input=document.createElement(type==='textarea'?'textarea':'input');
    input.id='field-'+key;input.name=key;
    if(type==='text')input.type='text';else input.rows=key==='carta'?7:4;
    input.maxLength=key==='carta'?4400:(type==='text'?120:1800);
    input.value=typeof fallback[key]==='string'?fallback[key]:'';
    box.append(lab,input);wrapper.append(box);
  }
}
function renderCards() {
  const container=$('#editors');
  container.textContent='';
  for(const [i, slot] of photoSlots.entries()) {
    const card=document.createElement('article');card.className='editor-card'+(i===0?' cover-slot':'');card.dataset.slot=slot.id;
    card.innerHTML=`<div class="editor-heading"><h3 class="editor-title">${slot.title}</h3><span class="editor-badge">${i===0?'Capa':'Foto '+i}</span></div>
      <div class="editor-preview"><div class="editor-empty"><span>${slot.symbol}</span><small>Sua foto aqui</small></div><img alt="Prévia da foto" hidden></div>
      <p class="editor-note">${slot.detail}</p>
      <label for="file-${slot.id}">Escolher uma foto</label>
      <input id="file-${slot.id}" class="file-input" type="file" accept="image/*">
      ${i!==0?`<label for="legenda-${slot.id}" style="margin-top:11px">Legenda curta</label><input id="legenda-${slot.id}" class="caption-input" maxlength="60" placeholder="Escreva uma lembrança...">`:''}
      <div class="card-actions"><button class="save-button" type="button" data-save="${slot.id}">Salvar</button><button class="remove-button" type="button" data-remove="${slot.id}">Remover</button></div>
      <p class="card-status" data-status="${slot.id}" role="status" aria-live="polite"></p>`;
    container.append(card);
    const input=card.querySelector('input[type=file]');
    input.addEventListener('change',()=>{
      const img=card.querySelector('.editor-preview img');
      if(state['preview-'+slot.id]) URL.revokeObjectURL(state['preview-'+slot.id]);
      if(input.files?.[0]) { const url=URL.createObjectURL(input.files[0]);state['preview-'+slot.id]=url;img.src=url;img.hidden=false;card.querySelector('.editor-empty').hidden=true;img.onload=()=>{}; }
    });
    card.querySelector('[data-save]').addEventListener('click',()=>saveImage(slot.id));
    card.querySelector('[data-remove]').addEventListener('click',()=>removeImage(slot.id));
  }
}
function previewPhoto(id,data) {
  const card=document.querySelector(`[data-slot="${id}"]`);
  const img=card.querySelector('.editor-preview img');
  if(data?.dataUrl && /^data:image\/(webp|jpeg|png);base64,/.test(data.dataUrl)) {
    img.src=data.dataUrl;img.hidden=false;card.querySelector('.editor-empty').hidden=true;
  } else {
    img.hidden=true;img.removeAttribute('src');card.querySelector('.editor-empty').hidden=false;
  }
  if(id!=='capa'&&typeof data?.legenda==='string')card.querySelector('.caption-input').value=data.legenda;
}
async function reducePhoto(file, cover=false) {
  if(!file?.type.startsWith('image/'))throw Error('Escolha um arquivo de imagem.');
  if(file.size>18*1024*1024)throw Error('A foto original é grande demais (limite 18 MB).');
  const url=URL.createObjectURL(file);
  let img;
  try {img=new Image();img.src=url;await img.decode();}
  catch {throw Error('Não foi possível abrir essa foto. Tente JPG ou PNG.');}
  finally {URL.revokeObjectURL(url);}
  const longest=cover?1300:1100;
  let w=img.naturalWidth,h=img.naturalHeight;
  const ratio=Math.min(1,longest/Math.max(w,h));w=Math.max(1,Math.round(w*ratio));h=Math.max(1,Math.round(h*ratio));
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error('Não foi possível processar esta imagem.');
  for(let n=0;n<9;n++){
    canvas.width=w;canvas.height=h;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
    const q=Math.max(.44,.83-n*.055);
    let urlData=canvas.toDataURL('image/webp',q);
    if(!urlData.startsWith('data:image/webp'))urlData=canvas.toDataURL('image/jpeg',q);
    if(urlData.length<670000)return urlData;
    w=Math.max(250,Math.round(w*.82));h=Math.max(250,Math.round(h*.82));
  }
  throw Error('Essa imagem não pôde ser reduzida o suficiente. Tente outra.');
}
let db, auth;
async function fetchData() {
  let texts;
  try {const docSnap=await getDoc(doc(db,'livro','publicacao'));if(docSnap.exists())texts=docSnap.data();}
  catch(e){message('#global-status','Não foi possível carregar os textos: '+readableError(e),true);}
  for(const [key] of fields){const val=texts?.[key];if(typeof val==='string')$('#field-'+key).value=val;}
  await Promise.all(photoSlots.map(async s=>{
    try{const snap=await getDoc(doc(db,'livro_fotos',s.id));if(snap.exists())previewPhoto(s.id,snap.data());}
    catch(e){imgStatus(s.id,'Erro ao buscar foto: '+readableError(e));}
  }));
}
async function saveTexts(event){
  event.preventDefault();const button=$('#save-words');button.disabled=true;message('#words-status','Salvando a história...');
  try {
    const payload={};for(const [key] of fields)payload[key]=$('#field-'+key).value.trim();
    if(payload.dataInicio&&!/^\d{4}-\d{2}-\d{2}$/.test(payload.dataInicio))throw Error('Use a data no formato AAAA-MM-DD.');
    await setDoc(doc(db,'livro','publicacao'),payload,{merge:true});
    message('#words-status','Salvo! Os textos já estão disponíveis no livro. ♡');
  }catch(e){message('#words-status',readableError(e),true);}finally{button.disabled=false;}
}
async function saveImage(id){
  const card=document.querySelector(`[data-slot="${id}"]`);
  const button=card.querySelector('[data-save]');const file=card.querySelector('input[type=file]').files?.[0];
  button.disabled=true;imgStatus(id,'Preparando e salvando...');
  try {
    const legenda=id==='capa'?'':card.querySelector('.caption-input').value.trim().slice(0,60);
    if(!file){
      // Permite trocar legenda mesmo sem substituir a foto.
      const snap=await getDoc(doc(db,'livro_fotos',id));
      if(!snap.exists())throw Error('Primeiro escolha uma foto para este espaço.');
      await setDoc(doc(db,'livro_fotos',id),{legenda},{merge:true});
      imgStatus(id,'Legenda atualizada. ♡',true);return;
    }
    const dataUrl=await reducePhoto(file,id==='capa');
    await setDoc(doc(db,'livro_fotos',id),{dataUrl,legenda,atualizadoEm:Date.now()});
    previewPhoto(id,{dataUrl,legenda});
    card.querySelector('input[type=file]').value='';
    imgStatus(id,'Foto publicada! Ela já está no livro. ♡',true);
  }catch(e){imgStatus(id,readableError(e));}finally{button.disabled=false;}
}
async function removeImage(id){
  if(!confirm('Remover esta foto do livro?'))return;
  const card=document.querySelector(`[data-slot="${id}"]`);const button=card.querySelector('[data-remove]');button.disabled=true;
  try {await deleteDoc(doc(db,'livro_fotos',id));previewPhoto(id,null);card.querySelector('input[type=file]').value='';if(id!=='capa')card.querySelector('.caption-input').value='';imgStatus(id,'Foto removida. ♡',true);}
  catch(e){imgStatus(id,readableError(e));}finally{button.disabled=false;}
}
async function start(){
  renderFields();renderCards();
  if(!firebase?.projectId){message('#global-status','Configuração Firebase não encontrada.',true);show('#loading-panel',false);show('#login-panel',true);return;}
  try{
    const app=getApps().length?getApps()[0]:initializeApp(firebase);db=getFirestore(app);auth=getAuth(app);
    $('#login-form').addEventListener('submit',async e=>{
      e.preventDefault();const btn=$('#login-button');btn.disabled=true;message('#login-status','Conferindo a chave do castelo...');
      try{await signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value);$('#password').value='';message('#login-status','');}
      catch(err){message('#login-status',readableError(err),true);}finally{btn.disabled=false;}
    });
    $('#words-form').addEventListener('submit',saveTexts);
    $('#logout-button').addEventListener('click',async()=>{await signOut(auth);});
    $('#copy-uid').addEventListener('click',async()=>{
      const uid = uidAtual();
      if(!uid)return;
      try {await navigator.clipboard.writeText(uid); $('#uid-copy-status').textContent='Copiado!';}
      catch {$('#uid-copy-status').textContent='Selecione o UID ao lado e copie com Ctrl+C.';}
    });
    onAuthStateChanged(auth,async user=>{
      show('#loading-panel',false);show('#login-panel',!user);show('#admin-panel',!!user);
      if(user){$('#admin-email').textContent=user.email||'Administrador';$('#admin-uid').textContent=user.uid;await fetchData();}
    },err=>{show('#loading-panel',false);show('#login-panel',true);message('#login-status',readableError(err),true);});
  }catch(e){show('#loading-panel',false);show('#login-panel',true);message('#login-status',readableError(e),true);}
}
start();
