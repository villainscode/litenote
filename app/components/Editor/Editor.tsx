'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditorProps {
  initialContent: string;
  onChange?: (content: string) => void;
}

export default function Editor({ initialContent, onChange }: EditorProps) {
  const [selectionInfo, setSelectionInfo] = useState<{
    show: boolean;
    startIndex: number;
    endIndex: number;
  }>({
    show: false,
    startIndex: 0,
    endIndex: 0
  });
  
  const editorRef = useRef<HTMLDivElement>(null);

  // 초기 내용 설정
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // 텍스트 선택 이벤트 처리
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editorRef.current) {
      const range = selection.getRangeAt(0);
      
      // 선택 영역이 에디터 내부에 있는지 확인
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        // 선택 영역의 시작과 끝 노드 및 오프셋 가져오기
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const startIndex = preSelectionRange.toString().length;
        
        const postSelectionRange = range.cloneRange();
        postSelectionRange.selectNodeContents(editorRef.current);
        postSelectionRange.setEnd(range.endContainer, range.endOffset);
        const endIndex = postSelectionRange.toString().length;

        setSelectionInfo({
          show: true,
          startIndex,
          endIndex
        });
      }
    } else {
      setSelectionInfo(prev => ({ ...prev, show: false }));
    }
  };

  // 클릭 이벤트 처리 (선택 정보 숨기기)
  const handleClick = (e: React.MouseEvent) => {
    // 선택 중이 아닌 경우에만 선택 정보 숨기기
    const selection = window.getSelection();
    if (selection && selection.isCollapsed) {
      setSelectionInfo(prev => ({ ...prev, show: false }));
    }
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 선택 정보 숨기기
    setSelectionInfo(prev => ({ ...prev, show: false }));
  };

  // 태그로 감싸기 함수
  const wrapWithTag = (tag: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    // 태그로 감싸기
    const wrappedText = `<${tag}>${selectedText}</${tag}>`;
    
    // 선택 영역 대체
    range.deleteContents();
    const fragment = range.createContextualFragment(wrappedText);
    range.insertNode(fragment);
    
    // 선택 정보 숨기기
    setSelectionInfo(prev => ({ ...prev, show: false }));

    // 내용 변경 알림
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // 내용 변경 처리
  const handleContentChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // 마운트 시 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* 선택 정보 플로팅 메뉴 */}
      {selectionInfo.show && (
        <div 
          className="absolute left-1/2 top-0 -translate-x-1/2 bg-gray-800 text-white rounded shadow-lg z-10 flex flex-col"
        >
          <div className="flex p-1 gap-1">
            <button 
              onClick={() => wrapWithTag('strong')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="굵게"
            >
              <span className="material-symbols-outlined text-lg">format_bold</span>
            </button>
            <button 
              onClick={() => wrapWithTag('em')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="기울임"
            >
              <span className="material-symbols-outlined text-lg">format_italic</span>
            </button>
            <button 
              onClick={() => wrapWithTag('u')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="밑줄"
            >
              <span className="material-symbols-outlined text-lg">format_underlined</span>
            </button>
            <button 
              onClick={() => wrapWithTag('code')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="코드"
            >
              <span className="material-symbols-outlined text-lg">code</span>
            </button>
            <button 
              onClick={() => wrapWithTag('h1')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="제목 1"
            >
              <span className="material-symbols-outlined text-lg">format_h1</span>
            </button>
            <button 
              onClick={() => wrapWithTag('h2')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="제목 2"
            >
              <span className="material-symbols-outlined text-lg">format_h2</span>
            </button>
            <button 
              onClick={() => wrapWithTag('blockquote')} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
              title="인용"
            >
              <span className="material-symbols-outlined text-lg">format_quote</span>
            </button>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onInput={handleContentChange}
        className="w-full min-h-[300px] bg-[#1e1e1e] text-white rounded-lg p-6 overflow-y-auto focus:outline-none focus:border-blue-500 border border-gray-700"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
} 