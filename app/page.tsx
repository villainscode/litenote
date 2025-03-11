'use client';

import React, { useState } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import Footer from './components/Footer/Footer';

export default function Home() {
  const [isDocumentSlideOpen, setIsDocumentSlideOpen] = useState(false);

  // 문서 슬라이드 상태 변경 핸들러
  const handleDocumentSlideChange = (isOpen: boolean) => {
    setIsDocumentSlideOpen(isOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2b2b2b]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <Sidebar onDocumentSlideChange={handleDocumentSlideChange} />
        </div>
        <div className={`flex-1 min-w-[980px] min-h-[680px] overflow-auto bg-[#2b2b2b] transition-all duration-300 ${isDocumentSlideOpen ? 'ml-64' : ''}`}>
          <MainContent />
        </div>
      </div>
      <Footer />
    </div>
  );
} 