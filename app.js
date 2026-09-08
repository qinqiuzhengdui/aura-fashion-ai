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
    { src: 'assets/generated/color_1.png', title: '流行色比例与潘通搭配色谱' },
    { src: 'assets/generated/color_2.png', title: '高级真丝面料悬垂光泽' },
    { src: 'assets/generated/color_3.png', title: '潘通标准色织样对比卡' }
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
      const selectedRoleText = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text.split('/')[0].trim() : '服装设计师';
      
      if (userRoleText) userRoleText.innerText = selectedRoleText;

      const submitBtn = document.getElementById('loginSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.innerText = '验证中，即将进入工作站...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>进入 AURA 企划工作站</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        
        if (loginOverlay) {
          loginOverlay.classList.add('hidden');
        }
        showNotification(`✨ 欢迎登录 AURA 企划工作站！[${selectedRoleText}] 身份已就绪。`);
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

  // 校验是否已解锁
  if (!state.unlockedSteps.includes(targetStep)) {
    const navText = document.querySelector(`#navStep${targetStep} .nav-text`)?.innerText || `步骤 ${targetStep}`;
    showNotification(`👉 请先完成前置步骤以解锁【${navText}】页面`);
    return;
  }

  state.currentStep = targetStep;

  // 1. 隐藏所有 Step Panel，仅展示当前 Panel
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
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

  const loadingHtml = '<div style="color:white; padding: 20px; font-size: 14px;">🪄 正在调用 DALL-E 3 生成多维度企划资产，请稍候...</div>';
  if (moodRow) moodRow.innerHTML = loadingHtml;
  if (palRow) palRow.innerHTML = loadingHtml;
  if (silRow) silRow.innerHTML = loadingHtml;

  fetch('/api/generate_images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, selectedImages: [] })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data) {
      const assets = data.data;
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
      // Update global for PPT generation
      window.GENERATED_ASSETS = assets;
    }
  })
  .catch(err => {
     console.error(err);
     if (moodRow) moodRow.innerHTML = '<div style="color:#ff6b6b; padding: 20px;">图片生成失败，请检查服务。</div>';
  });
}

// 渲染 Step 4: 企划文案与潘通特征解析
function renderStep4Analysis() {
  const content = document.getElementById('featureAnalysisContent');
  if (!content) return;
  const promptText = document.getElementById('sentenceBuilder') ? document.getElementById('sentenceBuilder').innerText.trim() : state.projectData.theme;

  content.innerHTML = '<div style="color:white; padding: 20px; font-size: 14px;">🧠 正在调用 GPT-4o 视觉模型分析企划意图与图片特征，请稍候...</div>';

  fetch('/api/analyze_features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, selectedImages: [] })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data) {
      const SPEC_DATA = data.data;
      window.SPEC_DATA = SPEC_DATA; // Save for PPT
      
      content.innerHTML = `
        <!-- 1. 颜色特征 -->
        <div class="feature-group">
          <div class="group-title">颜色特征 (Color Characteristics & Pantone Alignment)</div>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #38bdf8;">• 主题色:</strong> 
            <span style="color: #fff; font-weight: 600;">${SPEC_DATA.colors.primary.name}</span>
            <span class="badge-tag-secondary" style="margin-left: 8px; font-size: 11px;">Pantone ${SPEC_DATA.colors.primary.code}</span>
            <p class="analysis-rich-text" style="margin-left: 12px;">
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

            ${SPEC_DATA.colors.secondary.map(c => `
              <div class="pantone-card" title="点击复制 HEX 值" onclick="navigator.clipboard.writeText('${c.hex}'); alert('已复制潘通色彩 HEX: ${c.hex}')">
                <div class="pantone-color-block" style="background-color: ${c.hex};"></div>
                <div class="pantone-details">
                  <div class="pantone-code">PANTONE ${c.code}</div>
                  <div class="pantone-name">${c.name.split(' ')[0]}</div>
                  <div class="pantone-role">${c.role}</div>
                </div>
              </div>
            `).join('')}

            ${SPEC_DATA.colors.base.map(c => `
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
            ${SPEC_DATA.fabrics.map(f => `
              <div style="margin-bottom: 10px;">
                <strong style="color: #34d399;">• ${f.name}：</strong>${f.desc}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. 服装设计特征 -->
        <div class="feature-group" style="margin-top: 24px;">
          <div class="group-title">服装设计与剪裁特征 (Design Silhouette & Details)</div>
          <div class="analysis-rich-text">
            ${SPEC_DATA.designCraft.map(d => `
              <div style="margin-bottom: 10px;">
                <strong style="color: #60a5fa;">• ${d.title}：</strong>${d.desc}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  })
  .catch(err => {
     console.error(err);
     content.innerHTML = '<div style="color:#ff6b6b; padding: 20px;">AI 分析失败，请检查服务。</div>';
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

// 处理最终交付物导出
function handleExportFinalDeliverable() {
  const btn = document.getElementById('finalSubmitBtn');
  btn.disabled = true;
  btn.innerText = '正在合成高清企划案交付物...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerText = '✔ 企划案已成功就绪（点击可再次导出）';

    if (state.selectedFormat === 'ppt' || state.selectedFormat === 'combo') {
      exportRealPptx();
    }

    if (state.selectedFormat === 'web' || state.selectedFormat === 'combo') {
      openDigitalDeckModal();
    }
  }, 1000);
}

// PptxGenJS 导出 16:9 PPTX
function exportRealPptx() {
  try {
    if (typeof PptxGenJS === 'undefined') {
      alert('PptxGenJS 尚未完成加载，请检查网络连接或稍后重试。');
      return;
    }

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'AURA Fashion AI Studio';
    pptx.title = `${state.projectData.brand} ${state.projectData.season} 设计企划案`;

    // 幻灯片 1: 封面
    const s1 = pptx.addSlide();
    s1.background = { color: '12151A' };
    s1.addText(pptx.title, {
      x: 1.0, y: 2.2, w: 11.3, h: 1.5,
      fontSize: 38, color: 'FFFFFF', bold: true, align: 'left'
    });
    s1.addText(`设计主题：${state.projectData.theme}\n品类规划：${state.projectData.categories.join(' / ')} | ${state.projectData.gender}`, {
      x: 1.0, y: 3.8, w: 11.3, h: 1.0,
      fontSize: 18, color: '00C292', align: 'left'
    });

    // 幻灯片 2: 潘通色彩体系
    const s2 = pptx.addSlide();
    s2.background = { color: '12151A' };
    s2.addText('COLOR PALETTE / 流行色体系与潘通标准色卡', {
      x: 0.8, y: 0.6, w: 10.0, h: 0.8,
      fontSize: 22, color: 'FFFFFF', bold: true
    });

    const allColors = [SPEC_DATA.colors.primary, ...SPEC_DATA.colors.secondary, ...SPEC_DATA.colors.base.slice(0, 2)];
    allColors.forEach((c, idx) => {
      const left = 0.8 + idx * 2.35;
      const cleanHex = c.hex.replace('#', '');
      s2.addShape(pptx.ShapeType.rect, {
        x: left, y: 1.8, w: 2.1, h: 2.5,
        fill: { color: cleanHex }, line: { color: '2A303C', width: 1 }
      });
      s2.addText(`PANTONE\n${c.code}\n${c.name.split(' ')[0]}`, {
        x: left, y: 4.4, w: 2.1, h: 1.2,
        fontSize: 11, color: 'E5E7EB', bold: true, align: 'left'
      });
    });

    const fileName = `${state.projectData.brand}_${state.projectData.season}_设计企划提案.pptx`;
    pptx.writeFile({ fileName: fileName }).then(() => {
      showNotification(`🎉 商业级 PPTX 文件 "${fileName}" 已成功导出并下载！`);
    });
  } catch (err) {
    console.error('PPTX generation error:', err);
    alert('PPTX 导出发生异常：' + err.message);
  }
}

// 数字化全屏看板 Modal
function openDigitalDeckModal() {
  const modal = document.getElementById('digitalDeckModal');
  const title = document.getElementById('deckProjectTitle');
  const content = document.getElementById('deckContent');

  title.innerText = `${state.projectData.brand} ${state.projectData.season} - ${state.projectData.theme}`;

  content.innerHTML = `
    <div class="deck-slide">
      <div class="deck-slide-title"><span style="color: #00c292;">01.</span> MOODBOARD / 灵感意向画板</div>
      <div class="gen-cards-row" style="grid-template-columns: repeat(4, 1fr);">
        ${GENERATED_ASSETS.moodboard.map(item => `
          <div class="gen-image-item" style="aspect-ratio: 4/5;">
            <img src="${item.src}" alt="${item.title}">
            <div class="gen-image-caption">${item.title}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="deck-slide">
      <div class="deck-slide-title"><span style="color: #00c292;">02.</span> COLOR SCHEME / 潘通 FHI TCX 权威色彩体系</div>
      <div class="palette-swatches-grid">
        <div class="pantone-card">
          <div class="pantone-color-block" style="background-color: ${SPEC_DATA.colors.primary.hex}; height: 90px;"></div>
          <div class="pantone-details">
            <div class="pantone-code">PANTONE ${SPEC_DATA.colors.primary.code}</div>
            <div class="pantone-name">${SPEC_DATA.colors.primary.name}</div>
            <div class="pantone-role">${SPEC_DATA.colors.primary.role}</div>
          </div>
        </div>
        ${SPEC_DATA.colors.secondary.map(c => `
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
    showNotification(`配置已成功保存！(当前模式: ${selectedMode})`);
  };
}
