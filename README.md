# 주식 수익률 백트래커

개인 투자를 위해 만든 주식 수익률 계산기입니다. 미국/한국 주식 모두 지원하며, 최대 20년까지의 백테스트가 가능합니다.

## 주요 기능

- 미국/한국 주식 수익률 계산
- 기간 설정: 1~20년
- 실시간 차트 시각화
- 달러/원화 자동 변환
- 주요 ETF/주식 프리셋 제공

### 프리셋 종목
- 미국: VOO(S&P 500), QQQ(나스닥 100), SCHD(배당주)
- 한국: 삼성전자, SK하이닉스

## 기술 스택

### Frontend
- Next.js + TypeScript
- Tailwind CSS
- Chart.js

### Backend
- Flask (Python)
- yfinance (주가 데이터)
- pandas (데이터 처리)

## 로컬 개발 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/Taek-2/StockBack.git
cd StockBack
```

2. 백엔드 설정
```bash
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

3. 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```

## 환경 변수 설정

프론트엔드 (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 배포

Render를 통해 프론트엔드와 백엔드를 함께 배포할 수 있습니다. 자세한 설정은 `render.yaml` 파일을 참고하세요.

## 라이선스

MIT License
