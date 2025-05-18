/***********************************************/
/* ========= 0) 工具：统一回到页面顶部 ========= */
function scrollToTop () {
  /* 1. 视窗本身 */
  window.scrollTo(0, 0);
  /* 2. 某些浏览器写到 documentElement 才生效 */
  document.documentElement.scrollTop = 0;
  document.body.scrollTop           = 0;
  /* 3. 如果主区域被设置为可滚动容器，也一并归零 */
  const mc = document.querySelector('.main-content');
  if (mc) mc.scrollTop = 0;
}

/***********************************************/
/* ============ DOM SELECTOR 缓存 ============ */
const navItems       = document.querySelectorAll('#navList li');
const pages          = document.querySelectorAll('.page-section');
const printsNav      = document.getElementById('printsNav');
const titleLink      = document.querySelector('.title-link');

const subNav         = document.getElementById('subNavButtons');
const btnBackSub     = document.getElementById('btnBackSub');
const btnNextSub     = document.getElementById('btnNextSub');

const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

/***********************************************/
/* ========== 0) PAGE-STATE PERSISTENCE ======= */
function savePageState () {
  const activeSection = document.querySelector('.page-section.active');
  if (activeSection) sessionStorage.setItem('activeSectionId', activeSection.id);
  sessionStorage.setItem('scrollY', window.scrollY);
}
function restorePageState () {
  const storedId = sessionStorage.getItem('activeSectionId');
  const storedY  = sessionStorage.getItem('scrollY');
  if (storedId) {
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(storedId)?.classList.add('active');
    document.querySelector(`#navList li[data-target="${storedId}"]`)?.classList.add('active');
    printsNav?.classList.toggle('active', storedId === 'prints-zine');
  }
  if (storedY !== null) window.scrollTo(0, parseInt(storedY, 10));
  updateSubNav();
}
window.addEventListener('DOMContentLoaded', restorePageState);
window.addEventListener('beforeunload',   savePageState);

/***********************************************/
/* ========== 0.1) 子页 Back / Next 逻辑 ======= */
const subGroups = {
  Unit1  : ['sectionA', 'sectionB', 'sectionC', 'sectionD'],
  Gallery: ['Gallery-series-1', 'Gallery-series-2', 'Gallery-series-3'],
  Unit2  : ['sectionE', 'sectionF', 'sectionG', 'sectionH'],
};
function getCurrentGroupId (sectionId) {
  for (const key in subGroups) {
    if (subGroups[key].includes(sectionId)) return key;
  }
  return null;
}
function updateSubNav () {
  const active = document.querySelector('.page-section.active');
  const gid    = active ? getCurrentGroupId(active.id) : null;
  subNav.style.display = gid ? 'flex' : 'none';
}
function navigateSub (delta) {
  const active = document.querySelector('.page-section.active');
  if (!active) return;
  const gid = getCurrentGroupId(active.id);
  if (!gid) return;
  const arr = subGroups[gid];
  const idx = arr.indexOf(active.id);
  const nextIdx   = (idx + delta + arr.length) % arr.length;
  const targetId  = arr[nextIdx];

  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(targetId)?.classList.add('active');

  scrollToTop();
  savePageState();
  updateSubNav();
}
btnBackSub?.addEventListener('click', () => navigateSub(-1));
btnNextSub?.addEventListener('click', () => navigateSub(1));

/***********************************************/
/* ========== 1) SIDEBAR NAV SWITCHING ========= */
function closeLightbox () {
  lightboxOverlay.classList.remove('active');
  lightboxImg.src = '';
}
lightboxOverlay.addEventListener('click', e => { if (e.target === lightboxOverlay) closeLightbox(); });

navItems.forEach(item => {
  item.addEventListener('click', () => {
    /* 激活导航与页面 */
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    item.classList.add('active');

    const targetId = item.dataset.target;
    document.getElementById(targetId)?.classList.add('active');
    printsNav?.classList.toggle('active', targetId === 'prints-zine');

    scrollToTop();
    savePageState();
    updateSubNav();
    closeLightbox();
  });
});

titleLink.addEventListener('click', e => {
  e.preventDefault();
  navItems.forEach(n => n.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('landing')?.classList.add('active');
  printsNav?.classList.remove('active');

  scrollToTop();
  savePageState();
  updateSubNav();
  closeLightbox();
});

/***********************************************/
/* ========== 2) LIGHTBOX FUNCTIONALITY ======== */
let lightboxIndex   = 0;
let lightboxGallery = [];
const gallerySelectors = ['.gallery img', '.p-gallery img', '.viewer-large', '.image-block img'];
const galleryImages    = document.querySelectorAll(gallerySelectors.join(', '));

galleryImages.forEach(img => {
  img.addEventListener('click', e => {
    const parent = e.target.closest('.gallery, .p-gallery, .image-block');
    lightboxGallery = parent ? Array.from(parent.querySelectorAll('img')) : [e.target];
    lightboxIndex   = lightboxGallery.indexOf(e.target);
    openLightbox();
  });
});
function openLightbox () {
  if (!lightboxGallery[lightboxIndex]) return;
  const fullSrc = lightboxGallery[lightboxIndex].dataset.full || lightboxGallery[lightboxIndex].src;
  lightboxImg.src = fullSrc;
  lightboxOverlay.classList.add('active');
  updateLightboxArrows();
}
function updateLightboxArrows () {
  if (lightboxGallery.length <= 1) {
    lightboxPrev.classList.add('hidden');
    lightboxNext.classList.add('hidden');
  } else {
    lightboxPrev.classList.toggle('hidden', lightboxIndex === 0);
    lightboxNext.classList.toggle('hidden', lightboxIndex === lightboxGallery.length - 1);
  }
}
function lightboxShowNext () { lightboxIndex = (lightboxIndex + 1) % lightboxGallery.length; openLightbox(); }
function lightboxShowPrev () { lightboxIndex = (lightboxIndex - 1 + lightboxGallery.length) % lightboxGallery.length; openLightbox(); }
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev .addEventListener('click', lightboxShowPrev);
lightboxNext .addEventListener('click', lightboxShowNext);

document.addEventListener('keyup', e => {
  if (!lightboxOverlay.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lightboxShowPrev();
  if (e.key === 'ArrowRight') lightboxShowNext();
});

/***********************************************/
/* ========== 3) 三层 Gallery 结构 ============ */
function toggleActive (elements, targetId) {
  elements.forEach(el => el.classList.remove('active'));
  if (targetId) document.getElementById(targetId)?.classList.add('active');
}
function activateGroupImage (group, idx) {
  const middleItems = group.querySelectorAll('.middle-item');
  const viewerLarge = group.querySelector('.viewer-large');
  if (!viewerLarge || !middleItems.length) return;

  middleItems.forEach(mi => mi.classList.remove('active'));
  middleItems[idx]?.classList.add('active');
  viewerLarge.src        = middleItems[idx]?.dataset.full || '';
  group.dataset.currentIndex = idx;
  savePageState();
}

document.querySelectorAll('.top-item').forEach(top => {
  top.addEventListener('click', () => {
    const targetId    = top.dataset.target;
    const targetGroup = document.getElementById(targetId);
    if (!targetGroup) return;
    if (targetGroup.classList.contains('active')) {
      targetGroup.classList.remove('active');
    } else {
      toggleActive(document.querySelectorAll('.gallery-group'));
      targetGroup.classList.add('active');
      activateGroupImage(targetGroup, 0);
    }
  });
});

document.querySelectorAll('.middle-item').forEach(item => {
  item.addEventListener('click', () => {
    const group = item.closest('.gallery-group');
    const idx   = parseInt(item.dataset.index, 10);
    if (group && !isNaN(idx)) activateGroupImage(group, idx);
  });
});

document.querySelectorAll('.gallery-group').forEach(group => {
  const btnPrev = group.querySelector('.viewer-prev');
  const btnNext = group.querySelector('.viewer-next');
  const middle  = group.querySelectorAll('.middle-item');
  if (!btnPrev || !btnNext || !middle.length) return;
  group.dataset.currentIndex = 0;
  btnPrev.addEventListener('click', () => {
    const cur = parseInt(group.dataset.currentIndex, 10) || 0;
    const nxt = cur > 0 ? cur - 1 : middle.length - 1;
    activateGroupImage(group, nxt);
  });
  btnNext.addEventListener('click', () => {
    const cur = parseInt(group.dataset.currentIndex, 10) || 0;
    const nxt = cur < middle.length - 1 ? cur + 1 : 0;
    activateGroupImage(group, nxt);
  });
});

/***********************************************/
/* ========== 4) Gallery 缩略图->二级 ========== */
function handleBackButton (currentId, targetId) {
  document.getElementById(currentId)?.classList.remove('active');
  document.getElementById(targetId)?.classList.add('active');
  scrollToTop();
  savePageState();
  updateSubNav();
}
document.querySelectorAll('#illus-series-gallery img').forEach(img => {
  img.addEventListener('click', () => {
    const targetId = img.dataset.target;
    if (targetId) handleBackButton('Gallery', targetId);
  });
});

/* Unit 1/2 thumbnail → 子页 */
document.querySelectorAll('#unitGallery figure').forEach(fig => {
  fig.addEventListener('click', () => {
    const target = fig.dataset.target;
    if (!target) return;

    /* 将所属单元及全部子页先关掉 */
    ['Unit1', 'sectionA', 'sectionB', 'sectionC', 'sectionD',
     'Unit2', 'sectionE', 'sectionF', 'sectionG', 'sectionH']
      .forEach(secId => document.getElementById(secId)?.classList.remove('active'));

    document.getElementById(target)?.classList.add('active');

    scrollToTop();
    savePageState();
    updateSubNav();
  });
});
