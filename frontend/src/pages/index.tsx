import { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockData {
  symbol: string;
  startPrice: number;
  currentPrice: number;
  profitPercentage: number;
  chartData: Array<{
    date: string;
    price: number;
  }>;
}

const PRESET_TICKERS = [
  { symbol: 'VOO', name: 'VOO', currency: 'USD' },
  { symbol: 'QQQ', name: 'QQQ', currency: 'USD' },
  { symbol: 'SCHD', name: 'SCHD', currency: 'USD' },
  { symbol: '005930.KS', name: '삼성전자', currency: 'KRW' },
  { symbol: '000660.KS', name: 'SK하이닉스', currency: 'KRW' },
];

const YEAR_PRESETS = [
  { value: '1', label: '1년' },
  { value: '3', label: '3년' },
  { value: '5', label: '5년' },
  { value: '10', label: '10년' },
];

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [years, setYears] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [currentCurrency, setCurrentCurrency] = useState<'USD' | 'KRW'>('USD');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const handleYearChange = (change: number) => {
    const currentYear = parseInt(years);
    const newYear = Math.max(1, Math.min(20, currentYear + change));
    setYears(newYear.toString());
  };

  const fetchStockData = async (tickerSymbol: string) => {
    setLoading(true);
    setError('');
    setStockData(null);
    setSymbol(tickerSymbol);

    // Set currency based on ticker
    const ticker = PRESET_TICKERS.find(t => t.symbol === tickerSymbol);
    if (ticker) {
      setCurrentCurrency(ticker.currency as 'USD' | 'KRW');
    } else {
      setCurrentCurrency(tickerSymbol.endsWith('.KS') ? 'KRW' : 'USD');
    }

    try {
      console.log('Fetching data for:', tickerSymbol, years);
      const response = await axios.get(`${API_URL}/api/stock`, {
        params: { symbol: tickerSymbol, years },
        timeout: 10000
      });
      
      console.log('Response:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      if (!response.data.data) {
        throw new Error('Invalid response format');
      }
      
      setStockData(response.data.data);
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data.error || '서버 오류가 발생했습니다.');
        } else if (err.request) {
          setError('서버에 연결할 수 없습니다. 다시 시도해주세요.');
        } else {
          setError('요청 설정 중 오류가 발생했습니다.');
        }
      } else {
        setError(err.message || '주식 데이터를 가져오는데 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchStockData(symbol);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: `${symbol.toUpperCase()} 주가 변동`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  const chartData = stockData ? {
    labels: stockData.chartData.map(d => d.date),
    datasets: [
      {
        label: '주가',
        data: stockData.chartData.map(d => d.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        pointRadius: 1,
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <style jsx>{`
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="relative py-3 sm:max-w-2xl sm:mx-auto w-full px-4">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8 text-center">주식 수익률 백트래커</h1>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기간 선택</label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleYearChange(-1)}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      min="1"
                      max="20"
                      className="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleYearChange(1)}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">년</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {YEAR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setYears(preset.value)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors
                          ${years === preset.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">프리셋 티커</label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_TICKERS.filter(t => t.currency === 'USD').map((ticker) => (
                          <button
                            key={ticker.symbol}
                            onClick={() => fetchStockData(ticker.symbol)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                              ${symbol === ticker.symbol
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {ticker.name}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_TICKERS.filter(t => t.currency === 'KRW').map((ticker) => (
                          <button
                            key={ticker.symbol}
                            onClick={() => fetchStockData(ticker.symbol)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                              ${symbol === ticker.symbol
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {ticker.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">직접 티커 입력</label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={symbol}
                          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                          placeholder="예: AAPL"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                          {loading ? '로딩중...' : '계산'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {error && (
                  <div className="mt-4 text-red-600 text-sm">{error}</div>
                )}

                {stockData && (
                  <div className="mt-8 space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold mb-4">수익률 요약</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">시작가</p>
                          <p className="text-lg font-medium">
                            {currentCurrency === 'USD' ? '$' : '₩'}
                            {currentCurrency === 'USD' 
                              ? stockData.startPrice.toFixed(2)
                              : Math.round(stockData.startPrice).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">현재가</p>
                          <p className="text-lg font-medium">
                            {currentCurrency === 'USD' ? '$' : '₩'}
                            {currentCurrency === 'USD'
                              ? stockData.currentPrice.toFixed(2)
                              : Math.round(stockData.currentPrice).toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">총 수익률</p>
                          <p className={`text-lg font-medium ${
                            stockData.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stockData.profitPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {chartData && (
                      <div className="mt-8" style={{ height: '400px' }}>
                        <Line options={chartOptions} data={chartData} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center text-gray-500 text-sm mt-8">
        2025 오은택. All rights reserved.
      </footer>
    </div>
  );
}
