/***********************************************/
/* ============ DOM SELECTOR 缓存 ============ */
// 导航&页面
const navItems = document.querySelectorAll('#navList li');
const pages = document.querySelectorAll('.page-section');
const printsNav = document.getElementById('printsNav');
const titleLink = document.querySelector('.title-link');

// Lightbox
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Illustration 二级返回按钮
const btnBackSeries1 = document.getElementById('btnBackSeries1');
const btnBackSeries2 = document.getElementById('btnBackSeries2');

/***********************************************/
/* ========== 1) NAVIGATION & PAGE SWITCHING ========== */

// 关闭Lightbox函数
function closeLightbox() {
  lightboxOverlay.classList.remove('active');
  lightboxImg.src = '';
}

// 点击lightbox空白处关闭
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) {
    closeLightbox();
  }
});

// 左侧导航点击切换页面
navItems.forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有active
    navItems.forEach(nav => nav.classList.remove('active'));
    pages.forEach(pg => pg.classList.remove('active'));

    // 当前li和对应页面加active
    item.classList.add('active');
    const targetId = item.dataset.target;
    document.getElementById(targetId).classList.add('active');

    // 关闭Lightbox
    closeLightbox();

    // 判断prints-zine
    if (targetId === 'prints-zine') {
      printsNav.classList.add('active');
    } else {
      printsNav.classList.remove('active');
    }
  });
});

// 点击左上角标题 -> 回到 landing
titleLink.addEventListener('click', (e) => {
  e.preventDefault();
  navItems.forEach(nav => nav.classList.remove('active'));
  pages.forEach(pg => pg.classList.remove('active'));

  const landingSection = document.getElementById('landing');
  landingSection.classList.add('active');

  printsNav.classList.remove('active');
  closeLightbox();
});

/***********************************************/
/* ========== 2) LIGHTBOX FUNCTIONALITY ========== */
// 这里的 Lightbox 用于点击 .gallery img 弹出大图
let lightboxIndex = 0;        // 当前图片在画廊中的索引
let lightboxGallery = [];     // 当前点击的 gallery 所有img

// 给所有 .gallery img 添加点击 -> 打开lightbox
const galleryImages = document.querySelectorAll('.gallery img');
galleryImages.forEach(img => {
  img.addEventListener('click', (e) => {
    const parentGallery = e.target.closest('.gallery');
    lightboxGallery = Array.from(parentGallery.querySelectorAll('img'));
    lightboxIndex = lightboxGallery.indexOf(e.target);
    openLightbox();
  });
});
// 给第三层 .viewer-large 添加点击事件 -> 使用全局灯箱
const viewerLargeImages = document.querySelectorAll('.viewer-large');
viewerLargeImages.forEach(img => {
  img.addEventListener('click', (e) => {
    const src = e.target.src; // 获取当前大图的 src
    if (src) {
      lightboxGallery = [e.target]; // 仅包含当前图片
      lightboxIndex = 0; // 设置索引为当前唯一的图片
      openLightbox(); // 调用全局打开灯箱的函数
    }
  });
});
// 给 image-block 中的所有图片添加点击事件
const imageBlockImages = document.querySelectorAll('.image-block img');
imageBlockImages.forEach(img => {
  img.addEventListener('click', (e) => {
    // 1) 找到它所在的父容器 (如果有 .image-block 之类)
    const parentBlock = e.target.closest('.image-block');
    // 2) 收集 parentBlock 里的所有 <img>
    const blockImgs = Array.from(parentBlock.querySelectorAll('img'));
    // 3) 把它们赋给全局
    lightboxGallery = blockImgs;
    // 4) 找到点击的是第几张
    lightboxIndex = blockImgs.indexOf(e.target);
    // 5) 最后调用 openLightbox() (不带参数)
    openLightbox();
  });
});


// 打开Lightbox
function openLightbox() {
  if (!lightboxGallery[lightboxIndex]) return;
  const fullSrc = lightboxGallery[lightboxIndex].dataset.full 
                || lightboxGallery[lightboxIndex].src;
  lightboxImg.src = fullSrc;
  lightboxOverlay.classList.add('active');
  updateLightboxArrows();
}

// 更新lightbox箭头状态
function updateLightboxArrows() {
  if (lightboxGallery.length <= 1) {
    lightboxPrev.classList.add('hidden');
    lightboxNext.classList.add('hidden');
  } else {
    lightboxPrev.classList.toggle('hidden', lightboxIndex === 0);
    lightboxNext.classList.toggle('hidden', lightboxIndex === lightboxGallery.length - 1);
  }
}

// 左右切换
function lightboxShowNext() {
  if (lightboxIndex < lightboxGallery.length - 1) {
    lightboxIndex++;
  } else {
    // wrap around
    lightboxIndex = 0;
  }
  openLightbox();
}
function lightboxShowPrev() {
  if (lightboxIndex > 0) {
    lightboxIndex--;
  } else {
    // wrap around
    lightboxIndex = lightboxGallery.length - 1;
  }
  openLightbox();
}
function updateLightboxArrows() {
  if (lightboxGallery.length <= 1) {
    // 只有一张图的时候才隐藏箭头
    lightboxPrev.classList.add('hidden');
    lightboxNext.classList.add('hidden');
  } else {
    // 多张图就一直显示
    lightboxPrev.classList.remove('hidden');
    lightboxNext.classList.remove('hidden');
  }
}

// lightbox按钮和键盘事件
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', lightboxShowPrev);
lightboxNext.addEventListener('click', lightboxShowNext);

document.addEventListener('keyup', (e) => {
  if (!lightboxOverlay.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxShowPrev();
  if (e.key === 'ArrowRight') lightboxShowNext();
});

/***********************************************/
/* ========== 4) 三层结构(Top->Middle->Bottom) ========== */

// 通用函数：切换active类
function toggleActive(elements, targetId) {
  elements.forEach(el => el.classList.remove('active'));
  if (targetId) {
    const targetElement = document.getElementById(targetId);
    targetElement?.classList.add('active');
  }
}

// 通用函数：激活某组的图片
function activateGroupImage(group, idx) {
  const middleItems = group.querySelectorAll('.middle-item');
  const viewerLarge = group.querySelector('.viewer-large');
  const btnPrev = group.querySelector('.viewer-prev');
  const btnNext = group.querySelector('.viewer-next');

  if (!viewerLarge || !middleItems.length) return;

  // 更新缩略图高亮
  middleItems.forEach(mi => mi.classList.remove('active'));
  middleItems[idx]?.classList.add('active');

  // 更新大图
  const fullUrl = middleItems[idx]?.dataset.full || '';
  viewerLarge.src = fullUrl;

  // 更新索引和按钮状态
  group.dataset.currentIndex = idx;
  if (btnPrev && btnNext) {
    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === middleItems.length - 1;
  }
}

// 4.1 点击顶部 -> 展开/收起该组
document.querySelectorAll('.top-item').forEach(top => {
  top.addEventListener('click', () => {
    const targetId = top.dataset.target;
    const targetGroup = document.getElementById(targetId);
    const groups = document.querySelectorAll('.gallery-group');

    if (!targetGroup) return;
    if (targetGroup.classList.contains('active')) {
      targetGroup.classList.remove('active');
    } else {
      toggleActive(groups); // 关闭其他组
      targetGroup.classList.add('active');
      activateGroupImage(targetGroup, 0); // 默认显示第0张
    }
  });
});

// 4.2 第二层点击 -> 显示第三层的大图
document.querySelectorAll('.middle-item').forEach(item => {
  item.addEventListener('click', () => {
    const group = item.closest('.gallery-group');
    const idx = parseInt(item.dataset.index, 10);
    if (!group || isNaN(idx)) return;
    activateGroupImage(group, idx);
  });
});

// 4.3 第三层左右按钮
document.querySelectorAll('.gallery-group').forEach(group => {
  const btnPrev = group.querySelector('.viewer-prev');
  const btnNext = group.querySelector('.viewer-next');
  const middleItems = group.querySelectorAll('.middle-item');

  if (!btnPrev || !btnNext || !middleItems.length) return;

  group.dataset.currentIndex = 0; // 初始化索引

  btnPrev.addEventListener('click', () => {
    const currentIdx = parseInt(group.dataset.currentIndex, 10) || 0;
    const newIndex = currentIdx > 0 ? currentIdx - 1 : middleItems.length - 1; // 循环到最后一张
    activateGroupImage(group, newIndex);
  });

  btnNext.addEventListener('click', () => {
    const currentIdx = parseInt(group.dataset.currentIndex, 10) || 0;
    const newIndex = currentIdx < middleItems.length - 1 ? currentIdx + 1 : 0; // 循环到第一张
    activateGroupImage(group, newIndex);
  });
});

/***********************************************/
/* ========== 5) Illustration 二级返回示例 ========== */

// 通用返回函数
function handleBackButton(currentId, targetId) {
  document.getElementById(currentId)?.classList.remove('active');
  document.getElementById(targetId)?.classList.add('active');
}

// Illustration返回
if (btnBackSeries1) {
  btnBackSeries1.addEventListener('click', () => {
    handleBackButton('illustration-series-1', 'illustration');
  });
}
if (btnBackSeries2) {
  btnBackSeries2.addEventListener('click', () => {
    handleBackButton('illustration-series-2', 'illustration');
  });
}

/***********************************************/
/* ========== 6) Illustration缩略图->二级 ========== */

document.querySelectorAll('#illus-series-gallery img').forEach(img => {
  img.addEventListener('click', () => {
    const targetId = img.dataset.target;
    if (!targetId) return;
    handleBackButton('illustration', targetId);
  });
});
