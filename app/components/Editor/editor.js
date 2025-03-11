class Editor {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      initialContent: options.initialContent || '',
      onChange: options.onChange || (() => {}),
    };

    this.selectionInfo = {
      show: false,
      startIndex: 0,
      endIndex: 0
    };

    this.init();
  }

  init() {
    // 에디터 컨테이너 생성
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'relative w-full';
    
    // contentEditable 영역 생성
    this.editor = document.createElement('div');
    this.editor.contentEditable = true;
    this.editor.className = 'w-full min-h-[300px] bg-[#1e1e1e] text-white rounded-lg p-6 overflow-y-auto focus:outline-none focus:border-blue-500 border border-gray-700';
    this.editor.style.minHeight = '300px';
    this.editor.innerHTML = this.options.initialContent;

    // 플로팅 메뉴 생성
    this.floatingMenu = document.createElement('div');
    this.floatingMenu.className = 'absolute left-1/2 top-0 -translate-x-1/2 bg-gray-800 text-white rounded shadow-lg z-10 flex flex-col hidden';
    this.createFloatingMenu();

    // 이벤트 리스너 등록
    this.attachEventListeners();

    // DOM에 추가
    this.editorContainer.appendChild(this.floatingMenu);
    this.editorContainer.appendChild(this.editor);
    this.container.appendChild(this.editorContainer);
  }

  createFloatingMenu() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex p-1 gap-1';

    const buttons = [
      { tag: 'strong', icon: 'format_bold', title: '굵게' },
      { tag: 'em', icon: 'format_italic', title: '기울임' },
      { tag: 'u', icon: 'format_underlined', title: '밑줄' },
      { tag: 'code', icon: 'code', title: '코드' },
      { tag: 'h1', icon: 'format_h1', title: '제목 1' },
      { tag: 'h2', icon: 'format_h2', title: '제목 2' },
      { tag: 'blockquote', icon: 'format_quote', title: '인용' }
    ];

    buttons.forEach(({ tag, icon, title }) => {
      const button = document.createElement('button');
      button.className = 'w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded';
      button.title = title;
      button.innerHTML = `<span class="material-symbols-outlined text-lg">${icon}</span>`;
      button.addEventListener('click', () => this.wrapWithTag(tag));
      buttonContainer.appendChild(button);
    });

    this.floatingMenu.appendChild(buttonContainer);
  }

  attachEventListeners() {
    document.addEventListener('selectionchange', () => this.handleSelectionChange());
    this.editor.addEventListener('click', (e) => this.handleClick(e));
    this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.editor.addEventListener('input', () => this.handleContentChange());
  }

  handleSelectionChange() {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed && this.editor.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      
      if (this.editor.contains(range.commonAncestorContainer)) {
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(this.editor);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const startIndex = preSelectionRange.toString().length;
        
        const postSelectionRange = range.cloneRange();
        postSelectionRange.selectNodeContents(this.editor);
        postSelectionRange.setEnd(range.endContainer, range.endOffset);
        const endIndex = postSelectionRange.toString().length;

        this.selectionInfo = {
          show: true,
          startIndex,
          endIndex
        };

        this.showFloatingMenu();
      }
    } else {
      this.hideFloatingMenu();
    }
  }

  showFloatingMenu() {
    this.floatingMenu.classList.remove('hidden');
  }

  hideFloatingMenu() {
    this.floatingMenu.classList.add('hidden');
  }

  handleClick(e) {
    const selection = window.getSelection();
    if (selection && selection.isCollapsed) {
      this.hideFloatingMenu();
    }
  }

  handleKeyDown(e) {
    this.hideFloatingMenu();
  }

  handleContentChange() {
    this.options.onChange(this.editor.innerHTML);
  }

  wrapWithTag(tag) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    const wrappedText = `<${tag}>${selectedText}</${tag}>`;
    
    range.deleteContents();
    const fragment = range.createContextualFragment(wrappedText);
    range.insertNode(fragment);
    
    this.hideFloatingMenu();
    this.handleContentChange();
  }

  // 공개 API
  getContent() {
    return this.editor.innerHTML;
  }

  setContent(content) {
    this.editor.innerHTML = content;
    this.handleContentChange();
  }

  destroy() {
    document.removeEventListener('selectionchange', this.handleSelectionChange);
    this.container.removeChild(this.editorContainer);
  }
}

// 전역으로 내보내기
window.Editor = Editor; 