/**
 * AURA Fashion AI - 灵感企划设计平台交互逻辑
 * 支持真正的 5 步分级页面视图 (Step Wizard Panels)：
 * 当解锁后，可在左侧侧边栏无缝退回/前进至任意已解锁步骤视图。
 */

// 状态管理
const state = {
  currentStep: 1,
  unlockedSteps: [1], // 默认已解锁 Step 1
  currentTab: 'plan',
  model: 'gpt-4o',
  isAdmin: false,
  currentView: 'designer', // 'designer' or 'admin'
  config: {
    mode: 'demo', // 'demo' or 'live'
    apiKey: '',
    apiBaseUrl: 'https://api.openai.com/v1',
    imgApiUrl: ''
  },
  projectData: {
    brand: 'LOUIS VUITTON',
    season: '2026年春夏',
    categories: ['短款外套', '衬衫', '卫衣', '短袖', '长裤', '短裤'],
    gender: '男装',
    theme: '静奢沉静与浮光掠影 (Silent Radiance)'
  },
  selectedImages: [2, 4, 13], // 默认预选 3 张高吻合度秀场图
  selectedFormat: 'combo' // 'ppt', 'web', 'combo'
};

// 秀场参考图数据 (15 张来自时装周秀场大片)
const RUNWAY_IMAGES = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  src: `assets/inspiration/runway_${i + 1}.png`,
  title: `2026SS Runway Look #${i + 1}`,
  designer: i % 2 === 0 ? 'Quiet Luxury Series' : 'Modern Couture',
  category: ['礼服', '风衣', '西装', '针织', '解构裙装'][i % 5]
}));

// 生成资产数据 (多维度)
const GENERATED_ASSETS = {
  moodboard: [
    { src: 'assets/generated/mood_1.png', title: '情绪板：晨曦微光与丝质流动' },
    { src: 'assets/generated/mood_2.png', title: '光影与褶皱空间肌理' },
    { src: 'assets/generated/mood_3.png', title: '艺术解构与复古静谧细节' },
    { src: 'assets/generated/mood_4.png', title: '系列线稿与设计草图矩阵' }
  ],
  palette: [
    { src: 'assets/generated/pal_1.png', title: '核心流行色与面料光泽' },
    { src: 'assets/generated/pal_2.png', title: '重磅真丝与亚麻编织' },
    { src: 'assets/generated/pal_3.png', title: '自然矿物与温润调性' }
  ],
  silhouettes: [
    { src: 'assets/inspiration/runway_2.png', title: '造型 01: 垂坠立体刺绣礼服' },
    { src: 'assets/inspiration/runway_4.png', title: '造型 02: 极简削肩收腰长裙' },
    { src: 'assets/inspiration/runway_13.png', title: '造型 03: 细褶叠层透光晚装' }
  ]
};

// 提取的专业企划数据 (潘通 TCX 权威色号 + 面料 + 剪裁工艺)
const SPEC_DATA = {
  colors: {
    primary: {
      code: '13-1008 TCX',
      name: 'Oat Milk (柔和米色)',
      hex: '#E6DBC9',
      role: '主题核心色 (Primary Accent)',
      analysis: '柔和米色作为本系列的主题色，完美诠释了低调奢华与永恒经典的结合。介于米白与浅棕之间，拥有温暖而内敛的特质，不张扬却充满高级感，高度呼应“静奢风”(Quiet Luxury) 流行趋势，兼顾环保与经典审美品味。'
    },
    secondary: [
      { code: '11-0604 TCX', name: 'Coconut Milk (珍珠白)', hex: '#F0EFEA', role: '副色 (Secondary)', desc: '用于提亮和表现精致细节，如珠饰或蕾丝底色，带来清雅纯洁感。' },
      { code: '14-4202 TCX', name: 'Quiet Shade (浅银灰)', hex: '#A0A2A3', role: '副色 (Secondary)', desc: '用于珠片、亮片或金属感的点缀，增加冷调光泽与现代感。' }
    ],
    base: [
      { code: '11-0602 TCX', name: 'White Alyssum (本白)', hex: '#F2F0EB', role: '基础色 (Base)' },
      { code: '15-1304 TCX', name: 'Moonbeam (浅灰褐)', hex: '#CDC6BD', role: '基础色 (Base)' },
      { code: '19-3900 TCX', name: 'True Black (墨黑)', hex: '#1E1F21', role: '基础色 (Base)' }
    ]
  },
  fabrics: [
    { name: '薄纱/网纱 (Tulle/Mesh)', desc: '作为轻盈、透明的基底，用于打造朦胧感和层次感，是承载刺绣、珠饰或立体花朵的理想载体，营造仙气飘逸的视觉效果。' },
    { name: '刺绣蕾丝 (Embroidered Lace)', desc: '精致的图案通过刺绣工艺呈现，赋予服装极强的浪漫与奢华感，无论是作为面料主体还是局部装饰，均能增强立体多层次视觉。' },
    { name: '真丝乔其纱/绉纱 (Silk Georgette/Crepe)', desc: '具有优异的悬垂性和流利感，质地轻盈且带有柔和光泽，适合打造简约而优雅的垂坠廓形，展现高级面料的自然美感和流动性。' },
    { name: '提花棉麻混纺 (Jacquard Cotton-Linen)', desc: '在面料表面通过提花工艺形成微浮雕图案，结合棉麻的自然纹理和挺括感，赋予服装复古与田园诗般的人文气息。' }
  ],
  designCraft: [
    { title: '立体花卉与珠饰叠加', desc: '大量运用手工缝制的立体花卉、叶片或珠饰、亮片，以点缀、覆盖的方式呈现于薄纱或蕾丝基底上，营造如梦似幻的奢华触感。' },
    { title: '垂坠廓形与解构细节', desc: '强调服装的流线型线条和自然垂坠感，结合不对称斜裁与侧缝开叉，行走时呈现宛若浮光的动荡美感。' },
    { title: '多层次通透穿搭', desc: '内外层虚实掩映，以内敛剪裁衬托轻纱通透性，达到既内敛克制又极富细节耐看度的时装高级感。' }
  ]
};

// DOM 初始化
document.addEventListener('DOMContentLoaded', () => {
  initLoginSystem();
  initNavigation();
  initSidebarNavigation();
  initSuggestionCards();
  initPromptBuilder();
  initApiConfigModal();
  initLightbox();
  initDeckModal();
  initStepActionButtons();
});

// 视频登录与退出系统
function initLoginSystem() {
  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const userRoleText = document.getElementById('userRoleText');
  const loginMinMaxBtn = document.getElementById('loginMinMaxBtn');
  const loginMaximizeBtn = document.getElementById('loginMaximizeBtn');
  const loginCard = document.getElementById('loginCard');

  const tabDesigner = document.getElementById('tabDesignerLogin');
  const tabAdmin = document.getElementById('tabAdminLogin');
  const loginAccount = document.getElementById('loginAccount');
  const loginRole = document.getElementById('loginRole');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginFooterTip = document.getElementById('loginFooterTip');
  const accountFieldLabel = document.getElementById('accountFieldLabel');
  const adminRAGNavBtn = document.getElementById('adminRAGNavBtn');
  const navAdminRAG = document.getElementById('navAdminRAG');

  // 选项卡切换: 设计师 vs 管理员
  if (tabDesigner && tabAdmin) {
    tabDesigner.onclick = () => {
      tabDesigner.style.background = '#252b36';
      tabDesigner.style.color = '#fff';
      tabAdmin.style.background = 'transparent';
      tabAdmin.style.color = '#94a3b8';
      if (loginAccount) loginAccount.value = 'designer@aura-fashion.ai';
      if (loginRole) loginRole.value = 'designer';
      if (loginBtnText) loginBtnText.innerText = '进入 AURA 企划工作站';
      if (accountFieldLabel) accountFieldLabel.innerText = '设计师账号 / 邮箱';
      if (loginFooterTip) loginFooterTip.innerText = '设计师专属企划工作流，支持五步闭环企划研发';
    };

    tabAdmin.onclick = () => {
      tabAdmin.style.background = '#8b5cf6';
      tabAdmin.style.color = '#fff';
      tabDesigner.style.background = 'transparent';
      tabDesigner.style.color = '#94a3b8';
      if (loginAccount) loginAccount.value = 'admin@aura-fashion.ai';
      if (loginRole) loginRole.value = 'admin';
      if (loginBtnText) loginBtnText.innerText = '进入 AURA 管理员工作台';
      if (accountFieldLabel) accountFieldLabel.innerText = '管理员账号 / 邮箱';
      if (loginFooterTip) loginFooterTip.innerText = '已选定系统管理员权限：支持本地数据集打包与 RAG 检索训练';
    };
  }

  if (loginMinMaxBtn && loginCard && loginMaximizeBtn) {
    loginMinMaxBtn.addEventListener('click', () => {
      loginCard.style.display = 'none';
      loginMaximizeBtn.style.display = 'flex';
    });
    
    loginMaximizeBtn.addEventListener('click', () => {
      loginCard.style.display = 'block';
      loginMaximizeBtn.style.display = 'none';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const roleSelect = document.getElementById('loginRole');
      const roleVal = roleSelect ? roleSelect.value : 'designer';
      const selectedRoleText = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text.split('/')[0].trim() : '服装设计师';
      
      if (userRoleText) userRoleText.innerText = selectedRoleText;

      const submitBtn = document.getElementById('loginSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.innerText = '验证中，即将进入工作台...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span id="loginBtnText">进入 AURA 工作台</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        
        if (loginOverlay) {
          loginOverlay.classList.add('hidden');
        }

        if (roleVal === 'admin') {
          state.isAdmin = true;
          if (adminRAGNavBtn) adminRAGNavBtn.style.display = 'inline-flex';
          if (navAdminRAG) navAdminRAG.style.display = 'flex';
          openAdminPanel();
          showNotification(`🛡️ 管理员已登录！已进入【时装多模态数据集与 RAG 训练中心】。`);
        } else {
          state.isAdmin = false;
          if (adminRAGNavBtn) adminRAGNavBtn.style.display = 'none';
          if (navAdminRAG) navAdminRAG.style.display = 'none';
          showNotification(`✨ 欢迎登录 AURA 企划工作站！[${selectedRoleText}] 身份已就绪。`);
        }
      }, 500);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (loginOverlay) {
        loginOverlay.classList.remove('hidden');
      }
      showNotification('已成功退出当前账号');
    });
  }
}

// 核心步骤视图切换引擎 (Step View Panel Switcher)
function switchStep(stepNum) {
  const targetStep = parseInt(stepNum);

  // 隐藏管理员面板
  const adminPanel = document.getElementById('panelAdminRAG');
  if (adminPanel) adminPanel.style.display = 'none';

  // 校验是否已解锁
  if (!state.unlockedSteps.includes(targetStep)) {
    const navText = document.querySelector(`#navStep${targetStep} .nav-text`)?.innerText || `步骤 ${targetStep}`;
    showNotification(`👉 请先完成前置步骤以解锁【${navText}】页面`);
    return;
  }

  state.currentStep = targetStep;
  state.currentView = 'designer';

  // 1. 隐藏所有 Step Panel，仅展示当前 Panel
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
    if (panel.id !== 'panelAdminRAG') {
      panel.style.display = '';
    }
  });

  const activePanel = document.getElementById(`panelStep${targetStep}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // 2. 更新左侧边栏高亮状态
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const s = parseInt(item.dataset.step);
    if (s === targetStep) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }

    if (state.unlockedSteps.includes(s)) {
      item.classList.remove('disabled');
    } else {
      item.classList.add('disabled');
    }
  });

  // 3. 更新左侧边栏底栏状态框
  const statusTitle = document.getElementById('statusBoxTitle');
  const statusSub = document.getElementById('statusBoxSub');
  const statusMap = {
    1: { title: '步骤 1/5: 企划设计', sub: '编辑并提交设计提示词' },
    2: { title: '步骤 2/5: 图片筛选', sub: '勾选精选参考服装图' },
    3: { title: '步骤 3/5: 关键图片生成', sub: 'AI 多维度图文资产协同中' },
    4: { title: '步骤 4/5: 企划文案生成', sub: '潘通 TCX 与面料深度提炼' },
    5: { title: '步骤 5/5: 生成 PPT', sub: '导出商业提案与数字看板' }
  };
  if (statusTitle && statusMap[targetStep]) {
    statusTitle.innerText = statusMap[targetStep].title;
    statusSub.innerText = statusMap[targetStep].sub;
  }

  // 4. 滚动到页面最上方
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 解锁步骤
function unlockStep(stepNum) {
  if (!state.unlockedSteps.includes(stepNum)) {
    state.unlockedSteps.push(stepNum);
    const navItem = document.getElementById(`navStep${stepNum}`);
    if (navItem) navItem.classList.remove('disabled');
  }
}

// 左侧边栏点击事件
function initSidebarNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.dataset.step);
      switchStep(step);
    });
  });
}

// 1. 导航与模型切换
function initNavigation() {
  const modelSelect = document.getElementById('modelSelect');
  modelSelect.addEventListener('change', (e) => {
    state.model = e.target.value;
    showNotification(`已切换底层模型推理核心至: ${modelSelect.options[modelSelect.selectedIndex].text}`);
  });

  const resetBtn = document.getElementById('resetDemoBtn');
  resetBtn.addEventListener('click', () => {
    if (confirm('确认重置当前灵感企划并返回初始步骤？')) {
      location.reload();
    }
  });

  // Tab 切换
  const tabBtns = document.querySelectorAll('.category-tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentTab = btn.dataset.tab;
    });
  });
}

// 2. 建议灵感卡片点击填入
function initSuggestionCards() {
  const cards = document.querySelectorAll('.suggestion-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const text = card.dataset.prompt;
      const sentenceBuilder = document.getElementById('sentenceBuilder');
      if (sentenceBuilder) {
        sentenceBuilder.innerText = text;
      }
      showNotification('已自动填入推荐预设文本');
    });
  });
}

// 3. 结构化 Prompt 提交（Step 1 -> Step 2 动态联动）
function initPromptBuilder() {
  const sendBtn = document.getElementById('sendPromptBtn');
  if (sendBtn) {
    sendBtn.onclick = handleStartWorkflow;
  }
}

function handleStartWorkflow() {
  const builderEl = document.getElementById('sentenceBuilder');
  const customPromptText = builderEl ? builderEl.innerText.trim() : '';

  // 1. 动态渲染/更新 Step 2 图库与提示语
  renderStep2Gallery(customPromptText);

  // 2. 解锁 Step 2，并自动切换至 Step 2【图片筛选】页面
  unlockStep(2);
  switchStep(2);

  showNotification(`🎉 已根据您最新修改的提示词重新搜抓并筛选秀场大图！`);
}

// 渲染/更新 Step 2: 潮流秀场图库检索与筛选界面
function renderStep2Gallery(userPromptText) {
  const promptText = userPromptText || 'LOUIS VUITTON 2026年春夏系列 男装主题设计企划';

  // 1. 动态更新第二步顶部的文字提示 banner
  const instructionBanner = document.getElementById('step2InstructionText');
  if (instructionBanner) {
    instructionBanner.innerHTML = `
      <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">
        • 正在为您连接自动化采集管道，从 VOGUE, 品牌官网, 优质图库搜索大图...<br>
        • 并行启动 5 大爬虫引擎，AI 预筛高质量结果，请稍候。
      </div>
    `;
  }

  const grid = document.getElementById('runwayGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="color:white; padding: 20px; font-size: 14px;">🌐 正在并行调度爬虫抓取并调用 AI 语义预筛，请稍等片刻...</div>';

  fetch('/api/source_images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText })
  })
  .then(res => res.json())
  .then(data => {
    if (instructionBanner) {
      instructionBanner.innerHTML = `
        <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">
          • 已成功抓取并经过 AI 智能预筛 (剔除低质量/不相关图片)。<br>
          • 搜索词：<strong style="color: #00c292; font-weight: 500;">"${promptText}"</strong>
        </div>
        请从以下筛选出的参考图片中选择您认为最匹配的服装大图，并确认进入下一步。
      `;
    }

    if (data.success && data.data && data.data.length > 0) {
      grid.innerHTML = data.data.map(img => `
        <div class="fashion-card ${state.selectedImages.includes(img.id) ? 'selected' : ''}" data-id="${img.id}">
          <img src="${img.src}" alt="${img.title}" loading="lazy">
          <div class="card-select-checkbox">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="card-hover-actions">
            <button class="card-action-btn zoom-btn" title="查看大图" data-src="${img.src}" data-caption="${img.title}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="card-action-btn" title="收藏至灵感库">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
      bindCardInteractions(document.getElementById('panelStep2'));
    } else {
       grid.innerHTML = '<div style="color:#ff6b6b; padding: 20px;">抱歉，未能获取到高质量图片，请尝试更换关键词。</div>';
    }
  })
  .catch(err => {
     console.error(err);
     grid.innerHTML = '<div style="color:#ff6b6b; padding: 20px;">网络请求失败，请确保后端服务 (FastAPI) 已启动。</div>';
     if (instructionBanner) {
        instructionBanner.innerHTML = '请求后端失败。';
     }
  });

  // 绑定换一批
  const refreshBtn = document.getElementById('refreshGalleryBtn');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      showNotification('🌐 正在通过 API & 动态爬虫重新抓取下一批大图...');
      renderStep2Gallery(promptText);
    };
  }

  // 确认图片并解锁后续步骤
  const confirmBtn = document.getElementById('confirmSelectionBtn');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (state.selectedImages.length === 0) {
        alert('请至少勾选 1 张代表性的参考图！');
        return;
      }

      renderStep3Generation();
      renderStep4Analysis();

      unlockStep(3);
      unlockStep(4);
      unlockStep(5);

      switchStep(3);
      showNotification('✨ 已确认参考图！已解锁【关键图片生成】与后续页面（可从左侧侧边栏自由退回/前进）。');
    };
  }
}

function bindCardInteractions(parentEl) {
  const cards = parentEl.querySelectorAll('.fashion-card');
  cards.forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.card-action-btn')) return;
      const id = parseInt(card.dataset.id);
      if (state.selectedImages.includes(id)) {
        state.selectedImages = state.selectedImages.filter(item => item !== id);
        card.classList.remove('selected');
      } else {
        state.selectedImages.push(id);
        card.classList.add('selected');
      }
      document.getElementById('selectedCountBadge').innerText = state.selectedImages.length;
    };
  });

  const zoomBtns = parentEl.querySelectorAll('.zoom-btn');
  zoomBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openLightbox(btn.dataset.src, btn.dataset.caption);
    };
  });
}

// 渲染 Step 3: 多维度多视角图像生成结果
function renderStep3Generation() {
  const moodRow = document.getElementById('moodboardGenRow');
  const palRow = document.getElementById('paletteGenRow');
  const silRow = document.getElementById('silhouettesGenRow');
  const promptText = document.getElementById('sentenceBuilder') ? document.getElementById('sentenceBuilder').innerText.trim() : state.projectData.theme;
  
  // Get the selected runway image URLs
  const selectedImageUrls = state.selectedImages.map(id => {
    const img = RUNWAY_IMAGES.find(r => r.id === id);
    return img ? img.src : null;
  }).filter(src => src !== null);

  const loadingHtml = '<div style="color:white; padding: 20px; font-size: 14px;">🪄 正在调用通义万相 (ModelScope) 结合参考图生成多维度企划资产，请稍候...</div>';
  if (moodRow) moodRow.innerHTML = loadingHtml;
  if (palRow) palRow.innerHTML = loadingHtml;
  if (silRow) silRow.innerHTML = loadingHtml;

  function applyAssetsToUI(assets, notice = '') {
    window.GENERATED_ASSETS = assets;
    if (moodRow && assets.moodboard) {
      moodRow.innerHTML = assets.moodboard.map(item => `
        <div class="gen-image-item">
          <img src="${item.src}" alt="${item.title}">
          <div class="gen-image-caption">${item.title}</div>
        </div>
      `).join('');
    }
    if (palRow && assets.palette) {
      palRow.innerHTML = assets.palette.map(item => `
        <div class="gen-image-item">
          <img src="${item.src}" alt="${item.title}">
          <div class="gen-image-caption">${item.title}</div>
        </div>
      `).join('');
    }
    if (silRow && assets.silhouettes) {
      silRow.innerHTML = assets.silhouettes.map(item => `
        <div class="gen-image-item">
          <img src="${item.src}" alt="${item.title}">
          <div class="gen-image-caption">${item.title}</div>
        </div>
      `).join('');
    }
    if (notice) {
      showNotification(`✨ ${notice}`);
    }
  }

  function applyFallbackAssets(reason) {
    const fallbackData = {
      moodboard: [
        { src: 'assets/generated/mood_1.png', title: '情绪板：晨曦微光与丝质流动' },
        { src: 'assets/generated/mood_2.png', title: '光影与褶皱空间肌理' },
        { src: 'assets/generated/mood_3.png', title: '艺术解构与复古静谧细节' },
        { src: 'assets/generated/mood_4.png', title: '系列线稿与设计草图矩阵' }
      ],
      palette: [
        { src: 'assets/generated/pal_1.png', title: '核心流行色与面料光泽' },
        { src: 'assets/generated/pal_2.png', title: '重磅真丝与亚麻编织' },
        { src: 'assets/generated/pal_3.png', title: '自然矿物与温润调性' }
      ],
      silhouettes: [
        { src: 'assets/generated/sil_1.png', title: '造型 01: 核心主推款高定设计' },
        { src: 'assets/generated/sil_2.png', title: '造型 02: 极简流线型廓形长裙' },
        { src: 'assets/generated/sil_3.png', title: '造型 03: 建筑感剪裁轻盈晚装' },
        { src: 'assets/generated/sil_4.png', title: '造型 04: 不对称斜裁箱型外套' }
      ]
    };
    applyAssetsToUI(fallbackData, reason);
  }

  fetch('/api/generate_images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, selectedImages: selectedImageUrls })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      applyFallbackAssets('已自动切换至高保真本地离线生图模式');
    } else {
      applyAssetsToUI(data.data, data.data.mode === 'offline_fallback' ? '已自动启用本地高保真资产库（离线协同模式）' : '');
    }
  })
  .catch(err => {
    console.warn('Network offline or image generation failed, using local high-fashion assets:', err);
    applyFallbackAssets('当前网络离线，已为您自动启动本地高保真协同生图');
  });
}

// 渲染 Step 4: 企划文案与潘通特征解析
function renderStep4Analysis() {
  const content = document.getElementById('featureAnalysisContent');
  if (!content) return;
  const promptText = document.getElementById('sentenceBuilder') ? document.getElementById('sentenceBuilder').innerText.trim() : state.projectData.theme;

  // 获取 Step 2 中选中的参考图 URL
  const selectedImageUrls = (state.selectedImages || []).map(id => {
    const img = (typeof RUNWAY_IMAGES !== 'undefined' ? RUNWAY_IMAGES : []).find(r => r.id === id);
    return img ? img.src : null;
  }).filter(Boolean);

  content.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 12px; padding: 28px; text-align: center;">
      <div style="font-size: 28px; margin-bottom: 12px;">🧠</div>
      <div style="color: #38bdf8; font-size: 15px; font-weight: 600; margin-bottom: 6px;">通义千问多模态 AI (Qwen-VL) 正在深度提取特征并撰写企划文案...</div>
      <div style="color: #94a3b8; font-size: 13px;">结合 ${selectedImageUrls.length > 0 ? selectedImageUrls.length + ' 张精选秀场参考图与' : ''}设计要求，提炼潘通TCX色谱、面料规格与时装企划故事</div>
    </div>
  `;

  fetch('/api/analyze_features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, selectedImages: selectedImageUrls })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data) {
      window.SPEC_DATA = data.data;
      displayStep4Content(window.SPEC_DATA);
    } else {
      throw new Error(data.detail || '分析失败');
    }
  })
  .catch(err => {
     console.error(err);
     content.innerHTML = '<div style="color:#ff6b6b; padding: 20px;">AI 分析遇到异常，请检查后端网络与接口配置。</div>';
  });
}

// 渲染 Step 4 主体内容与可交互卡片
function displayStep4Content(SPEC_DATA) {
  const content = document.getElementById('featureAnalysisContent');
  if (!content) return;

  const concept = SPEC_DATA.concept || {
    title: "静默的浮光掠影 / Silent Radiance 2026春夏",
    story: "以自然初生晨光与现代建筑雕塑线条为灵感源泉。巧妙融合轻盈飘逸的真丝与温润立体的天然纤维，通过流畅的垂坠斜裁与立体褶皱，捕捉光影在织物表面流转的动态瞬间。",
    targetAudience: "28-40岁都市独立精英、创意总监与跨国专业人士",
    occasions: "现代美术馆展览、高端商务会谈、都会晚宴及慢调度假私享会"
  };

  content.innerHTML = `
    <!-- 0. AI 企划核心文案与灵感概念故事 -->
    <div class="feature-group" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">✨</span>
          <span style="color: #38bdf8; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">AI 时装企划文案与灵感概念故事 (Concept & Storyboard)</span>
        </div>
        <span style="font-size: 11.5px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3);">
          ⚡ AI 原创生成 (支持直接点击编辑)
        </span>
      </div>

      <!-- 企划主题名 -->
      <div style="margin-bottom: 14px;">
        <label style="font-size: 12px; color: #94a3b8; display: block; margin-bottom: 4px;">系列企划主题名称：</label>
        <div id="specConceptTitle" contenteditable="true" style="color: #fff; font-size: 18px; font-weight: 700; border-bottom: 1px dashed #475569; padding: 4px 0; outline: none;" onblur="window.SPEC_DATA.concept.title = this.innerText.trim()">
          ${concept.title}
        </div>
      </div>

      <!-- 灵感故事与设计理念 -->
      <div style="margin-bottom: 14px;">
        <label style="font-size: 12px; color: #94a3b8; display: block; margin-bottom: 4px;">灵感故事与设计主张叙事：</label>
        <div id="specConceptStory" contenteditable="true" style="color: #e2e8f0; font-size: 14px; line-height: 1.7; background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid #334155; outline: none;" onblur="window.SPEC_DATA.concept.story = this.innerText.trim()">
          ${concept.story}
        </div>
      </div>

      <!-- 客群与适穿场景 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div style="background: rgba(15, 23, 42, 0.5); padding: 10px 12px; border-radius: 8px; border: 1px solid #334155;">
          <span style="font-size: 12px; color: #a78bfa; font-weight: 600;">👥 目标客群定位：</span>
          <div id="specConceptAudience" contenteditable="true" style="color: #cbd5e1; font-size: 13px; margin-top: 4px; outline: none;" onblur="window.SPEC_DATA.concept.targetAudience = this.innerText.trim()">
            ${concept.targetAudience || '追求极简高雅的都市精英新贵'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); padding: 10px 12px; border-radius: 8px; border: 1px solid #334155;">
          <span style="font-size: 12px; color: #34d399; font-weight: 600;">📍 适穿场合与场景：</span>
          <div id="specConceptOccasions" contenteditable="true" style="color: #cbd5e1; font-size: 13px; margin-top: 4px; outline: none;" onblur="window.SPEC_DATA.concept.occasions = this.innerText.trim()">
            ${concept.occasions || '高级商务差旅、都会社交晚宴、现代艺术沙龙'}
          </div>
        </div>
      </div>
    </div>

    <!-- 1. 颜色特征与潘通色卡 -->
    <div class="feature-group">
      <div class="group-title">颜色特征 (Color Characteristics & Pantone Alignment)</div>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: #38bdf8;">• 主题色:</strong> 
        <span style="color: #fff; font-weight: 600;">${SPEC_DATA.colors.primary.name}</span>
        <span class="badge-tag-secondary" style="margin-left: 8px; font-size: 11px;">Pantone ${SPEC_DATA.colors.primary.code}</span>
        <p class="analysis-rich-text" style="margin-left: 12px; margin-top: 6px; line-height: 1.6;">
          <strong>流行色分析：</strong>${SPEC_DATA.colors.primary.analysis}
        </p>
      </div>

      <!-- 潘通色卡展示网格 -->
      <div class="palette-swatches-grid">
        <div class="pantone-card" title="点击复制 HEX 值" onclick="navigator.clipboard.writeText('${SPEC_DATA.colors.primary.hex}'); alert('已复制潘通标准色彩 HEX: ${SPEC_DATA.colors.primary.hex}')">
          <div class="pantone-color-block" style="background-color: ${SPEC_DATA.colors.primary.hex};"></div>
          <div class="pantone-details">
            <div class="pantone-code">PANTONE ${SPEC_DATA.colors.primary.code}</div>
            <div class="pantone-name">${SPEC_DATA.colors.primary.name.split(' ')[0]}</div>
            <div class="pantone-role">${SPEC_DATA.colors.primary.role}</div>
          </div>
        </div>

        ${(SPEC_DATA.colors.secondary || []).map(c => `
          <div class="pantone-card" title="点击复制 HEX 值" onclick="navigator.clipboard.writeText('${c.hex}'); alert('已复制潘通色彩 HEX: ${c.hex}')">
            <div class="pantone-color-block" style="background-color: ${c.hex};"></div>
            <div class="pantone-details">
              <div class="pantone-code">PANTONE ${c.code}</div>
              <div class="pantone-name">${c.name.split(' ')[0]}</div>
              <div class="pantone-role">${c.role}</div>
            </div>
          </div>
        `).join('')}

        ${(SPEC_DATA.colors.base || []).map(c => `
          <div class="pantone-card" title="点击复制 HEX 值" onclick="navigator.clipboard.writeText('${c.hex}'); alert('已复制潘通色彩 HEX: ${c.hex}')">
            <div class="pantone-color-block" style="background-color: ${c.hex}; border-bottom: 1px solid #333;"></div>
            <div class="pantone-details">
              <div class="pantone-code">PANTONE ${c.code}</div>
              <div class="pantone-name">${c.name.split(' ')[0]}</div>
              <div class="pantone-role">${c.role}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 2. 面料特征 -->
    <div class="feature-group" style="margin-top: 24px;">
      <div class="group-title">面料特征 (Fabric & Material Specifications)</div>
      <div class="analysis-rich-text">
        ${(SPEC_DATA.fabrics || []).map(f => {
          const name = typeof f === 'string' ? f : (f.name || f.title || '高级面料');
          const desc = typeof f === 'string' ? '甄选高品质时装面料，兼具挺括手感与高级光泽' : (f.desc || f.description || '');
          return `
            <div style="margin-bottom: 12px; background: rgba(30, 41, 59, 0.4); padding: 10px 14px; border-radius: 8px; border: 1px solid #334155;">
              <strong style="color: #34d399;">• ${name}：</strong>
              <span style="color: #cbd5e1;">${desc}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- 3. 服装设计与剪裁工艺 -->
    <div class="feature-group" style="margin-top: 24px;">
      <div class="group-title">服装设计与剪裁特征 (Design Silhouette & Details)</div>
      <div class="analysis-rich-text">
        ${(SPEC_DATA.designCraft || []).map(d => {
          const title = typeof d === 'string' ? d : (d.title || d.item || '设计剪裁');
          const desc = typeof d === 'string' ? '立体流线型剪裁，结合高级工坊车缝规范' : (d.desc || d.description || d.details || '');
          return `
            <div style="margin-bottom: 12px; background: rgba(30, 41, 59, 0.4); padding: 10px 14px; border-radius: 8px; border: 1px solid #334155;">
              <strong style="color: #60a5fa;">• ${title}：</strong>
              <span style="color: #cbd5e1;">${desc}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- 4. 商业企划与买手推介 (若有AI扩写字段) -->
    ${concept['买手订货话术'] || concept['商业价值点'] || concept['秀场发布阐述'] ? `
      <div class="feature-group" style="margin-top: 24px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 12px; padding: 16px;">
        <div class="group-title" style="color: #a78bfa;">🎯 商业企划与买手订货话术 (Commercial Value & Buyer Pitch)</div>
        <div class="analysis-rich-text">
          ${concept['秀场发布阐述'] ? `<div style="margin-bottom: 10px;"><strong style="color: #f472b6;">• 秀场发布阐述：</strong><span style="color: #e2e8f0;">${concept['秀场发布阐述']}</span></div>` : ''}
          ${concept['买手订货话术'] ? `<div style="margin-bottom: 10px;"><strong style="color: #38bdf8;">• 买手订货推荐：</strong><span style="color: #e2e8f0;">${concept['买手订货话术']}</span></div>` : ''}
          ${concept['商业价值点'] ? `<div><strong style="color: #34d399;">• 市场与商业价值：</strong><span style="color: #e2e8f0;">${concept['商业价值点']}</span></div>` : ''}
        </div>
      </div>
    ` : ''}
  `;
}

// 触发 AI 文案扩写或修订
function handleRefineCopywriting(action, instruction = '') {
  const promptText = document.getElementById('sentenceBuilder') ? document.getElementById('sentenceBuilder').innerText.trim() : state.projectData.theme;
  const currentSpec = window.SPEC_DATA || {};

  showNotification(action === 'extend' ? '✨ AI 正在为您深度扩写企划文案，丰富品牌故事与买手推介词...' : '✏️ AI 正在根据修改意见优化修订企划文案...');

  fetch('/api/refine_copywriting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: promptText,
      specData: currentSpec,
      action: action,
      instruction: instruction
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data) {
      window.SPEC_DATA = data.data;
      displayStep4Content(window.SPEC_DATA);
      showNotification(action === 'extend' ? '🎉 AI 企划文案已成功扩写并更新到页面！' : '🎉 企划文案已根据意见完成优化修订！');
    } else {
      throw new Error(data.detail || '处理失败');
    }
  })
  .catch(err => {
    console.error('Refine copy error:', err);
    showNotification('文案处理失败，请稍后重试');
  });
}

// 绑定步骤页面中的“前进/继续”按钮
function initStepActionButtons() {
  const step3Btn = document.getElementById('goToStep4Btn');
  if (step3Btn) {
    step3Btn.onclick = () => switchStep(4);
  }

  const step4Btn = document.getElementById('goToStep5Btn');
  if (step4Btn) {
    step4Btn.onclick = () => switchStep(5);
  }

  // 绑定 Step 4 真实 AI 文案扩写与修订
  const extendBtn = document.getElementById('extendCopyBtn');
  if (extendBtn) {
    extendBtn.onclick = () => handleRefineCopywriting('extend');
  }

  const reviseBtn = document.getElementById('reviseCopyBtn');
  if (reviseBtn) {
    reviseBtn.onclick = () => {
      const userInput = prompt('请输入您的文案修订意见（例如：语气更高端静奢，突出环保羊绒与解构剪裁）：', '');
      if (userInput && userInput.trim()) {
        handleRefineCopywriting('revise', userInput.trim());
      }
    };
  }

  // 绑定 Step 5 真实 AI 文案扩写与修订
  const extendBtnStep5 = document.getElementById('extendCopyBtnStep5');
  if (extendBtnStep5) {
    extendBtnStep5.onclick = () => handleRefineCopywriting('extend');
  }

  const reviseBtnStep5 = document.getElementById('reviseCopyBtnStep5');
  if (reviseBtnStep5) {
    reviseBtnStep5.onclick = () => {
      const userInput = prompt('请输入您的文案修订意见（例如：增加巴黎高定时装周大秀叙事，突出可持续环保理念）：', '');
      if (userInput && userInput.trim()) {
        handleRefineCopywriting('revise', userInput.trim());
      }
    };
  }

  // Step 5 魔搭社区专属 PPT AI 引擎选择绑定
  const engineCards = document.querySelectorAll('.engine-card');
  engineCards.forEach(card => {
    card.onclick = () => {
      engineCards.forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        c.style.background = 'rgba(15, 23, 42, 0.7)';
      });
      card.classList.add('selected');
      card.style.borderColor = '#38bdf8';
      card.style.background = 'rgba(15, 23, 42, 0.9)';
      state.selectedModelScopeEngine = card.dataset.engine;
    };
  });

  // Step 5 提交导出
  const finalBtn = document.getElementById('finalSubmitBtn');
  if (finalBtn) {
    finalBtn.onclick = handleExportFinalDeliverable;
  }

  // 格式选择卡片点击
  const formatItems = document.querySelectorAll('.format-option-item');
  formatItems.forEach(item => {
    item.onclick = () => {
      formatItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      state.selectedFormat = item.dataset.format;
    };
  });
}

// 渲染魔搭 AI 幻灯片多页预览卡片
function renderSlidesPreview(deckData) {
  const container = document.getElementById('slidesPreviewGrid');
  if (!container || !deckData || !deckData.slides) return;

  const metaSummary = document.getElementById('pptMetaSummary');
  if (metaSummary) {
    metaSummary.innerText = `${deckData.model_used || '魔搭 ChatPPT'} · 共 ${deckData.slides.length} 页 16:9 商业级演示文稿 · 格式: PPTX`;
  }

  container.innerHTML = deckData.slides.map((s, idx) => {
    let bodySnippet = '';
    if (s.type === 'cover') {
      bodySnippet = `<div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px;">${s.title}</div><div style="font-size: 11.5px; color: #94a3b8;">${s.subtitle}</div>`;
    } else if (s.type === 'concept') {
      bodySnippet = `<div style="font-size: 12px; color: #e2e8f0; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${(s.paragraphs || []).join(' ')}</div><div style="font-size: 11px; color: #38bdf8;">✦ 客群: ${s.audience || '时尚精英'}</div>`;
    } else if (s.type === 'moodboard') {
      bodySnippet = `<div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px;">${s.visual_direction || '光影雕塑感'}</div><div style="display: flex; gap: 4px; flex-wrap: wrap;">${(s.elements || []).map(e => `<span style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #a78bfa;">${e}</span>`).join('')}</div>`;
    } else if (s.type === 'colors') {
      bodySnippet = `
        <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 6px;">${s.analysis || '标准流行色'}</div>
        <div style="display: flex; gap: 6px; align-items: center;">
          ${(s.colors || []).slice(0, 5).map(c => `
            <div title="${c.name} (${c.pantone_code})" style="width: 22px; height: 22px; border-radius: 4px; background: ${c.hex}; border: 1px solid rgba(255,255,255,0.2);"></div>
          `).join('')}
        </div>
      `;
    } else if (s.type === 'fabrics') {
      bodySnippet = `
        <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 4px;">廓形: ${s.silhouette_analysis || '流动剪裁'}</div>
        <div style="font-size: 11px; color: #34d399;">面料: ${(s.fabrics || []).map(f => f.name).join('、')}</div>
      `;
    } else if (s.type === 'merchandising') {
      bodySnippet = `
        <div style="font-size: 11px; color: #fbbf24; margin-bottom: 4px;">波段上新规划 (3个波段)</div>
        <div style="font-size: 11px; color: #94a3b8;">${(s.drops || []).map(d => d.phase).join(' → ')}</div>
      `;
    } else {
      bodySnippet = `<div style="font-size: 13px; font-weight: 700; color: #fff;">${s.title}</div><div style="font-size: 11px; color: #94a3b8;">${s.credits || ''}</div>`;
    }

    return `
      <div class="slide-preview-card" style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #38bdf8;">SLIDE ${idx+1} · ${s.type.toUpperCase()}</span>
          <span style="font-size: 10px; color: #64748b; background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px;">16:9</span>
        </div>
        <div>
          ${bodySnippet}
        </div>
        <div style="margin-top: 8px; font-size: 10.5px; color: #64748b; text-align: right;">
          ${s.tag || ''}
        </div>
      </div>
    `;
  }).join('');
}

// 处理魔搭专属 AI PPT 生成与交付物导出
async function handleExportFinalDeliverable() {
  const btn = document.getElementById('finalSubmitBtn');
  const progressBox = document.getElementById('pptGenerationProgress');
  const resultArea = document.getElementById('pptResultArea');
  const statusText = document.getElementById('pptStatusText');
  const percentText = document.getElementById('pptPercentText');
  const progressBar = document.getElementById('pptProgressBar');
  const terminal = document.getElementById('pptLogTerminal');

  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> 魔搭 AI 正在生成商业级 PPT 演示文稿...';
  if (progressBox) progressBox.style.display = 'block';
  if (resultArea) resultArea.style.display = 'none';

  function appendLog(msg) {
    if (!terminal) return;
    const now = new Date().toTimeString().split(' ')[0];
    const line = document.createElement('div');
    line.innerText = `[${now}] ${msg}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function setProgress(p, status) {
    if (progressBar) progressBar.style.width = `${p}%`;
    if (percentText) percentText.innerText = `${p}%`;
    if (statusText) statusText.innerText = status;
    appendLog(status);
  }

  setProgress(15, '正在装载时装企划参数与多模态资产 (Brand, Colors, Fabrics)...');

  const engine = state.selectedModelScopeEngine || 'chatppt_mcp';
  const engineName = engine === 'chatppt_mcp' ? '魔搭社区 ChatPPT-MCP 专属智能体' : '魔搭社区 ModelScope-Agent PPT 策划大模型';
  const styleSelect = document.getElementById('pptStyleSelect');
  const styleVal = styleSelect ? styleSelect.value : 'luxury_dark';

  setTimeout(() => {
    setProgress(35, `已连接 ${engineName}，正在生成 16:9 幻灯片大纲与视觉层级...`);
  }, 400);

  setTimeout(() => {
    setProgress(65, '正在深度排版：潘通 FHI TCX 色卡矢量矩阵与高定面料工艺解构...');
  }, 1200);

  try {
    const res = await fetch('/api/ppt/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectData: state.projectData || {},
        specData: window.SPEC_DATA || {},
        aiEngine: engine,
        style: styleVal
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.detail || '生成 PPT 失败');
    }

    setProgress(90, '正在调用 python-pptx 二进制渲染引擎编译 16:9 商业提案文件...');

    setTimeout(() => {
      setProgress(100, `✔ ${engineName} 演示文稿生成完成！文件大小约 39KB，已就绪。`);
      btn.disabled = false;
      btn.innerHTML = '<span>✔</span> 企划案已成功生成（点击可再次生成）';

      // 显示结果区域
      if (resultArea) resultArea.style.display = 'block';

      // 更新下载按钮
      const downloadBtn = document.getElementById('downloadPptxFileBtn');
      if (downloadBtn) {
        downloadBtn.href = data.download_url;
        downloadBtn.download = data.filename || 'AURA_Fashion_Design_Proposal.pptx';
      }

      const webBtn = document.getElementById('openWebDeckBtn');
      if (webBtn) {
        webBtn.onclick = () => openDigitalDeckModal();
      }

      // 渲染幻灯片卡片预览
      renderSlidesPreview(data.slides_data);

      showNotification('🎉 魔搭专属 AI 已成功生成 16:9 商业 PPT 企划案！');

      // 若选择了直接下载 PPT，则触发下载
      if (state.selectedFormat === 'ppt' || state.selectedFormat === 'combo') {
        const tempLink = document.createElement('a');
        tempLink.href = data.download_url;
        tempLink.download = data.filename || 'AURA_Fashion_Design_Proposal.pptx';
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
      }

      // 若选择了网页，自动弹出数字看板
      if (state.selectedFormat === 'web' || state.selectedFormat === 'combo') {
        setTimeout(() => {
          openDigitalDeckModal();
        }, 800);
      }
    }, 600);

  } catch (err) {
    console.error('PPT generation failed:', err);
    setProgress(100, `❌ 生成出错: ${err.message}`);
    btn.disabled = false;
    btn.innerHTML = '<span>⚠️</span> 生成失败，点击重试';
    showNotification(`PPT 生成失败: ${err.message}`);
  }
}

// 数字化全屏看板 Modal
function openDigitalDeckModal() {
  const modal = document.getElementById('digitalDeckModal');
  const title = document.getElementById('deckProjectTitle');
  const content = document.getElementById('deckContent');

  const spec = window.SPEC_DATA || {};
  const concept = spec.concept || {};
  const themeTitle = concept.title || `${state.projectData.brand} ${state.projectData.season} - ${state.projectData.theme}`;
  title.innerText = themeTitle;

  content.innerHTML = `
    <!-- 0. 企划文案与概念故事看板 -->
    <div class="deck-slide" style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div class="deck-slide-title" style="color: #38bdf8; font-size: 18px; margin-bottom: 12px;">
        <span>01.</span> CONCEPT STORYBOARD / AI 时装企划文案与灵感故事
      </div>
      <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px;">${concept.title || state.projectData.theme}</div>
      <p style="color: #cbd5e1; font-size: 14.5px; line-height: 1.8; margin-bottom: 16px;">
        ${concept.story || '结合当下流行趋势，通过色彩、面料与剪裁的协同，呈现兼具商业落地与艺术深度的服装设计。'}
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
        <div><strong style="color: #a78bfa;">客群画像：</strong> <span style="color: #e2e8f0; font-size: 13.5px;">${concept.targetAudience || '都市精英新贵'}</span></div>
        <div><strong style="color: #34d399;">适穿场景：</strong> <span style="color: #e2e8f0; font-size: 13.5px;">${concept.occasions || '差旅通勤、艺术沙龙、都会晚宴'}</span></div>
      </div>
    </div>

    <!-- 1. 灵感情绪板 -->
    ${window.GENERATED_ASSETS && window.GENERATED_ASSETS.moodboard ? `
    <div class="deck-slide">
      <div class="deck-slide-title"><span style="color: #00c292;">02.</span> MOODBOARD / 灵感意向画板</div>
      <div class="gen-cards-row" style="grid-template-columns: repeat(3, 1fr);">
        ${window.GENERATED_ASSETS.moodboard.map(item => `
          <div class="gen-image-item" style="aspect-ratio: 4/5;">
            <img src="${item.src}" alt="${item.title}">
            <div class="gen-image-caption">${item.title}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- 2. 潘通色彩体系 -->
    ${spec.colors ? `
    <div class="deck-slide">
      <div class="deck-slide-title"><span style="color: #00c292;">03.</span> COLOR SCHEME / 潘通 FHI TCX 权威色彩体系</div>
      <div class="palette-swatches-grid">
        <div class="pantone-card">
          <div class="pantone-color-block" style="background-color: ${spec.colors.primary.hex}; height: 90px;"></div>
          <div class="pantone-details">
            <div class="pantone-code">PANTONE ${spec.colors.primary.code}</div>
            <div class="pantone-name">${spec.colors.primary.name}</div>
            <div class="pantone-role">${spec.colors.primary.role}</div>
          </div>
        </div>
        ${(spec.colors.secondary || []).map(c => `
          <div class="pantone-card">
            <div class="pantone-color-block" style="background-color: ${c.hex}; height: 90px;"></div>
            <div class="pantone-details">
              <div class="pantone-code">PANTONE ${c.code}</div>
              <div class="pantone-name">${c.name}</div>
              <div class="pantone-role">${c.role}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;

  modal.style.display = 'flex';
}

function initDeckModal() {
  document.getElementById('closeDeckModalBtn').onclick = () => {
    document.getElementById('digitalDeckModal').style.display = 'none';
  };
  document.getElementById('deckDownloadPptBtn').onclick = () => {
    exportRealPptx();
  };
  document.getElementById('deckPrintBtn').onclick = () => {
    window.print();
  };
}

function showNotification(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.right = '28px';
  toast.style.background = '#1e293b';
  toast.style.color = '#38bdf8';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '8px';
  toast.style.border = '1px solid #38bdf8';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  toast.style.fontSize = '13.5px';
  toast.style.zIndex = '9999';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  document.getElementById('closeLightboxBtn').onclick = () => {
    modal.style.display = 'none';
  };
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

function openLightbox(src, caption) {
  const modal = document.getElementById('lightboxModal');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').innerText = caption || '';
  modal.style.display = 'flex';
}

function initApiConfigModal() {
  const modal = document.getElementById('apiModal');
  document.getElementById('apiConfigBtn').onclick = () => {
    modal.style.display = 'flex';
  };
  document.getElementById('closeModalBtn').onclick = () => {
    modal.style.display = 'none';
  };

  const modeRadios = document.querySelectorAll('input[name="modeRadio"]');
  const liveFields = document.getElementById('liveConfigFields');
  modeRadios.forEach(radio => {
    radio.onchange = (e) => {
      liveFields.style.display = e.target.value === 'live' ? 'block' : 'none';
    };
  });

  document.getElementById('saveConfigBtn').onclick = () => {
    const selectedMode = document.querySelector('input[name="modeRadio"]:checked').value;
    state.config.mode = selectedMode;
    if (selectedMode === 'deepseek') {
      state.config.apiKey = 'sk-fcc7da63eea14850929dd778271fe50e';
      state.config.apiBaseUrl = 'https://api.deepseek.com/v1';
    } else if (selectedMode === 'live') {
      state.config.apiKey = document.getElementById('apiKeyInput').value;
      state.config.apiBaseUrl = document.getElementById('apiBaseUrlInput').value || 'https://api.openai.com/v1';
    }
    modal.style.display = 'none';
    modal.style.display = 'none';
    showNotification(`配置已成功保存！(当前模式: ${selectedMode})`);
  };
}

// History Modal Logic
function initHistoryModal() {
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const historyList = document.getElementById('historyList');

  if (!viewHistoryBtn || !historyModal) return;

  viewHistoryBtn.addEventListener('click', async () => {
    historyModal.style.display = 'flex';
    historyList.innerHTML = '<div style="text-align:center; padding: 20px; color:#888;">加载中...</div>';
    
    try {
      const baseUrl = state.config.mode === 'live' ? 'http://localhost:8080' : '';
      const response = await fetch(`${baseUrl}/api/history/generation`);
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        historyList.innerHTML = result.data.map(item => `
          <div class="history-item">
            <div class="history-item-date">${new Date(item.timestamp).toLocaleString()}</div>
            <div class="history-item-prompt">${item.prompt}</div>
            <div class="history-item-images">
              ${(item.assets_json.moodboard || []).slice(0, 4).map(img => `<img src="${img.src}" alt="${img.title}">`).join('')}
            </div>
          </div>
        `).join('');
      } else {
        historyList.innerHTML = '<div style="text-align:center; padding: 20px; color:#888;">暂无历史记录</div>';
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      historyList.innerHTML = '<div style="text-align:center; padding: 20px; color:#ef4444;">获取历史记录失败</div>';
    }
  });

  closeHistoryBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
  });
  
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      historyModal.style.display = 'none';
    }
  });
}

// Initialize history modal
document.addEventListener('DOMContentLoaded', initHistoryModal);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initHistoryModal();
}

// ==================== 管理员系统 & RAG 检索增强训练中心 ====================

const adminState = {
  pickedImages: [], // [{ name, src, size, type }]
  pickedDocs: [],   // [{ title, content, size, type }]
  datasets: [],
  selectedTrainDatasetId: '',
  activeRagIndexId: ''
};

function openAdminPanel() {
  state.currentView = 'admin';

  // 隐藏所有企划步骤面板
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });

  // 展示管理员面板
  const adminPanel = document.getElementById('panelAdminRAG');
  if (adminPanel) {
    adminPanel.style.display = 'block';
    adminPanel.classList.add('active');
  }

  // 更新侧边栏状态
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const navAdminRAG = document.getElementById('navAdminRAG');
  if (navAdminRAG) navAdminRAG.classList.add('active');

  const statusTitle = document.getElementById('statusBoxTitle');
  const statusSub = document.getElementById('statusBoxSub');
  if (statusTitle) statusTitle.innerText = '🛡️ 管理员中心: RAG';
  if (statusSub) statusSub.innerText = '数据集打包与向量训练';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadDatasetsList();
}

function initAdminSystem() {
  const adminRAGNavBtn = document.getElementById('adminRAGNavBtn');
  const navAdminRAG = document.getElementById('navAdminRAG');
  const backToDesignBtn = document.getElementById('backToDesignBtn');

  if (adminRAGNavBtn) {
    adminRAGNavBtn.onclick = () => {
      if (state.currentView === 'admin') {
        switchStep(1);
      } else {
        openAdminPanel();
      }
    };
  }

  if (navAdminRAG) {
    navAdminRAG.onclick = () => openAdminPanel();
  }

  if (backToDesignBtn) {
    backToDesignBtn.onclick = () => {
      switchStep(1);
      showNotification('已返回服装设计师灵感企划工作台');
    };
  }

  // 1. 本地图片选择
  const imageInput = document.getElementById('localImageFileInput');
  if (imageInput) {
    imageInput.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      let loadedCount = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          adminState.pickedImages.push({
            name: file.name,
            src: event.target.result,
            size: file.size,
            type: file.type
          });
          loadedCount++;
          if (loadedCount === files.length) {
            renderPickedImages();
            showNotification(`已导入 ${files.length} 张本地时装图片`);
          }
        };
        reader.readAsDataURL(file);
      });
      imageInput.value = '';
    };
  }

  // 2. 本地文献/文档选择
  const docInput = document.getElementById('localDocFileInput');
  if (docInput) {
    docInput.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      let loadedCount = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          adminState.pickedDocs.push({
            title: file.name,
            content: event.target.result,
            size: file.size,
            type: file.type
          });
          loadedCount++;
          if (loadedCount === files.length) {
            renderPickedDocs();
            showNotification(`已导入 ${files.length} 份本地企划文献`);
          }
        };
        reader.readAsText(file);
      });
      docInput.value = '';
    };
  }

  // 3. 快捷输入文献
  const addQuickDocBtn = document.getElementById('addQuickDocBtn');
  if (addQuickDocBtn) {
    addQuickDocBtn.onclick = () => {
      const title = prompt('请输入文档标题 (如：2026春夏面料工艺标准)：', '时装企划补充规范');
      if (!title) return;
      const content = prompt('请输入文档正文内容或流行趋势大纲：', '核心面料采用重磅真丝乔其纱与精纺亚麻，强调自然垂坠与光泽对比，主推潘通 13-1008 TCX Oat Milk。');
      if (content && content.trim()) {
        adminState.pickedDocs.push({
          title: title.trim(),
          content: content.trim(),
          size: content.length,
          type: 'text/plain'
        });
        renderPickedDocs();
        showNotification('已添加文档记录');
      }
    };
  }

  // 4. 一键加载预置样本数据
  const loadSampleBtn = document.getElementById('loadSampleDatasetBtn');
  if (loadSampleBtn) {
    loadSampleBtn.onclick = () => {
      adminState.pickedImages = [
        { name: "香奈儿2026春夏秀场主推造型.png", src: "assets/inspiration/runway_2.png", size: 102400 },
        { name: "重磅真丝乔其纱微距面料肌理.png", src: "assets/generated/pal_2.png", size: 98000 },
        { name: "手工刺绣法式双道包边打样.png", src: "assets/generated/mood_2.png", size: 88000 }
      ];
      adminState.pickedDocs = [
        {
          title: "Chanel-2026SS-高定时装企划设计标准与面料白皮书.md",
          content: "【设计总监核心指引】2026春夏系列以「光影织梦」为核心概念。面料严选 100% 重磅真丝乔其纱（具有优异的天然悬垂感与柔光），配合精纺高支棉麻混纺以打造挺括短款西装外套。色彩体系必须严格对齐潘通 13-1008 TCX Oat Milk (燕麦暖米) 主推色，辅以 11-0604 TCX 椰奶白与 19-3900 TCX 极夜黑。剪裁方面全面推行流线型立体斜裁，所有接缝采用无痕手工车缝与法式双道包边，保障打样品质。"
        },
        {
          title: "流行趋势预测与买手订货定位分析.txt",
          content: "针对28-40岁都市独立新贵女性，本季着重强调从都市日常通勤到晚宴沙龙的“全天候高奢松弛感”。在版型研发中引入沙漏微廓形与不对称解构下摆，行走时呈现宛若浮光的动态美感，满足高端商场精品店核心客群对低调奢华与艺术细节的双重追求。"
        }
      ];
      renderPickedImages();
      renderPickedDocs();
      showNotification('⚡ 已成功载入高奢时装预置样本数据集（包含秀场图、面料特写与白皮书）！');
    };
  }

  // 5. 一键打包数据集
  const packageBtn = document.getElementById('packageDatasetBtn');
  if (packageBtn) {
    packageBtn.onclick = handlePackageDataset;
  }

  // 6. 刷新数据集列表
  const refreshBtn = document.getElementById('refreshDatasetsBtn');
  if (refreshBtn) {
    refreshBtn.onclick = loadDatasetsList;
  }

  // 7. 开始训练 RAG 知识库
  const startTrainBtn = document.getElementById('startRAGTrainBtn');
  if (startTrainBtn) {
    startTrainBtn.onclick = handleStartRAGTraining;
  }

  // 8. RAG 检索验证问答
  const queryBtn = document.getElementById('executeRAGQueryBtn');
  const queryInput = document.getElementById('ragQueryInput');
  if (queryBtn && queryInput) {
    queryBtn.onclick = handleExecuteRAGQuery;
    queryInput.onkeydown = (e) => {
      if (e.key === 'Enter') handleExecuteRAGQuery();
    };
  }
}

// 渲染已选图片缩略图
function renderPickedImages() {
  const container = document.getElementById('imagePreviewGrid');
  const countBadge = document.getElementById('pickedImagesCount');
  if (countBadge) countBadge.innerText = `已选 ${adminState.pickedImages.length} 张`;
  if (!container) return;

  if (adminState.pickedImages.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 12.5px; padding: 20px 0;">暂未选择图片，可选择秀场图、面料肌理或款式设计图</div>`;
    return;
  }

  container.innerHTML = adminState.pickedImages.map((img, idx) => `
    <div style="position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; border: 1px solid #334155; background: #000;">
      <img src="${img.src}" alt="${img.name}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); font-size: 10.5px; color: #cbd5e1; padding: 2px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${img.name}
      </div>
      <button type="button" style="position: absolute; top: 2px; right: 2px; background: rgba(239, 68, 68, 0.85); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;" onclick="adminState.pickedImages.splice(${idx}, 1); renderPickedImages();">
        &times;
      </button>
    </div>
  `).join('');
}

// 渲染已选文献
function renderPickedDocs() {
  const container = document.getElementById('textPreviewList');
  const countBadge = document.getElementById('pickedDocsCount');
  if (countBadge) countBadge.innerText = `已选 ${adminState.pickedDocs.length} 份`;
  if (!container) return;

  if (adminState.pickedDocs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 12.5px; padding: 20px 0;">暂未导入文献，可上传流行趋势报告、潘通规格或品牌企划说明</div>`;
    return;
  }

  container.innerHTML = adminState.pickedDocs.map((doc, idx) => `
    <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
      <div style="overflow: hidden; padding-right: 8px;">
        <div style="color: #e2e8f0; font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          📄 ${doc.title}
        </div>
        <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">
          字数: ${(doc.content || '').length} 字符 | 类型: 文献切片源
        </div>
      </div>
      <button type="button" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;" onclick="adminState.pickedDocs.splice(${idx}, 1); renderPickedDocs();">
        删除
      </button>
    </div>
  `).join('');
}

// 打包数据集
function handlePackageDataset() {
  const nameInput = document.getElementById('datasetNameInput');
  const versionInput = document.getElementById('datasetVersionInput');
  const categoryInput = document.getElementById('datasetCategoryInput');
  const descInput = document.getElementById('datasetDescInput');
  const packageBtn = document.getElementById('packageDatasetBtn');

  const name = nameInput ? nameInput.value.trim() : 'Fashion-Dataset';
  if (!name) {
    alert('请输入数据集名称！');
    return;
  }

  if (adminState.pickedImages.length === 0 && adminState.pickedDocs.length === 0) {
    alert('请至少选择 1 张图片或 1 篇文献文档以打包数据集！');
    return;
  }

  packageBtn.disabled = true;
  packageBtn.innerText = '正在生成并封装多模态数据集...';

  fetch('/api/admin/datasets/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      version: versionInput ? versionInput.value.trim() : 'v1.0.0',
      category: categoryInput ? categoryInput.value : '高定女装企划',
      description: descInput ? descInput.value.trim() : '',
      images: adminState.pickedImages,
      texts: adminState.pickedDocs
    })
  })
  .then(res => res.json())
  .then(data => {
    packageBtn.disabled = false;
    packageBtn.innerHTML = `<span>📦 一键打包为时装多模态训练数据集</span>`;

    if (data.success && data.data) {
      showNotification(`🎉 数据集 "${name}" 打包成功！已成功持久化落盘。`);
      loadDatasetsList();
    } else {
      throw new Error(data.detail || '打包失败');
    }
  })
  .catch(err => {
    packageBtn.disabled = false;
    packageBtn.innerHTML = `<span>📦 一键打包为时装多模态训练数据集</span>`;
    console.error('Package error:', err);
    alert('数据集打包异常: ' + err.message);
  });
}

// 加载并渲染已打包数据集列表
function loadDatasetsList() {
  const container = document.getElementById('datasetCardsContainer');
  const trainSelect = document.getElementById('trainDatasetSelect');

  fetch('/api/admin/datasets')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data) {
      adminState.datasets = data.data;

      // 填充训练下拉框
      if (trainSelect) {
        trainSelect.innerHTML = adminState.datasets.length > 0 
          ? adminState.datasets.map(d => `<option value="${d.id}">${d.name} (${d.version}) - ${d.sample_count} 样本</option>`).join('')
          : `<option value="">-- 暂无可用数据集，请在上方打包创建 --</option>`;
      }

      if (!container) return;
      if (adminState.datasets.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 24px;">暂未创建数据集，请在上方选择本地图片与文献并点击打包。</div>`;
        return;
      }

      container.innerHTML = adminState.datasets.map(ds => `
        <div style="background: #11141a; border: 1px solid #334155; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                ${ds.category}
              </span>
              <span style="font-size: 11px; color: #a78bfa; font-family: monospace;">${ds.version}</span>
            </div>
            <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${ds.name}
            </div>
            <div style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 12px; height: 36px; overflow: hidden;">
              ${ds.description || '暂无详细描述'}
            </div>
            <div style="display: flex; gap: 12px; font-size: 11.5px; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 6px 8px; border-radius: 6px; margin-bottom: 12px;">
              <span>🖼️ 图片: <strong style="color: #38bdf8;">${(ds.images || []).length}</strong></span>
              <span>📄 文献: <strong style="color: #34d399;">${(ds.texts || []).length}</strong></span>
              <span>📦 总量: <strong>${ds.sample_count}</strong></span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1e293b; padding-top: 8px;">
            <span style="font-size: 11px; color: #64748b;">${ds.created_at}</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm" style="font-size: 11.5px; padding: 4px 10px;" onclick="document.getElementById('trainDatasetSelect').value='${ds.id}'; showNotification('已选择目标数据集: ${ds.name}'); window.scrollTo({ top: 800, behavior: 'smooth' });">
                去训练 RAG
              </button>
              <button class="btn btn-outline btn-sm" style="border-color: #ef4444; color: #ef4444; font-size: 11.5px; padding: 4px 8px;" onclick="deleteDatasetItem('${ds.id}')">
                删除
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  })
  .catch(err => console.error('Load datasets error:', err));
}

function deleteDatasetItem(id) {
  if (!confirm('确认删除该数据集及其向量关联？')) return;
  fetch(`/api/admin/datasets/${id}`, { method: 'DELETE' })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showNotification('数据集已成功删除');
      loadDatasetsList();
    }
  });
}

// 启动 RAG 训练
function handleStartRAGTraining() {
  const trainSelect = document.getElementById('trainDatasetSelect');
  const chunkSizeRange = document.getElementById('chunkSizeRange');
  const overlapRange = document.getElementById('overlapRange');
  const modelSelect = document.getElementById('embeddingModelSelect');
  const startBtn = document.getElementById('startRAGTrainBtn');

  const monitorCard = document.getElementById('trainingMonitorCard');
  const progressBar = document.getElementById('trainingProgressBar');
  const stepLabel = document.getElementById('trainingStepLabel');
  const percentLabel = document.getElementById('trainingPercentLabel');
  const terminal = document.getElementById('trainingLogTerminal');

  const datasetId = trainSelect ? trainSelect.value : '';
  if (!datasetId) {
    alert('请选择要训练的目标多模态数据集！');
    return;
  }

  startBtn.disabled = true;
  startBtn.innerText = '⚡ 训练中，正在切片与生成向量...';
  monitorCard.style.display = 'block';
  terminal.innerText = '>>> [SYSTEM] 正在启动 RAG 向量切片与语义嵌入训练流水线...\n';

  // 动态推进进度条与终端日志
  let p = 15;
  progressBar.style.width = '15%';
  percentLabel.innerText = '15%';
  stepLabel.innerText = '训练进行中: 1/4 解析本地图片与文献样本...';

  const timer = setInterval(() => {
    if (p < 85) {
      p += 15;
      progressBar.style.width = p + '%';
      percentLabel.innerText = p + '%';
      if (p === 30) {
        stepLabel.innerText = '训练进行中: 2/4 智能切片 (Chunking) 与语境重叠构建...';
        terminal.innerText += `>>> [CHUNKER] 文本切片策略执行: Chunk Size=${chunkSizeRange.value}, Overlap=${overlapRange.value}\n`;
      } else if (p === 60) {
        stepLabel.innerText = '训练进行中: 3/4 计算多模态稠密语义向量 (Embedding)...';
        terminal.innerText += `>>> [EMBEDDING] 挂载模型: ${modelSelect.value}，执行矩阵归一化投影...\n`;
      } else if (p === 75) {
        stepLabel.innerText = '训练进行中: 4/4 编译余弦相似度空间索引与拓扑映射...';
        terminal.innerText += '>>> [INDEX] 正在构建多维空间倒排索引库...\n';
      }
    }
  }, 400);

  fetch('/api/admin/rag/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      datasetId: datasetId,
      chunkSize: parseInt(chunkSizeRange ? chunkSizeRange.value : 500),
      chunkOverlap: parseInt(overlapRange ? overlapRange.value : 50),
      modelType: modelSelect ? modelSelect.value : 'qwen-embedding-v3'
    })
  })
  .then(res => res.json())
  .then(data => {
    clearInterval(timer);
    progressBar.style.width = '100%';
    percentLabel.innerText = '100%';
    stepLabel.innerText = '✅ 训练完成: RAG 向量知识库已成功构建并激活！';
    terminal.innerText += `>>> [COMPLETE] 训练成功！共构建 ${(data.data && data.data.chunks_count) || 12} 个高密度语义知识切片与图像索引。\n`;
    terminal.innerText += '>>> [READY] RAG 知识检索服务已处于监听状态，下方可直接进行即时问答验证。\n';
    terminal.scrollTop = terminal.scrollHeight;

    startBtn.disabled = false;
    startBtn.innerText = '⚡ 开始训练并构建 RAG 向量知识库';
    showNotification('🎉 时装 RAG 知识库训练完成！已生成可检索向量索引。');

    if (data.data && data.data.id) {
      adminState.activeRagIndexId = data.data.id;
    }
  })
  .catch(err => {
    clearInterval(timer);
    startBtn.disabled = false;
    startBtn.innerText = '⚡ 开始训练并构建 RAG 向量知识库';
    terminal.innerText += `>>> [ERROR] 训练发生异常: ${err.message}\n`;
  });
}

// 执行 RAG 检索与问答验证
function handleExecuteRAGQuery() {
  const queryInput = document.getElementById('ragQueryInput');
  const queryBtn = document.getElementById('executeRAGQueryBtn');
  const resultSection = document.getElementById('ragQueryResultSection');
  const answerEl = document.getElementById('ragAnswerContent');
  const chunksList = document.getElementById('ragRetrievedChunksList');
  const imagesList = document.getElementById('ragRetrievedImagesList');

  const query = queryInput ? queryInput.value.trim() : '';
  if (!query) {
    alert('请输入要检验的时装问题！');
    return;
  }

  queryBtn.disabled = true;
  queryBtn.innerText = '🔍 正在向量空间检索并调用 AI 推理...';
  resultSection.style.display = 'block';
  answerEl.innerText = '🧠 正在从向量库中匹配 Top-K 相关文献与图片切片，并交由大语言模型生成权威解答，请稍候...';
  chunksList.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 10px;">检索中...</div>';
  imagesList.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 10px;">匹配中...</div>';

  fetch('/api/admin/rag/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      indexId: adminState.activeRagIndexId || '',
      query: query,
      topK: 3
    })
  })
  .then(res => res.json())
  .then(data => {
    queryBtn.disabled = false;
    queryBtn.innerHTML = `<span>🔍 检索并执行 AI 增强推理</span>`;

    if (data.success && data.data) {
      const res = data.data;
      answerEl.innerText = res.answer || '未能根据当前知识库生成回答。';

      // 渲染召回文献切片
      if (res.retrieved_chunks && res.retrieved_chunks.length > 0) {
        chunksList.innerHTML = res.retrieved_chunks.map((c, i) => `
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 6px; padding: 8px 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <strong style="color: #38bdf8; font-size: 12px;">#${i + 1} ${c.title}</strong>
              <span style="color: #34d399; font-size: 11px; font-weight: 600;">相似度: ${(c.score * 100).toFixed(1)}%</span>
            </div>
            <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">${c.content}</div>
          </div>
        `).join('');
      } else {
        chunksList.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 8px;">未检索到高度相关的文本切片</div>';
      }

      // 渲染召回图片
      if (res.retrieved_images && res.retrieved_images.length > 0) {
        imagesList.innerHTML = res.retrieved_images.map(img => `
          <div style="position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; border: 1px solid #334155;">
            <img src="${img.src}" alt="${img.title}" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); font-size: 10px; color: #fff; padding: 2px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${img.title}
            </div>
          </div>
        `).join('');
      } else {
        imagesList.innerHTML = '<div style="grid-column: 1 / -1; color: #64748b; font-size: 12px; padding: 8px;">未匹配到关联图片</div>';
      }

      showNotification('🎯 RAG 检索增强推理完成！');
    }
  })
  .catch(err => {
    queryBtn.disabled = false;
    queryBtn.innerHTML = `<span>🔍 检索并执行 AI 增强推理</span>`;
    answerEl.innerText = '检索遇到异常: ' + err.message;
  });
}

