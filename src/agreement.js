const agreementSearch=document.querySelector('#agreement-search');
if(agreementSearch){
  const items=[...document.querySelectorAll('[data-agreement-item]')],chapters=[...document.querySelectorAll('[data-agreement-chapter]')],count=document.querySelector('#agreement-count');
  const normalize=value=>value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu,'').trim();
  const escapeHtml=value=>String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const filter=()=>{const terms=normalize(agreementSearch.value).split(/\s+/).filter(Boolean);let visible=0;for(const item of items){const matches=!terms.length||terms.every(term=>item.dataset.search.includes(term));item.hidden=!matches;if(matches)visible++}for(const chapter of chapters)chapter.hidden=terms.length>0&&![...chapter.querySelectorAll('[data-agreement-item]')].some(item=>!item.hidden);count.textContent=terms.length?`${visible} artículos encontrados`:`${items.length} artículos en el índice`};
  agreementSearch.addEventListener('input',filter);filter();

  const historical=document.querySelector('#historicos');
  if(historical){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Consultar versiones anteriores (secundario)';details.className='agreement-history';historical.before(details);details.append(summary,historical);const note=document.createElement('p');note.textContent='No se realiza una comparación artículo por artículo entre versiones.';summary.after(note)}

  const appScript=document.currentScript||document.querySelector('script[src$="/agreement.js"]');
  const agreementDataPromise=fetch(new URL('../agreement-data.json',appScript?.src||location.href)).then(response=>response.json());
  const guidePromise=fetch(new URL('../agreement-guide.json',appScript?.src||location.href)).then(response=>response.json()).catch(()=>null);

  agreementDataPromise.then(data=>{if(!data.registryUrl)return;const link=document.createElement('a');link.className='button secondary';link.href=data.registryUrl;link.textContent='Consultar registro del Ministerio';document.querySelector('.agreement-hero .actions')?.append(link)}).catch(()=>{});

  guidePromise.then(guide=>{
    if(!guide)return;
    const panel=document.createElement('section');panel.className='plain-language notice';panel.innerHTML=`<span class="pill">${escapeHtml(guide.status)}</span><h2>${escapeHtml(guide.title)}</h2><p>${escapeHtml(guide.intro)}</p><p>Las explicaciones del modal se muestran junto al párrafo concreto al que corresponden.</p>`;agreementSearch.closest('section').after(panel);
    const glossary=document.createElement('section');glossary.className='plain-glossary';glossary.hidden=true;glossary.innerHTML=`<h2>Palabras que pueden resultar difíciles</h2><dl>${guide.glossary.map(item=>`<div><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.meaning)}</dd></div>`).join('')}</dl>`;document.querySelector('#modificaciones').before(glossary);
    const glossaryButton=document.createElement('button');glossaryButton.className='button';glossaryButton.type='button';glossaryButton.textContent='Mostrar glosario';panel.append(glossaryButton);glossaryButton.addEventListener('click',()=>{glossary.hidden=!glossary.hidden;glossaryButton.textContent=glossary.hidden?'Mostrar glosario':'Ocultar glosario'})
  }).catch(()=>{});

  const modal=document.createElement('div');
  modal.className='agreement-modal';
  modal.hidden=true;
  modal.innerHTML=`<div class="agreement-modal__backdrop" data-modal-close></div><section class="agreement-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="agreement-modal-title" tabindex="-1"><header class="agreement-modal__header"><div><p class="eyebrow agreement-modal__chapter"></p><h2 id="agreement-modal-title"></h2></div><button class="agreement-modal__close" type="button" aria-label="Cerrar artículo" data-modal-close>×</button></header><div class="agreement-modal__body"><section class="agreement-modal__legal"><h3>Texto del convenio</h3><div class="agreement-modal__text"></div></section><section class="agreement-modal__related" hidden><h3>Relacionado con</h3><div class="agreement-modal__related-links"></div></section><footer class="agreement-modal__source"><p><strong>Fuente:</strong> <span class="agreement-modal__source-label"></span></p><div class="actions"><a class="button agreement-modal__pdf" rel="external noopener">Abrir documento</a><a class="button secondary agreement-modal__source-link" rel="external noopener">Ver fuente</a></div></footer></div></section>`;
  document.body.append(modal);

  const dialog=modal.querySelector('.agreement-modal__dialog');
  const title=modal.querySelector('#agreement-modal-title');
  const chapterLabel=modal.querySelector('.agreement-modal__chapter');
  const legalText=modal.querySelector('.agreement-modal__text');
  const relatedBlock=modal.querySelector('.agreement-modal__related');
  const relatedLinks=modal.querySelector('.agreement-modal__related-links');
  const sourceLabel=modal.querySelector('.agreement-modal__source-label');
  const sourceLink=modal.querySelector('.agreement-modal__source-link');
  const pdfLink=modal.querySelector('.agreement-modal__pdf');
  let lastTrigger=null;
  let previousOverflow='';
  let activeArticleId=null;
  let articleIndex=new Map();

  const normalizeParagraphs=article=>{
    if(Array.isArray(article.paragraphs))return article.paragraphs.map((paragraph,index)=>typeof paragraph==='string'?{text:paragraph,id:`p${index+1}`}:{id:paragraph.id||`p${index+1}`,...paragraph});
    const raw=article.text||article.body;
    if(Array.isArray(raw))return raw.map((text,index)=>({id:`p${index+1}`,text,plain:Array.isArray(article.plainParagraphs)?article.plainParagraphs[index]:undefined}));
    if(typeof raw==='string'&&raw.trim())return raw.split(/\n{2,}/).filter(Boolean).map((text,index)=>({id:`p${index+1}`,text,plain:Array.isArray(article.plainParagraphs)?article.plainParagraphs[index]:undefined}));
    return [];
  };

  const renderRelation=(relation)=>{
    if(typeof relation==='string')relation={id:relation};
    if(relation.id&&articleIndex.has(relation.id)){
      const target=articleIndex.get(relation.id);
      return `<button type="button" class="agreement-related-link" data-related-article="${escapeHtml(relation.id)}">${escapeHtml(relation.label||target.title)}</button>`;
    }
    if(relation.href)return `<a class="agreement-related-link" href="${escapeHtml(relation.href)}"${/^https?:\/\//.test(relation.href)?' rel="external noopener"':''}>${escapeHtml(relation.label||relation.title||'Consultar relación')}</a>`;
    return '';
  };

  const renderParagraphs=(article)=>{
    const paragraphs=normalizeParagraphs(article);
    if(!paragraphs.length)return '<p class="agreement-modal__pending">El texto literal de este artículo todavía no está incorporado a la web. Usa el documento o la fuente enlazada para consultar su redacción completa.</p>';
    return paragraphs.map((paragraph,index)=>{
      const paragraphId=`${article.id}-${paragraph.id||`p${index+1}`}`;
      const relations=[...(paragraph.related||[])];
      return `<article class="agreement-paragraph" id="${escapeHtml(paragraphId)}" data-legal-paragraph><div class="agreement-paragraph__legal"><p>${escapeHtml(paragraph.text)}</p></div>${paragraph.plain?`<aside class="agreement-paragraph__plain"><span class="agreement-paragraph__label">En palabras sencillas</span><p>${escapeHtml(paragraph.plain)}</p></aside>`:''}${relations.length?`<nav class="agreement-paragraph__relations" aria-label="Contenido relacionado con este párrafo">${relations.map(renderRelation).join('')}</nav>`:''}</article>`;
    }).join('');
  };

  const renderArticleRelations=(article)=>{
    const relations=article.related||[];
    relatedLinks.innerHTML=relations.map(renderRelation).join('');
    relatedBlock.hidden=!relatedLinks.children.length;
  };

  const closeModal=({restoreHash=true}={})=>{
    if(modal.hidden)return;
    modal.hidden=true;
    document.body.classList.remove('modal-open');
    document.body.style.overflow=previousOverflow;
    if(restoreHash&&location.hash.startsWith(`#${activeArticleId}`))history.replaceState(null,'',`${location.pathname}${location.search}`);
    activeArticleId=null;
    if(lastTrigger&&document.contains(lastTrigger))lastTrigger.focus();
  };

  const openModal=async(item,trigger,{updateHash=true,paragraphId=null}={})=>{
    const data=await agreementDataPromise;
    const articleId=item.id;
    const articleData=articleIndex.get(articleId);
    if(!articleData)return;
    activeArticleId=articleId;
    if(trigger)lastTrigger=trigger;else if(!lastTrigger)lastTrigger=document.querySelector(`[data-open-article="${articleId}"]`);
    chapterLabel.textContent=articleData.chapterTitle||'';
    title.textContent=articleData.title;
    legalText.innerHTML=renderParagraphs(articleData);
    renderArticleRelations(articleData);
    sourceLabel.textContent=data.sourceLabel||data.bulletin||'Fuente del convenio';
    sourceLink.href=data.sourceUrl;
    pdfLink.href=data.officialPdf;
    previousOverflow=document.body.style.overflow;
    document.body.classList.add('modal-open');
    document.body.style.overflow='hidden';
    modal.hidden=false;
    dialog.scrollTop=0;
    dialog.focus({preventScroll:true});
    if(updateHash)history.pushState(null,'',`#${articleId}${paragraphId?`:${paragraphId}`:''}`);
    if(paragraphId){requestAnimationFrame(()=>modal.querySelector(`#${CSS.escape(`${articleId}-${paragraphId}`)}`)?.scrollIntoView({block:'center'}))}
  };

  agreementDataPromise.then(data=>{
    articleIndex=new Map(data.chapters.flatMap(entry=>entry.articles.map(article=>[article.id,{...article,chapterId:entry.id,chapterTitle:entry.title}])));
    openFromHash();
  }).catch(()=>{});

  for(const item of items){
    const originalLink=item.querySelector('a[href]:not(.anchor)');
    const button=document.createElement('button');
    button.type='button';button.className='agreement-article-open';button.dataset.openArticle=item.id;button.textContent='Ver artículo';
    if(originalLink)originalLink.replaceWith(button);else item.append(button);
    button.addEventListener('click',()=>openModal(item,button));
  }

  modal.addEventListener('click',event=>{
    const related=event.target.closest('[data-related-article]');
    if(related){const item=document.getElementById(related.dataset.relatedArticle);if(item)openModal(item,related,{updateHash:true});return}
    if(event.target.closest('[data-modal-close]'))closeModal();
  });

  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)closeModal();if(event.key==='Tab'&&!modal.hidden){const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});

  function openFromHash(){
    const raw=decodeURIComponent(location.hash.slice(1));
    const match=raw.match(/^(articulo-\d+)(?::(p\d+))?$/);
    if(!match){if(!modal.hidden)closeModal({restoreHash:false});return}
    const [,id,paragraphId]=match;
    const item=document.getElementById(id);
    if(item&&articleIndex.has(id))openModal(item,null,{updateHash:false,paragraphId:paragraphId||null});
  }
  window.addEventListener('hashchange',openFromHash);
}
