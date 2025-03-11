'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faFile, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// 새로운 인터페이스 정의
interface SubMenu {
  id: number;
  name: string;
  display_order: number;
  deleted: boolean;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  sub_menus?: SubMenu[];
}

interface Menu {
  id: number;
  name: string;
  display_order: number;
  deleted: boolean;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  sub_menus?: SubMenu[];
}

interface Category {
  id: number;
  title: string;
  display_order: number;
  deleted: boolean;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  menus: Menu[];
}

interface TreeMenuData {
  categories: Category[];
}

// 문서 인터페이스 추가
interface Document {
  id: number;
  title: string;
  content?: string;
}

interface SidebarProps {
  onDocumentSlideChange?: (isOpen: boolean) => void;
}

export default function Sidebar({ onDocumentSlideChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuData, setMenuData] = useState<TreeMenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDocumentSlideOpen, setIsDocumentSlideOpen] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    show: boolean;
    startIndex: number;
    endIndex: number;
    position: { x: number; y: number };
  }>({
    show: false,
    startIndex: 0,
    endIndex: 0,
    position: { x: 0, y: 0 }
  });

  // 문서 슬라이드 상태가 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    if (onDocumentSlideChange) {
      onDocumentSlideChange(isDocumentSlideOpen);
    }
  }, [isDocumentSlideOpen, onDocumentSlideChange]);

  useEffect(() => {
    // 메뉴 데이터 가져오기
    setIsLoading(true);
    fetch('/resource/tree_menu.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('파일을 찾을 수 없습니다');
        }
        return response.json();
      })
      .then((data: TreeMenuData) => {
        console.log('로드된 데이터:', data); // 디버깅용
        setMenuData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('메뉴 데이터를 불러오는 중 오류가 발생했습니다:', error);
        setIsLoading(false);
      });
  }, []);

  // 모든 메뉴 항목을 1depth로 평면화
  const getAllMenus = () => {
    if (!menuData || !menuData.categories) return [];
    
    const allMenus: Menu[] = [];
    menuData.categories.forEach(category => {
      if (category.menus && Array.isArray(category.menus)) {
        category.menus.forEach(menu => {
          allMenus.push(menu);
        });
      }
    });
    
    return allMenus;
  };

  const menus = getAllMenus();

  // 각 메뉴의 문서 갯수를 임의로 생성하는 함수
  const getRandomDocCount = () => {
    return Math.floor(Math.random() * 20) + 1; // 1~20 사이의 임의의 숫자
  };

  // 메뉴 항목에 문서 갯수 추가
  const menusWithDocCount = menus.map(menu => ({
    ...menu,
    docCount: getRandomDocCount()
  }));

  // 메뉴 클릭 시 하위 문서 생성 및 슬라이드 열기
  const handleMenuClick = (menu: Menu & { docCount: number }) => {
    setSelectedMenu(menu);
    
    // 임의의 문서 목록 생성
    const generatedDocuments: Document[] = Array.from({ length: menu.docCount }, (_, index) => ({
      id: index + 1,
      title: `${menu.name} 문서 ${index + 1}`,
      content: `${menu.name}에 대한 문서 내용 ${index + 1}`
    }));
    
    setDocuments(generatedDocuments);
    setIsDocumentSlideOpen(true);
  };

  // 문서 슬라이드 닫기
  const closeDocumentSlide = () => {
    setIsDocumentSlideOpen(false);
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editorRef.current) {
      const range = selection.getRangeAt(0);
      
      // 선택 영역이 에디터 내부에 있는지 확인
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        // 선택 영역의 시작과 끝 인덱스 계산
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const startIndex = preSelectionRange.toString().length;
        
        const postSelectionRange = range.cloneRange();
        postSelectionRange.selectNodeContents(editorRef.current);
        postSelectionRange.setEnd(range.endContainer, range.endOffset);
        const endIndex = postSelectionRange.toString().length;
        
        // 선택 영역의 위치 계산
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const lastRect = rects[rects.length - 1];
          
          setSelectionInfo({
            show: true,
            startIndex,
            endIndex,
            position: {
              x: lastRect.right,
              y: lastRect.top
            }
          });
        }
      }
    } else {
      setSelectionInfo(prev => ({ ...prev, show: false }));
    }
  };

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
  };

  return (
    <div className="relative h-full">
      <div className={`bg-[#2b2d30] text-white transition-all duration-300 h-full flex flex-col ${isCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <div className="flex-1 overflow-y-auto p-2">
          <h5 className="text-xl font-bold mb-4 px-2">All categories</h5>
          
          {/* 로딩 상태 표시 */}
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="text-gray-400">로딩 중...</div>
            </div>
          ) : menusWithDocCount.length > 0 ? (
            /* 1depth 메뉴 목록 */
            <div className="space-y-2">
              {menusWithDocCount.map(menu => (
                <div 
                  key={menu.id}
                  className="p-2 hover:bg-gray-700 cursor-pointer rounded flex justify-between items-center"
                  onClick={() => handleMenuClick(menu)}
                >
                  <span className="truncate">{menu.name}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full ml-2">
                    {menu.docCount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-20">
              <div className="text-gray-400">메뉴가 없습니다</div>
            </div>
          )}
        </div>
      </div>

      {/* 문서 목록 슬라이드 */}
      <div 
        className={`absolute top-0 left-64 h-full bg-[#1e2431] text-white transition-all duration-300 ${
          isDocumentSlideOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-2 h-full">
          <div className="flex items-center mb-4 px-2">
            <button 
              className="mr-2 p-1 hover:bg-gray-700 rounded"
              onClick={closeDocumentSlide}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h5 className="text-xl font-bold truncate">
              {selectedMenu?.name} 문서
            </h5>
          </div>
          
          {/* 문서 목록 */}
          <div className="space-y-2">
            {documents.map(doc => (
              <div 
                key={doc.id}
                className="p-2 hover:bg-gray-700 cursor-pointer rounded flex items-center"
              >
                <FontAwesomeIcon icon={faFile} className="mr-2 text-blue-400" />
                <span className="truncate">{doc.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute bottom-[10px] bg-[#027acc] hover:bg-[#0263a3] text-white p-2 rounded shadow-lg z-10 ${
          isCollapsed ? 'left-0' : 'right-0 translate-x-1/2'
        }`}
      >
        <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
      </button>

      {selectionInfo.show && (
        <div 
          className="absolute bg-gray-800 text-white rounded shadow-lg z-10 flex flex-col"
          style={{ 
            left: `${selectionInfo.position.x}px`, 
            top: `${selectionInfo.position.y - 10}px`,
            transform: 'translate(10px, -100%)'
          }}
        >
          <div className="p-2 text-xs border-b border-gray-700">
            선택 범위: {selectionInfo.startIndex} ~ {selectionInfo.endIndex}
          </div>
          <div className="flex p-1">
            <button 
              onClick={() => wrapWithTag('strong')} 
              className="p-1 hover:bg-gray-700 rounded"
              title="굵게"
            >
              B
            </button>
            <button 
              onClick={() => wrapWithTag('em')} 
              className="p-1 hover:bg-gray-700 rounded"
              title="기울임"
            >
              I
            </button>
            <button 
              onClick={() => wrapWithTag('u')} 
              className="p-1 hover:bg-gray-700 rounded"
              title="밑줄"
            >
              U
            </button>
            <button 
              onClick={() => wrapWithTag('code')} 
              className="p-1 hover:bg-gray-700 rounded"
              title="코드"
            >
              {'</>'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 