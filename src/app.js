document.querySelectorAll('[data-start][data-end]').forEach((banner) => {
  const now = Date.now();
  if (now < Date.parse(banner.dataset.start) || now > Date.parse(banner.dataset.end)) banner.hidden = true;
});
