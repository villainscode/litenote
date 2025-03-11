'use client';

import React, { useState, useEffect } from 'react';

interface SaveResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

export default function MainContent() {
  const [content, setContent] = useState<string>(`<p>이 문서는 Markdown 기반 노트앱에서 자동 생성되었습니다.</p>

<p>이제 별도의 editor 파일을 만들어서 현재 컨텐츠 영역 최상단에 너비 100%를 써서 WYSIWYG Editor를 만들거야. 이 에디터는 지금 만들고 있는 애플리케이션 뿐 아니라 다른 애플리케이션에도 추가할 수 있도록 별도로 구성할거야.<br>
javascript, tailwind, 구글 머티리얼 폰트로 아이콘을 만들고</p>

<h2>오늘의 메모</h2>
<blockquote>
  <p>"지식을 정리하면, 더 나은 생각이 나온다."<br>
  - 기록하는 습관의 중요성</p>
</blockquote>

<h2>프로젝트 개요</h2>
<h3>목표</h3>
<ul>
  <li>사용자가 빠르고 간편하게 노트를 작성할 수 있도록 개발</li>
  <li>로컬 저장과 클라우드 동기화 지원</li>
</ul>

<ul>
  <li>Backend: Supabase</li>
  <li>Frontend: Next.js, Tailwind CSS</li>
  <li>Database: SQLite, IndexedDB</li>
</ul>`);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const editorRef = React.useRef<any>(null);

  useEffect(() => {
    // Editor 초기화
    const initEditor = () => {
      if (editorRef.current) return; // 이미 초기화된 경우 중복 실행 방지
      
      const editorContainer = document.getElementById('editor-container');
      if (editorContainer && window.Editor) {
        editorRef.current = new window.Editor('#editor-container', {
          initialContent: content,
          onChange: (newContent: string) => {
            setContent(newContent);
          }
        });
      } else {
        // 스크립트가 아직 로드되지 않았다면 재시도
        setTimeout(initEditor, 100);
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // 자동 저장 함수
  const saveDocument = async () => {
    if (!editorRef.current) return;
    const htmlContent = editorRef.current.getContent();
    
    try {
      const response = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '무제 문서',
          content: htmlContent,
        }),
      });

      const data: SaveResponse = await response.json();

      if (data.success) {
        setSaveStatus(`저장 완료: ${data.filePath}`);
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus(`저장 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      setSaveStatus('저장 중 오류가 발생했습니다');
    }
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        saveDocument();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="h-screen bg-[#2b2b2b] p-4 flex flex-col">
      {saveStatus && (
        <div className="mb-4 p-2 bg-gray-700 text-white rounded">
          {saveStatus}
        </div>
      )}

      <div id="editor-container" className="flex-1" />

      <div className="mt-4 flex justify-end">
        <button
          onClick={saveDocument}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          저장 (Ctrl+Enter)
        </button>
      </div>
    </div>
  );
} 