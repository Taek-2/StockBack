# 주식 수익률 백트래커

장기 주식 투자의 수익률을 계산하고 시각화하는 웹 애플리케이션입니다.

## 기술 스택

### 프론트엔드
- Next.js (TypeScript)
- Tailwind CSS
- Chart.js
- Axios

### 백엔드
- Flask (Python)
- yfinance
- pandas

## 주요 기능
- 주식 티커 심볼로 검색
- 1~20년 기간 선택
- 시작가, 현재가, 총 수익률 계산
- 주가 변동 그래프
- 미국/한국 주식 지원

## 개발 환경 설정

### 백엔드 설정
```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python app.py
```

### 프론트엔드 설정
```bash
# frontend 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 환경 변수 설정

### 프론트엔드 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5001  # 개발 환경
NEXT_PUBLIC_API_URL=https://your-api-url  # 배포 환경
```

## 배포

### 프론트엔드
- Vercel을 통해 배포
- 환경 변수에서 `NEXT_PUBLIC_API_URL` 설정 필요

### 백엔드
- Railway, Render 등의 플랫폼에 배포
- CORS 설정 필요
