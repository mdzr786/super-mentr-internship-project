# 💰 Smart Expense Tracker

An AI-powered financial analytics dashboard that transforms bank statements into actionable insights. Upload your financial data in multiple formats and receive automated expense categorization, forecasts, visual reports, and business recommendations.

---

## 🚀 Features

### 📄 Multi-Format File Support
- CSV Files
- TXT Files
- Excel Files (.xlsx, .xls)
- PDF Bank Statements

### 🧠 AI-Powered Analysis
- Automatic transaction categorization
- Total income calculation
- Total expense calculation
- Savings calculation
- Largest expense detection
- Payment method analysis
- Monthly expense forecasting
- Personalized financial recommendations

### 📊 Interactive Dashboard
- Expense Breakdown Pie Chart
- Weekly Spending Trend Analysis
- Income vs Expense Comparison
- Payment Method Analytics
- Budget Health Monitoring
- Savings Rate Calculation

### 📑 PDF Report Generation
- Export complete financial reports
- Print-friendly dashboard
- Business-ready analytics

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- CSS3 (Glassmorphism UI)

### Data Visualization
- Recharts

### File Processing
- XLSX

### AI Integration
- Google Gemini API

### HTTP Client
- Axios

---

## 📂 Project Structure

```
src/
│
├── App.jsx              # Main dashboard and UI logic
├── main.jsx             # React application entry point
├── index.css            # Global styling and glassmorphism design
├── App.css              # Additional component styling
│
└── services/
    └── aiParser.js      # Gemini AI integration and data analysis
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open Browser

```text
http://localhost:5173
```

---

## 🔑 Environment Setup

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=YOUR_API_KEY
```

Update the API integration to use:

```javascript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

⚠️ Never commit API keys to GitHub.

---

## 📈 How It Works

1. Upload a bank statement.
2. The file is processed locally.
3. Gemini AI analyzes transactions.
4. Data is categorized automatically.
5. Financial metrics are generated.
6. Interactive charts are displayed.
7. AI provides recommendations and forecasts.
8. Reports can be exported as PDF.

---

## 📊 Generated Insights

The system provides:

- Total Income
- Total Expenses
- Net Savings
- Savings Rate
- Transaction Volume
- Largest Expense
- Expense Categories
- Spending Trends
- Payment Methods
- Budget Health Score
- Next Month Expense Forecast

---

## 🔒 Security & Privacy

- Files are processed securely.
- No financial data is permanently stored.
- API communication occurs over HTTPS.
- User data remains private and confidential.

---

## 🎯 Future Enhancements

- User Authentication
- Multi-Month Analysis
- Budget Planning Module
- Investment Recommendations
- Expense Anomaly Detection
- Mobile Application
- Cloud Report Storage
- Dark Mode

---

## 👨‍💻 Author

Mohammed Zain Raza

Information Science & Engineering
Dayananda Sagar Academy of Technology and Management (DSATM)

---

## 📜 License

This project is developed for educational and internship purposes.

© 2026 Mohammed Zain Raza
