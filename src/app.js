document.querySelectorAll('[data-start][data-end]').forEach((banner) => {
  const now = Date.now();
  if (now < Date.parse(banner.dataset.start) || now > Date.parse(banner.dataset.end)) banner.hidden = true;
});

const runtimeScript=document.currentScript||document.querySelector('script[src$="/app.js"]');
const siteConfigPromise=fetch(new URL('../site-config.json',runtimeScript?.src||location.href)).then(response=>response.json());
siteConfigPromise.then(config=>{const format=config.dateFormat||'AAAA-MM-DD';document.querySelectorAll('time').forEach(element=>{element.textContent=element.textContent.replace(/(\d{4})-(\d{2})-(\d{2})/g,(_,year,month,day)=>format.replace('AAAA',year).replace('MM',month).replace('DD',day))})}).catch(()=>{});

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
  const styles=document.createElement('link'); const appScript=document.currentScript||document.querySelector('script[src$="/app.js"]'); styles.rel='stylesheet'; styles.dataset.newsStyles=''; styles.href=new URL('news.css',appScript?.src||location.href).href; document.head.append(styles);
  const items=[...stream.querySelectorAll('[data-stream-item]')]; const size=Number(stream.dataset.pageSize)||6;
  const button=document.querySelector('#load-more'); const sentinel=document.querySelector('#stream-sentinel'); const status=document.querySelector('#stream-status'); let visible=size; let observer=null;
  const reveal=()=>{items.slice(visible,visible+size).forEach(item=>item.hidden=false);visible=Math.min(visible+size,items.length);if(status)status.textContent=`Mostrando ${visible} de ${items.length} noticias`;if(visible>=items.length){button?.remove();sentinel?.remove();observer?.disconnect()}};
  button?.addEventListener('click',reveal);
  const armObserver=()=>{if('IntersectionObserver' in window&&sentinel&&!observer){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))reveal()},{rootMargin:'0px 0px 160px',threshold:.01});observer.observe(sentinel)}};
  window.addEventListener('scroll',armObserver,{once:true,passive:true});
  if(status)status.textContent=`Mostrando ${Math.min(visible,items.length)} de ${items.length} noticias`;
}

const localArticleLinks=[...document.querySelectorAll('main article h3 a[href*="/noticias/"]')].filter(link=>!link.closest('#external-news'));
if(localArticleLinks.length||stream){
  const appScript=document.currentScript||document.querySelector('script[src$="/app.js"]');
  if(!document.querySelector('link[data-news-styles]')){const styles=document.createElement('link');styles.rel='stylesheet';styles.dataset.newsStyles='';styles.href=new URL('news.css',appScript?.src||location.href).href;document.head.append(styles)}
  siteConfigPromise.then(config=>{
    const label=config.localNewsLabel||'LOCAL';
    for(const link of localArticleLinks){const article=link.closest('article');article.classList.add('news-card','news-local');let badge=article.querySelector('.source-label');if(!badge){badge=document.createElement('span');badge.className='source-label';article.prepend(badge)}badge.textContent=label}
    for(const article of document.querySelectorAll('#external-news .news-card')){const source=article.querySelector('.pill')?.textContent.trim(),sourceConfig=config.externalNewsLabels?.[source];if(!sourceConfig)continue;article.classList.remove('news-rss');article.classList.add(`news-${sourceConfig.style}`);article.querySelector('.source-label').textContent=sourceConfig.label}
  }).catch(()=>{});
}

if(document.querySelector('#publisher')){
  const appScript=document.currentScript||document.querySelector('script[src$="/app.js"]'); const publisher=document.createElement('script'); publisher.src=new URL('publisher.js',appScript?.src||location.href).href; document.body.append(publisher);
}
