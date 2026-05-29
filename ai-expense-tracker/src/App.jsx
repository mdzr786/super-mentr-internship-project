import { useState } from 'react';
import './index.css';
import { analyzeExpensesWithAI } from './services/aiParser';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#94a3b8'];
const BAR_COLOR = '#3b82f6'; 

const demoData = {
  metrics: { income: 8500, expenses: 4200, savings: 4300, totalTransactions: 64, largestExpense: { name: 'Rent & Utilities', amount: 2100 } },
  forecast: { nextMonthEstimate: 4100, reason: "Your spending has been highly consistent over the last 4 weeks with no major annual subscriptions detected." },
  recommendation: "You have a strong 50% savings rate. Consider allocating 20% of these liquid savings into a high-yield index fund to maximize long-term growth.",
  chartData: [
    { name: "Housing & Utilities", value: 2400 },
    { name: "Food & Dining", value: 850 },
    { name: "Shopping", value: 450 },
    { name: "Transportation", value: 300 },
    { name: "Miscellaneous", value: 200 }
  ],
  paymentData: [
    { name: "UPI", value: 1600 },
    { name: "Credit Card", value: 2100 },
    { name: "Bank Transfer", value: 500 }
  ],
  timelineData: [
    { week: "Week 1", amount: 1400 },
    { week: "Week 2", amount: 800 },
    { week: "Week 3", amount: 1100 },
    { week: "Week 4", amount: 900 }
  ]
};

function App() {
  const [started, setStarted] = useState(false);
  const [file, setFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const finishAnalysis = (data) => {
    // Custom error handling for API Rate Limits
    if (data === "RATE_LIMIT") {
      alert("We are processing a lot of requests right now! Please wait 60 seconds and try again.");
    } else if (data) {
      setAnalysisData(data);
      setSelectedCategory('All'); 
    } else {
      alert("The AI had trouble reading that file. Please ensure it is a clear bank statement.");
    }
    setIsAnalyzing(false);
  };

  const handleFileAnalysis = async () => {
    if (!file) return alert("Please upload a file first!");
    setIsAnalyzing(true);
    setAnalysisData(null); 

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        finishAnalysis(await analyzeExpensesWithAI(csvText, 'text'));
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Code = e.target.result.split(',')[1]; 
        finishAnalysis(await analyzeExpensesWithAI(base64Code, 'pdf'));
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        finishAnalysis(await analyzeExpensesWithAI(e.target.result, 'text'));
      };
      reader.readAsText(file);
    }
  };

  const handleLoadDemo = () => {
    setAnalysisData(demoData);
    setSelectedCategory('All');
  };

  const getBudgetHealth = () => {
    if (!analysisData || !analysisData.metrics) return { percent: 0, color: '#10b981', text: 'Healthy' };
    const income = analysisData.metrics.income || 1; 
    const expenses = analysisData.metrics.expenses || 0;
    const percent = Math.min(Math.round((expenses / income) * 100), 100);
    
    if (percent < 75) return { percent, color: '#10b981', text: 'Healthy Spending' };
    if (percent < 90) return { percent, color: '#f59e0b', text: 'Nearing Budget Limit' };
    return { percent, color: '#ef4444', text: 'Critical: Budget Exceeded' };
  };

  const budgetHealth = getBudgetHealth();

  const filteredChartData = analysisData && analysisData.chartData
    ? (selectedCategory === 'All' 
        ? analysisData.chartData 
        : analysisData.chartData.filter(item => item.name === selectedCategory))
    : [];

  const savingsRate = analysisData && analysisData.metrics && analysisData.metrics.income > 0 
    ? Math.round((analysisData.metrics.savings / analysisData.metrics.income) * 100) 
    : 0;

  const cashFlowData = analysisData ? [
    {
      name: 'Cash Flow',
      Income: analysisData.metrics?.income || 0,
      Expenses: analysisData.metrics?.expenses || 0
    }
  ] : [];

  // --- LANDING PAGE ---
  if (!started) {
    return (
      <div className="landing-layout">
        <div className="container" style={{ marginTop: '8vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
              Smart Expense Tracker
            </h1>
            <p style={{ color: '#475569', fontSize: '1.25rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Professional financial analytics powered by AI. Transform your raw bank statements into actionable business insights instantly.
            </p>
            <button 
              onClick={() => setStarted(true)}
              style={{ 
                fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '8px', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                backgroundColor: '#0f172a', color: 'white', border: 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Go to Dashboard
            </button>
          </div>

          <div className="metrics-grid" style={{ width: '100%', maxWidth: '1000px' }}>
            <div className="card" style={{ textAlign: 'left', padding: '2rem', marginBottom: '0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#0f172a' }}>Multi-Format Support</h3>
              <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                Upload CSV, TXT, Excel, or complex PDF bank statements. The system processes them seamlessly.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'left', padding: '2rem', marginBottom: '0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧠</div>
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#0f172a' }}>AI-Powered Parsing</h3>
              <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                Advanced LLM processing automatically categorizes transactions and extracts operational metrics.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'left', padding: '2rem', marginBottom: '0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#0f172a' }}>Visual Analytics</h3>
              <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                Interactive charts and automatic anomaly detection designed for rapid business-level reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD PAGE ---
  return (
    <div className="dashboard-layout">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Financial Dashboard</h1>
          {analysisData && (
            <button 
              className="no-print"
              onClick={() => window.print()} 
              style={{ 
                background: '#0f172a', color: 'white', display: 'flex', gap: '8px', 
                alignItems: 'center', border: 'none', padding: '10px 16px',
                borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
              }}
            >
              📄 Export PDF Report
            </button>
          )}
        </div>
        
        <div className="card no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="file" accept=".csv, .txt, .pdf, .xlsx, .xls" 
            onChange={(e) => setFile(e.target.files[0])} 
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
          <button 
            onClick={handleFileAnalysis} disabled={isAnalyzing}
            style={{
              background: isAnalyzing ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '6px', cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isAnalyzing ? "Analyzing Data..." : "Generate Dashboard"}
          </button>
        </div>

        {!analysisData && !isAnalyzing && (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '4rem' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '1.1rem' }}>Don't have a statement ready?</p>
              <button 
                onClick={handleLoadDemo}
                style={{
                  background: 'rgba(139, 92, 246, 0.1)', color: '#6d28d9', border: '1px solid rgba(139, 92, 246, 0.3)',
                  padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: 'none'
                }}
              >
                📊 Load Sample Data
              </button>
            </div>

            <h3 style={{ color: '#0f172a', marginBottom: '2rem', fontSize: '1.5rem' }}>How It Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>1. Upload</h4>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Upload your raw bank statement in CSV, Excel, TXT, or PDF format.</p>
              </div>
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>2. AI Analysis</h4>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Gemini securely processes, categorizes, and calculates your financial data.</p>
              </div>
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>3. Get Insights</h4>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Instantly view interactive charts, predictive forecasts, and business metrics.</p>
              </div>
            </div>

            <div style={{ display: 'inline-block', textAlign: 'left', padding: '1.5rem 2rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>Bank-Grade Privacy</strong>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                Your financial files are processed locally via secure API and are <strong>never stored</strong> on our servers.
              </p>
            </div>
          </div>
        )}

        {analysisData && (
          <>
            <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="metric-card">
                <div className="metric-title">Total Income</div>
                <div className="metric-value" style={{color: 'var(--success)'}}>₹{analysisData.metrics?.income || 0}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Expenses</div>
                <div className="metric-value" style={{color: 'var(--danger)'}}>₹{analysisData.metrics?.expenses || 0}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Net Savings</div>
                <div className="metric-value">₹{analysisData.metrics?.savings || 0}</div>
              </div>
              <div className="metric-card" style={{ background: 'rgba(240, 253, 244, 0.8)', borderColor: '#bbf7d0' }}>
                <div className="metric-title">Savings Rate</div>
                <div className="metric-value" style={{color: '#16a34a'}}>{savingsRate}%</div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#0f172a' }}>Budget Health (Expenses vs. Income)</strong>
                <span style={{ color: budgetHealth.color, fontWeight: 'bold' }}>
                  {budgetHealth.text} ({budgetHealth.percent}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(226, 232, 240, 0.8)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${budgetHealth.percent}%`, background: budgetHealth.color, transition: 'width 1s ease-in-out, background-color 0.5s ease' }} />
              </div>
            </div>

            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
               <div className="metric-card" style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                <div className="metric-title">Transaction Volume</div>
                <div className="metric-value" style={{ fontSize: '1.75rem' }}>{analysisData.metrics?.totalTransactions || 0} Transactions</div>
              </div>
              <div className="metric-card" style={{ background: 'rgba(254, 242, 242, 0.8)', borderColor: '#fee2e2' }}>
                <div className="metric-title">Largest Single Expense</div>
                <div className="metric-value" style={{ fontSize: '1.75rem', color: '#b91c1c' }}>
                  ₹{analysisData.metrics?.largestExpense?.amount || 0} 
                  <span style={{ fontSize: '1rem', color: '#7f1d1d', marginLeft: '10px', fontWeight: 'normal' }}>
                    ({analysisData.metrics?.largestExpense?.name || 'Unknown'})
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ background: 'rgba(248, 250, 252, 0.8)', borderLeft: '4px solid #0f172a', marginBottom: 0 }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>AI Business Insights</h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{analysisData.recommendation}</p>
              </div>
              {analysisData.forecast && (
                <div className="card" style={{ background: 'rgba(240, 253, 244, 0.8)', borderLeft: '4px solid #16a34a', marginBottom: 0 }}>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔮</span> Next Month Forecast: ₹{analysisData.forecast.nextMonthEstimate}
                  </h3>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#15803d' }}>
                    <strong>AI Analysis:</strong> {analysisData.forecast.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center', gap: '10px' }}>
              <strong style={{ color: '#475569' }}>Filter Category:</strong>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', outline: 'none', background: 'rgba(255,255,255,0.8)' }}
              >
                <option value="All">All Categories</option>
                {analysisData.chartData.map((category, index) => (
                  <option key={index} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              
              <div className="card" style={{ marginBottom: 0 }}>
                <h3 style={{ marginTop: 0 }}>Expense Breakdown</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={filteredChartData} 
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70} 
                        outerRadius={110}
                        paddingAngle={5}
                        label
                      >
                        {filteredChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0 }}>
                <h3 style={{ marginTop: 0 }}>Weekly Spending Trend</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={analysisData.timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => `₹${value}`} />
                      <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0 }}>
                <h3 style={{ marginTop: 0 }}>Income vs. Expenses</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => `₹${value}`} />
                      <Legend verticalAlign="bottom" height={36}/>
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
                      <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0 }}>
                <h3 style={{ marginTop: 0 }}>Payment Methods</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={analysisData.paymentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => `₹${value}`} />
                      <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;