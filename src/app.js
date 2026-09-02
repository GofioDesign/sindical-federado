document.querySelectorAll('[data-start][data-end]').forEach((banner) => {
  const now = Date.now();
  if (now < Date.parse(banner.dataset.start) || now > Date.parse(banner.dataset.end)) banner.hidden = true;
});

const input=document.querySelector('#search');
if(input){
  const results=document.querySelector('#search-results'); const count=document.querySelector('#search-count'); let index=[];
  fetch('../search-index.json').then(r=>r.json()).then(data=>index=data);
  input.addEventListener('input',()=>{
    const terms=input.value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu,'').trim().split(/\s+/).filter(Boolean);
    if(!terms.length){results.innerHTML='';count.textContent='';return}
    const found=index.filter(item=>{const text=item.text.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu,'');return terms.every(term=>text.includes(term))}).slice(0,30);
    count.textContent=`${found.length} resultados`;
    results.innerHTML=found.map(item=>`<article><span class="pill">${escapeHtml(item.type)}</span><h2><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h2><p>${escapeHtml(item.summary)}</p></article>`).join('');
  });
}
function escapeHtml(value=''){return String(value).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

const stream=document.querySelector('#external-news');
if(stream){
  const styles=document.createElement('link'); const appScript=document.currentScript||document.querySelector('script[src$="/app.js"]'); styles.rel='stylesheet'; styles.href=new URL('news.css',appScript?.src||location.href).href; document.head.append(styles);
  const items=[...stream.querySelectorAll('[data-stream-item]')]; const size=Number(stream.dataset.pageSize)||6;
  const button=document.querySelector('#load-more'); const sentinel=document.querySelector('#stream-sentinel'); const status=document.querySelector('#stream-status'); let visible=size; let observer=null;
  const reveal=()=>{items.slice(visible,visible+size).forEach(item=>item.hidden=false);visible=Math.min(visible+size,items.length);if(status)status.textContent=`Mostrando ${visible} de ${items.length} noticias`;if(visible>=items.length){button?.remove();sentinel?.remove();observer?.disconnect()}};
  button?.addEventListener('click',reveal);
  const armObserver=()=>{if('IntersectionObserver' in window&&sentinel&&!observer){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))reveal()},{rootMargin:'0px 0px 160px',threshold:.01});observer.observe(sentinel)}};
  window.addEventListener('scroll',armObserver,{once:true,passive:true});
  if(status)status.textContent=`Mostrando ${Math.min(visible,items.length)} de ${items.length} noticias`;
}

if(document.querySelector('#publisher')){
  const appScript=document.currentScript||document.querySelector('script[src$="/app.js"]'); const publisher=document.createElement('script'); publisher.src=new URL('publisher.js',appScript?.src||location.href).href; document.body.append(publisher);
}
