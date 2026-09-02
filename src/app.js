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
