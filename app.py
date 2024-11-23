from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 로깅 설정
logger = logging.getLogger(__name__)

@app.route('/api/stock', methods=['GET'])
def get_stock_data():
    try:
        symbol = request.args.get('symbol', '').upper()
        years = int(request.args.get('years', 5))
        
        if not symbol:
            return jsonify({'error': 'Stock symbol is required'}), 400

        logger.info(f"Fetching data for symbol: {symbol}, years: {years}")

        # Get stock data
        stock = yf.Ticker(symbol)
        hist = stock.history(period=f'{years}y')
        
        if hist.empty:
            logger.warning(f"No data found for symbol: {symbol}")
            return jsonify({'error': f'No data found for symbol: {symbol}'}), 404

        # Calculate metrics
        start_price = hist['Close'].iloc[0]
        current_price = hist['Close'].iloc[-1]
        profit_percentage = ((current_price - start_price) / start_price) * 100

        # Prepare chart data - 날짜를 한국 시간으로 변환
        chart_data = [{
            'date': index.tz_localize(None).strftime('%Y-%m-%d'),
            'price': float(row['Close'])  # numpy.float64를 파이썬 float로 변환
        } for index, row in hist.iterrows()]

        response_data = {
            'success': True,
            'data': {
                'symbol': symbol,
                'startPrice': float(start_price),
                'currentPrice': float(current_price),
                'profitPercentage': float(profit_percentage),
                'chartData': chart_data
            }
        }

        logger.info(f"Successfully processed data for {symbol}")
        return jsonify(response_data)

    except ValueError as ve:
        logger.error(f"Value error: {str(ve)}")
        return jsonify({'error': 'Invalid input parameters'}), 400
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Failed to fetch stock data'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    app.run(debug=True, port=5001, host='0.0.0.0')
