# Currency Dashboard 

A beautiful, functional currency dashboard with real-time exchange rates and multiple currency conversion capabilities.

## Features

- **Real-time Exchange Rates**: View current exchange rates for popular currencies
- **Multiple Currency Conversions**: Convert between multiple currencies simultaneously
- **Popular Currency Pairs**: Quick view of commonly traded currency pairs
- **Currency Statistics**: Insights into currency performance
- **Responsive Design**: Works on desktop and mobile devices
- **Modular Codebase**: Clean separation of concerns with state management

## How to Use

1. Open `index.html` in your browser
2. Use the converter section to add multiple currency conversions
3. View current exchange rates in the rates table
4. Click "Refresh Rates" to get the latest exchange rates
5. Search for specific currencies in the rates table
6. View popular currency pairs and statistics

## Project Structure

- `index.html` - Main HTML structure
- `style.css` - All styling for the dashboard
- `script.js` - JavaScript application with modules for state management, API service, and UI components

## Modules

- **CurrencyState**: Manages application state and notifies listeners of changes
- **ExchangeRateService**: Handles API calls and currency conversions (uses mock data for demo)
- **UIComponents**: Manages all UI rendering and user interactions
- **CurrencyDashboard**: Main application class that ties everything together

## API Integration

This demo uses mock data for demonstration purposes. To connect to a real exchange rate API:

1. Sign up for a free API key at [ExchangeRate-API](https://www.exchangerate-api.com/)
2. Replace the mock API call in `ExchangeRateService.fetchExchangeRates()` with a real API call
3. Update the API key in the constructor

## Browser Compatibility

Works in all modern browsers that support ES6+ JavaScript and CSS Grid/Flexbox.

## License

This project is for educational purposes. Feel free to use and modify as needed.