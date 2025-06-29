# 📈 StockTracker - Advanced Stock Market Dashboard

A modern, full-stack stock market tracking application built with Next.js 15, AWS services, and real-time market data integration. Track your portfolio, analyze market trends, and make informed investment decisions with powerful analytics and intuitive visualizations.

![StockTracker Dashboard](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange?style=for-the-badge&logo=amazon-aws)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 **Core Functionality**
- **Real-time Stock Tracking** - Live price updates and market data
- **Portfolio Management** - Track investments, P&L, and performance metrics
- **Watchlist Management** - Monitor favorite stocks with customizable alerts
- **Advanced Analytics** - Technical indicators, volatility analysis, and sector insights
- **Transaction History** - Complete record of buy/sell transactions
- **Interactive Charts** - Multiple timeframes with moving averages and volume analysis

### 🔧 **Technical Features**
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Dark/Light Mode** - Customizable theme preferences
- **Real-time Updates** - Live data synchronization during market hours
- **Data Export** - Export portfolio and transaction data
- **Search & Discovery** - Find stocks by symbol or company name
- **Performance Metrics** - Comprehensive analytics and reporting

## 🏗️ Architecture

### **Frontend**
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **Lucide React** for icons

### **Backend & Infrastructure**
- **AWS DynamoDB** - NoSQL database for user data and transactions
- **AWS S3** - Object storage for historical data and exports
- **AWS Athena** - Analytics and complex queries
- **Next.js API Routes** - RESTful API endpoints
- **Server Actions** - Server-side data mutations

### **External Integrations**
- **Alpha Vantage API** - Stock market data
- **IEX Cloud API** - Real-time quotes and company data
- **Finnhub API** - Alternative market data source

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS Account (for production)
- Stock market API keys (see [API Setup](#-api-setup))

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/urvashi1206/StockPulse.git
   cd stocktracker
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` with your credentials:
   \`\`\`env
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   
   # API Keys
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   IEX_CLOUD_API_KEY=your_iex_cloud_key
   FINNHUB_API_KEY=your_finnhub_key
   \`\`\`

4. **Set up AWS infrastructure** (Production)
   \`\`\`bash
   npm run setup:aws
   \`\`\`

5. **Seed with real data** (Optional)
   \`\`\`bash
   npm run seed:data
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 API Setup

### Alpha Vantage (Primary)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Add to `.env.local` as `ALPHA_VANTAGE_API_KEY`

### IEX Cloud (Recommended)
1. Visit [IEX Cloud](https://iexcloud.io/pricing/)
2. Create account and get API token
3. Add to `.env.local` as `IEX_CLOUD_API_KEY`

### Finnhub (Alternative)
1. Visit [Finnhub](https://finnhub.io/pricing)
2. Sign up for free tier
3. Add to `.env.local` as `FINNHUB_API_KEY`

## 📱 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=Dashboard+Overview)

### Portfolio Management
![Portfolio](https://via.placeholder.com/800x400/1f2937/ffffff?text=Portfolio+Management)

### Analytics & Charts
![Analytics](https://via.placeholder.com/800x400/1f2937/ffffff?text=Advanced+Analytics)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes (Production) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes (Production) |
| `AWS_REGION` | AWS region | Yes (Production) |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | Recommended |
| `IEX_CLOUD_API_KEY` | IEX Cloud API token | Recommended |
| `FINNHUB_API_KEY` | Finnhub API key | Optional |

### AWS Resources

The application creates the following AWS resources:

- **DynamoDB Tables**: Stocks, Users, Transactions, Watchlists, StockHistory
- **S3 Buckets**: Historical data storage, user exports
- **Athena Database**: Analytics and complex queries

## 📊 Features Deep Dive

### Portfolio Management
- **Real-time Valuation** - Live portfolio value updates
- **P&L Tracking** - Profit/loss calculations with percentages
- **Cost Basis Analysis** - Average cost and return calculations
- **Transaction Recording** - Buy/sell transaction management

### Analytics Dashboard
- **Technical Indicators** - Moving averages, volatility analysis
- **Sector Analysis** - Market sector performance and allocation
- **Volume Analysis** - Trading volume trends and patterns
- **Performance Metrics** - Risk-adjusted returns and statistics

### Watchlist Features
- **Custom Alerts** - Price and volume-based notifications
- **Real-time Updates** - Live price monitoring
- **Search & Discovery** - Find stocks by symbol or company name
- **Bulk Management** - Add/remove multiple stocks

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   \`\`\`bash
   npm i -g vercel
   vercel
   \`\`\`

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### AWS Amplify

1. **Connect repository** to AWS Amplify
2. **Configure build settings**
3. **Set environment variables**
4. **Deploy automatically** on git push

### Docker

\`\`\`dockerfile
# Build and run with Docker
docker build -t stocktracker .
docker run -p 3000:3000 stocktracker
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request


## 🙏 Acknowledgments

- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Alpha Vantage](https://www.alphavantage.co/)** - Stock market data API
- **[IEX Cloud](https://iexcloud.io/)** - Financial data platform
- **[Lucide](https://lucide.dev/)** - Beautiful icon library

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/stocktracker/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/stocktracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/stocktracker/discussions)

## 🔮 Roadmap

- [ ] **Mobile App** - React Native mobile application
- [ ] **Real-time Alerts** - Push notifications and email alerts
- [ ] **Social Features** - Share portfolios and follow other investors
- [ ] **Advanced Analytics** - Machine learning price predictions
- [ ] **Options Trading** - Options chain analysis and tracking
- [ ] **Crypto Support** - Cryptocurrency portfolio tracking
- [ ] **News Integration** - Real-time financial news and sentiment analysis

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[Report Bug](https://github.com/yourusername/stocktracker/issues) · [Request Feature](https://github.com/yourusername/stocktracker/issues) · [Documentation](https://github.com/yourusername/stocktracker/wiki)

</div>
