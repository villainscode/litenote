class Editor {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      initialContent: options.initialContent || '',
      onChange: options.onChange || (() => {}),
    };

    this.plugins = [];
    this.init();
  }

  init() {
    // 에디터 영역 생성
    this.editor = document.createElement('div');
    this.editor.contentEditable = true;
    this.editor.className = 'w-full h-full bg-[#1e1e1e] text-white rounded-lg p-6 overflow-y-auto focus:outline-none focus:border-blue-500 border border-gray-700';
    this.editor.innerHTML = this.options.initialContent;

    // 플로팅 메뉴 생성
    this.floatingMenu = document.createElement('div');
    this.floatingMenu.className = 'absolute bg-gray-800 text-white rounded shadow-lg hidden flex flex-col items-center';
    this.floatingMenu.style.cssText = 'z-index: 1000; pointer-events: auto; left: 50%; transform: translateX(-50%); top: 20px;';

    // 선택 영역 정보를 표시할 div 생성
    this.selectionInfo = document.createElement('div');
    this.selectionInfo.className = 'text-xs text-gray-400 px-2 py-1 border-b border-gray-700 w-full text-center';
    this.floatingMenu.appendChild(this.selectionInfo);

    // 버튼을 담을 컨테이너 생성
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.className = 'flex items-center p-1';
    this.floatingMenu.appendChild(this.buttonContainer);

    // 컨테이너를 relative로 설정
    this.container.style.position = 'relative';

    // DOM에 추가
    this.container.appendChild(this.editor);
    this.container.appendChild(this.floatingMenu);

    // Bold 버튼 추가
    this.addPlugin('bold', 'format_bold', () => this.toggleBold());

    // 이벤트 리스너 등록
    this.attachEventListeners();
  }

  addPlugin(name, icon, action) {
    const button = document.createElement('button');
    button.className = 'w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded transition-colors';
    button.title = name;
    button.innerHTML = `<span class="material-symbols-outlined text-sm">${icon}</span>`;
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      action();
    });
    this.buttonContainer.appendChild(button);
    this.plugins.push({ name, icon, action, button });
  }

  toggleBold() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) return;

    // 현재 선택 영역 저장
    const savedRange = range.cloneRange();
    
    // 선택된 텍스트가 이미 Bold인지 확인
    let isBold = false;
    let currentNode = range.commonAncestorContainer;
    
    if (currentNode.nodeType === 3) { // 텍스트 노드인 경우
      currentNode = currentNode.parentElement;
    }

    // Bold 태그를 찾을 때까지 부모 노드를 탐색
    while (currentNode && currentNode !== this.editor) {
      if (currentNode.tagName === 'STRONG' || currentNode.tagName === 'B') {
        isBold = true;
        break;
      }
      currentNode = currentNode.parentElement;
    }

    if (isBold) {
      // Bold 태그 제거
      const content = currentNode.textContent;
      const textNode = document.createTextNode(content);
      currentNode.parentNode.replaceChild(textNode, currentNode);
      
      // 선택 영역 복원
      const newRange = document.createRange();
      newRange.setStart(textNode, savedRange.startOffset);
      newRange.setEnd(textNode, savedRange.endOffset);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Bold 태그 추가
      const boldElement = document.createElement('strong');
      range.surroundContents(boldElement);
    }

    // 플로팅 메뉴 위치 업데이트
    this.updateFloatingMenuPosition();
  }

  attachEventListeners() {
    // 선택 변경 이벤트 리스너
    this.handleSelectionChangeBound = this.handleSelectionChange.bind(this);
    document.addEventListener('selectionchange', this.handleSelectionChangeBound);
    
    // 마우스와 키보드 이벤트
    this.editor.addEventListener('mouseup', () => this.handleSelectionChange());
    this.editor.addEventListener('keyup', (e) => {
      // 화살표 키, Shift+화살표 키 등 선택과 관련된 키 입력 감지
      const selectionKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (selectionKeys.includes(e.key) || e.shiftKey) {
        this.handleSelectionChange();
      }
    });

    // 외부 클릭 감지
    document.addEventListener('mousedown', (e) => {
      if (!this.floatingMenu.contains(e.target) && !this.editor.contains(e.target)) {
        this.hideFloatingMenu();
      }
    });
  }

  getSelectionIndices() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) return null;

    // 전체 텍스트 내용 가져오기
    const fullText = this.editor.textContent;
    
    // 선택 영역의 시작점까지의 텍스트를 생성
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(this.editor);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preSelectionRange.toString().length;
    const length = range.toString().length;
    
    return {
      start,
      end: start + length
    };
  }

  handleSelectionChange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      this.hideFloatingMenu();
      return;
    }

    const range = selection.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) {
      this.hideFloatingMenu();
      return;
    }

    // 선택된 텍스트가 있을 경우 플로팅 메뉴 표시
    if (range.toString().trim().length > 0) {
      const indices = this.getSelectionIndices();
      if (indices) {
        this.selectionInfo.textContent = `선택 영역: ${indices.start} ~ ${indices.end}`;
      }
      this.updateFloatingMenuPosition();
      this.showFloatingMenu();
    } else {
      this.hideFloatingMenu();
    }
  }

  updateFloatingMenuPosition() {
    // editor-container의 위치 정보 가져오기
    const containerRect = this.container.getBoundingClientRect();
    
    // 플로팅 메뉴를 editor-container의 최상단 중앙에 위치시킴
    this.floatingMenu.style.position = 'absolute';
    this.floatingMenu.style.top = '20px';  // 툴바가 컨테이너 상단에서 20px 아래에 위치하도록
    this.floatingMenu.style.left = '50%';
    this.floatingMenu.style.transform = 'translateX(-50%)';
  }

  showFloatingMenu() {
    this.floatingMenu.classList.remove('hidden');
  }

  hideFloatingMenu() {
    this.floatingMenu.classList.add('hidden');
  }

  handleContentChange() {
    this.options.onChange(this.editor.innerHTML);
  }

  getContent() {
    return this.editor.innerHTML;
  }

  setContent(content) {
    this.editor.innerHTML = content;
    this.handleContentChange();
  }

  destroy() {
    document.removeEventListener('selectionchange', this.handleSelectionChangeBound);
    window.removeEventListener('scroll', () => this.updateFloatingMenuPosition());
    window.removeEventListener('resize', () => this.updateFloatingMenuPosition());
    
    if (this.editor.parentNode) {
      this.editor.parentNode.removeChild(this.editor);
    }
    if (this.floatingMenu.parentNode) {
      this.floatingMenu.parentNode.removeChild(this.floatingMenu);
    }
  }
}

// 전역으로 내보내기
window.Editor = Editor;