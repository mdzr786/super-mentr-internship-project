import axios from 'axios';

// 1. Paste your API Key here!
const API_KEY = "AIzaSyDMXof0eQ_QFGKFLRq6JJCxeTSa4VeTAgY";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

export const analyzeExpensesWithAI = async (fileData, fileType) => {
  const prompt = `
    Analyze this bank statement/transaction list. 
    
    1. Calculate Total Income (credits/deposits).
    2. Calculate Total Expenses (debits/withdrawals).
    3. Calculate Savings (Income - Expenses).
    4. Group expenses into maximum 5 major categories for a donut chart.
    5. Count the Total Number of Transactions (both in and out).
    6. Identify the Largest Single Expense (give me the name and the amount).
    7. Group the spending by Payment Method (e.g., UPI, Bank Transfer, Credit Card, Cash) for a bar chart.
    8. FORECAST: Based on the spending patterns, predict the estimated total expenses for NEXT month. Provide a realistic number and a 1-sentence reason why.
    9. TIMELINE: Group the expenses chronologically into 4 weeks (Week 1, Week 2, Week 3, Week 4) to show spending trends over the month.
    
    You MUST respond ONLY with a valid JSON object in this exact format:
    {
      "metrics": {
        "income": 5000,
        "expenses": 3000,
        "savings": 2000,
        "totalTransactions": 45,
        "largestExpense": {"name": "Apple Store", "amount": 1200}
      },
      "forecast": {
        "nextMonthEstimate": 3200,
        "reason": "Because 40% of your spending was on recurring subscriptions, next month will likely remain stable."
      },
      "recommendation": "A 2 sentence financial tip based on these specific habits.",
      "chartData": [
        {"name": "Category Name", "value": 100}
      ],
      "paymentData": [
        {"name": "UPI", "value": 800}
      ],
      "timelineData": [
        {"week": "Week 1", "amount": 800},
        {"week": "Week 2", "amount": 1200},
        {"week": "Week 3", "amount": 400},
        {"week": "Week 4", "amount": 600}
      ]
    }
  `;

  const parts = [{ text: prompt }];

  if (fileType === 'pdf') {
    parts.push({
      inlineData: { mimeType: "application/pdf", data: fileData }
    });
  } else {
    parts.push({ text: `\n\nHere is the data:\n${fileData}` });
  }

  try {
    const response = await axios.post(API_URL, {
      contents: [{ parts: parts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1 
      }
    });

    const aiText = response.data.candidates[0].content.parts[0].text;
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);

  } catch (error) {
    // Detect the Google API Rate Limit specifically
    if (error.response && error.response.status === 429) {
      console.warn("Gemini API Rate Limit Exceeded!");
      return "RATE_LIMIT"; 
    }
    console.error("Error talking to AI Engine:", error);
    return null; 
  }
};