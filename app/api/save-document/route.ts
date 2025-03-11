import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: '제목과 내용을 모두 입력해주세요' },
        { status: 400 }
      );
    }

    // 파일명 생성 (특수문자 제거 및 공백을 하이픈으로 변환)
    const fileName = `${title.trim().replace(/[^\w\s가-힣]/g, '').replace(/\s+/g, '-')}.md`;
    
    // 저장 경로 설정
    const documentsDir = path.join(process.cwd(), 'public', 'resource', 'documents');
    const filePath = path.join(documentsDir, fileName);
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    
    // 파일 저장
    fs.writeFileSync(filePath, content, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: '문서가 성공적으로 저장되었습니다',
      filePath: `/resource/documents/${fileName}`
    });
  } catch (error) {
    console.error('문서 저장 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 