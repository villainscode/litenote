'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="h-[40px] bg-[#3c3f41] text-white flex items-center justify-end px-4 w-full">
      <a
        href="#"
        className="hover:text-gray-300 flex items-center space-x-1"
        onClick={(e) => {
          e.preventDefault();
          // 도움말 기능 구현 예정
        }}
      >
        <FontAwesomeIcon icon={faQuestionCircle} />
        <span>HELP</span>
      </a>
    </footer>
  );
} 