import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialDashboard = () => {
  // Input States
  const [startingAgents, setStartingAgents] = useState(4);
  const [additionalAgentsPerQuarter, setAdditionalAgentsPerQuarter] = useState(4);
  const [callsPerDay, setCallsPerDay] = useState(14);
  const [costInbound, setCostInbound] = useState(20);
  const [pctInbound, setPctInbound] = useState(50);
  const [costTransfer, setCostTransfer] = useState(7);
  const [inboundConv, setInboundConv] = useState(15);
  const [transferConv, setTransferConv] = useState(10);
  const [autoComm, setAutoComm] = useState(12);
  const [homeComm, setHomeComm] = useState(15);
  
  // CSR/Account Manager States
  const [csrCount, setCsrCount] = useState(1);
  const [csrHourlyWage, setCsrHourlyWage] = useState(15);
  const [csrStartMonth, setCsrStartMonth] = useState(1);
  const [csrEndMonth, setCsrEndMonth] = useState(24);
  
  // Additional Cost States
  const [eoCoverageCost, setEoCoverageCost] = useState(500);
  const [softwareCost, setSoftwareCost] = useState(200);
  
  // Retention & CSR Quality States
  const [csrQualityLevel, setCsrQualityLevel] = useState(3); // 1-5 scale
  const [csrTrainingInvestment, setCsrTrainingInvestment] = useState(2000); // Annual training per CSR
  const [csrResponseTime, setCsrResponseTime] = useState(4); // Hours to respond

  // Constants
  const WORKING_DAYS = 20.83;
  const ISSUANCE_RATE = 0.75;
  const AUTO_PREMIUM = 1197;
  const HOME_PREMIUM = 1480;
  const AUTOS_PER_HOUSEHOLD = 1.5;
  const MULTILINE_PERCENTAGE = 0.25; // 25% of households get fire/home policies
  
  // Retention rates based on research
  const BASE_RETENTION_RATE = 0.84; // Industry average
  const TOP_PERFORMER_RETENTION = 0.93; // Top agencies
  const NO_AGENT_CONTACT_RETENTION = 0.35; // 65% leave without agent contact
  const WITH_AGENT_CONTACT_RETENTION = 0.80; // 80% stay with agent contact
  
  // Realistic performance progression for new agents (B25-B27 from Excel)
  const FIRST_MONTH_PERFORMANCE = 0.50;  // 50% of expected sales (learning phase)
  const SECOND_MONTH_PERFORMANCE = 0.65; // 65% of expected sales (improving)
  const THIRD_MONTH_PERFORMANCE = 0.80;  // 80% of expected sales (almost full performance)

  // Calculate retention rate based on CSR investment and quality
  const calculateRetentionRate = (csrCount, csrQuality, csrWage, responseTime) => {
    if (csrCount === 0) return NO_AGENT_CONTACT_RETENTION; // No CSR = poor retention
    
    // Base retention with CSR contact
    let retentionRate = WITH_AGENT_CONTACT_RETENTION;
    
    // Quality multiplier (1-5 scale)
    const qualityMultiplier = 0.02 * csrQuality; // 2% per quality level
    retentionRate += qualityMultiplier;
    
    // Wage impact (higher pay = better retention)
    const wageImpact = Math.min(0.05, (csrWage - 15) * 0.002); // Up to 5% for higher wages
    retentionRate += wageImpact;
    
    // Response time impact (faster = better retention)
    const responseImpact = Math.max(0, (24 - responseTime) * 0.001); // Up to 2.4% for instant response
    retentionRate += responseImpact;
    
    // Cap at top performer level
    return Math.min(TOP_PERFORMER_RETENTION, retentionRate);
  };

  // Calculate monthly projections with realistic agent ramp-up
  const monthlyData = useMemo(() => {
    const data = [];
    
    for (let month = 1; month <= 24; month++) {
      const quarter = Math.ceil(month / 3);
      const monthInQuarter = ((month - 1) % 3) + 1;
      
      // Calculate agent counts for this month
      const experiencedAgentsCount = quarter === 1 ? 0 : startingAgents + ((quarter - 2) * additionalAgentsPerQuarter);
      const newAgentsCount = quarter === 1 ? startingAgents : additionalAgentsPerQuarter;
      const totalAgents = experiencedAgentsCount + newAgentsCount;
      
      // Calculate daily calls per agent type
      const experiencedAgentDailyCalls = experiencedAgentsCount * callsPerDay;
      const newAgentDailyCalls = newAgentsCount * callsPerDay;
      
      // Calculate daily inbound and transfer calls
      const experiencedAgentDailyInbound = experiencedAgentDailyCalls * (pctInbound / 100);
      const experiencedAgentDailyTransfer = experiencedAgentDailyCalls * ((100 - pctInbound) / 100);
      const newAgentDailyInbound = newAgentDailyCalls * (pctInbound / 100);
      const newAgentDailyTransfer = newAgentDailyCalls * ((100 - pctInbound) / 100);
      
      // Calculate daily households from conversions
      const experiencedAgentDailyInboundHouseholds = experiencedAgentDailyInbound * (inboundConv / 100);
      const experiencedAgentDailyTransferHouseholds = experiencedAgentDailyTransfer * (transferConv / 100);
      const newAgentDailyInboundHouseholds = newAgentDailyInbound * (inboundConv / 100);
      const newAgentDailyTransferHouseholds = newAgentDailyTransfer * (transferConv / 100);
      
      // Apply performance multipliers
      let newAgentMultiplier = 1;
      
      if (quarter === 1) {
        // Starting agents in Q1 get performance progression
        if (monthInQuarter === 1) newAgentMultiplier = FIRST_MONTH_PERFORMANCE;
        else if (monthInQuarter === 2) newAgentMultiplier = SECOND_MONTH_PERFORMANCE;
        else if (monthInQuarter === 3) newAgentMultiplier = THIRD_MONTH_PERFORMANCE;
      } else {
        // Additional agents get performance progression in their first quarter
        if (monthInQuarter === 1) newAgentMultiplier = FIRST_MONTH_PERFORMANCE;
        else if (monthInQuarter === 2) newAgentMultiplier = SECOND_MONTH_PERFORMANCE;
        else if (monthInQuarter === 3) newAgentMultiplier = THIRD_MONTH_PERFORMANCE;
      }
      
      // Calculate total daily households
      const experiencedAgentDailyHouseholds = experiencedAgentDailyInboundHouseholds + experiencedAgentDailyTransferHouseholds; // 100% performance
      const newAgentDailyHouseholds = (newAgentDailyInboundHouseholds + newAgentDailyTransferHouseholds) * newAgentMultiplier;
      const totalDailyHouseholds = experiencedAgentDailyHouseholds + newAgentDailyHouseholds;
      
      // Apply apps to issue rate
      const dailyIssuedHouseholds = totalDailyHouseholds * ISSUANCE_RATE;
      
      // Calculate daily autos (1.5 per household)
      const dailyAutos = dailyIssuedHouseholds * AUTOS_PER_HOUSEHOLD;
      
      // Calculate daily fire/home policies (25% of households)
      const dailyFireHomePolicies = dailyIssuedHouseholds * MULTILINE_PERCENTAGE;
      
      // Calculate daily premiums
      const dailyAutoPremium = dailyAutos * AUTO_PREMIUM;
      const dailyFireHomePremium = dailyFireHomePolicies * HOME_PREMIUM;
      
      // Calculate daily commissions
      const dailyAutoCommission = dailyAutoPremium * (autoComm / 100);
      const dailyFireHomeCommission = dailyFireHomePremium * (homeComm / 100);
      const dailyTotalCommission = dailyAutoCommission + dailyFireHomeCommission;
      
      // Calculate monthly totals
      const monthlyIssuedHouseholds = dailyIssuedHouseholds * WORKING_DAYS;
      const monthlyAutos = dailyAutos * WORKING_DAYS;
      const monthlyFireHomePolicies = dailyFireHomePolicies * WORKING_DAYS;
      const monthlyAutoPremium = dailyAutoPremium * WORKING_DAYS;
      const monthlyFireHomePremium = dailyFireHomePremium * WORKING_DAYS;
      const monthlyAutoCommission = dailyAutoCommission * WORKING_DAYS;
      const monthlyFireHomeCommission = dailyFireHomeCommission * WORKING_DAYS;
      const monthlyTotalCommission = dailyTotalCommission * WORKING_DAYS;
      
      // Calculate costs
      const totalDailyInboundCalls = experiencedAgentDailyInbound + newAgentDailyInbound;
      const totalDailyTransferCalls = experiencedAgentDailyTransfer + newAgentDailyTransfer;
      const monthlyInboundCalls = totalDailyInboundCalls * WORKING_DAYS;
      const monthlyTransferCalls = totalDailyTransferCalls * WORKING_DAYS;
      const callCost = (monthlyInboundCalls * costInbound) + (monthlyTransferCalls * costTransfer);
      
      // CSR cost only applies during selected months
      const csrCost = (month >= csrStartMonth && month <= csrEndMonth) 
        ? csrCount * csrHourlyWage * 8 * WORKING_DAYS 
        : 0;
      
      // CSR training cost (annual, distributed monthly)
      const csrTrainingCost = (month >= csrStartMonth && month <= csrEndMonth) 
        ? (csrCount * csrTrainingInvestment) / 12 
        : 0;
      
      const salesAgentCommission = monthlyTotalCommission * 0.10; // 10% commission for sales agents
      const eoCost = eoCoverageCost; // Monthly E&O coverage cost
      const softwareCostMonthly = softwareCost; // Monthly software cost
      const totalCost = callCost + csrCost + csrTrainingCost + salesAgentCommission + eoCost + softwareCostMonthly;
      
      // Calculate dynamic retention rate based on CSR investment
      const currentRetentionRate = calculateRetentionRate(csrCount, csrQualityLevel, csrHourlyWage, csrResponseTime);
      
      // Calculate residual income for Year 2 (months 13-24)
      let residualIncome = 0;
      if (month >= 13) {
        // Calculate Year 1 total revenue for residual calculation
        const year1Data = data.slice(0, 12);
        const year1TotalRevenue = year1Data.reduce((sum, m) => sum + m.totalRevenue, 0);
        residualIncome = (year1TotalRevenue * currentRetentionRate) / 12; // Use dynamic retention rate
      }
      
      const totalRevenueWithResiduals = monthlyTotalCommission + residualIncome;
      const netProfit = totalRevenueWithResiduals - totalCost;
      const totalPremium = monthlyAutoPremium + monthlyFireHomePremium;
      
      data.push({
        month,
        totalAgents,
        issuedSales: monthlyIssuedHouseholds,
        totalPremium,
        totalRevenue: totalRevenueWithResiduals,
        residualIncome,
        callCost,
        csrCost,
        csrTrainingCost,
        salesAgentCommission,
        eoCost,
        softwareCost: softwareCostMonthly,
        totalCost,
        netProfit,
        retentionRate: currentRetentionRate
      });
    }
    return data;
  }, [startingAgents, additionalAgentsPerQuarter, callsPerDay, pctInbound, inboundConv, transferConv, autoComm, homeComm, costInbound, costTransfer, csrCount, csrHourlyWage, csrStartMonth, csrEndMonth, eoCoverageCost, softwareCost, csrQualityLevel, csrTrainingInvestment, csrResponseTime]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const year1Data = monthlyData.slice(0, 12);
    const year2Data = monthlyData.slice(12, 24);
    
    const year1Revenue = year1Data.reduce((sum, m) => sum + m.totalRevenue, 0);
    const year1Cost = year1Data.reduce((sum, m) => sum + m.totalCost, 0);
    const year1Profit = year1Revenue - year1Cost;
    
    const year2Revenue = year2Data.reduce((sum, m) => sum + m.totalRevenue, 0);
    const year2Cost = year2Data.reduce((sum, m) => sum + m.totalCost, 0);
    
    // Calculate residual income from previous year
    const year2Residuals = year1Revenue * RETENTION_YEAR_3;
    const year3Residuals = year2Revenue * RETENTION_YEAR_3;
    
    // Year 2 revenue already includes residuals from monthly calculation, so don't add again
    const year2Profit = year2Revenue - year2Cost;
    
    return {
      year1Revenue,
      year1Cost,
      year1Profit,
      year2Revenue,
      year2Cost,
      year2Profit,
      year2Residuals,
      year3Residuals
    };
  }, [monthlyData]);

  // Prepare chart data - show all 24 months
  const chartData = monthlyData.map(m => ({
    month: `M${m.month}`,
    Revenue: Math.round(m.totalRevenue),
    Cost: Math.round(m.totalCost),
    Profit: Math.round(m.netProfit)
  }));

  // Calculate yearly summaries
  const getYearSummary = (startMonth, endMonth) => {
    const quarters = [];
    for (let q = 0; q < 4; q++) {
      const qStart = startMonth + (q * 3);
      const qEnd = qStart + 3;
      const qData = monthlyData.slice(qStart, qEnd);
      quarters.push({
        name: `Q${q + 1}`,
        issuedSales: qData.reduce((sum, m) => sum + m.issuedSales, 0),
        totalPremium: qData.reduce((sum, m) => sum + m.totalPremium, 0),
        totalRevenue: qData.reduce((sum, m) => sum + m.totalRevenue, 0),
        callCost: qData.reduce((sum, m) => sum + m.callCost, 0),
        agentComp: qData.reduce((sum, m) => sum + m.agentComp, 0),
        totalCost: qData.reduce((sum, m) => sum + m.totalCost, 0),
        netProfit: qData.reduce((sum, m) => sum + m.netProfit, 0)
      });
    }
    
    const yearTotal = monthlyData.slice(startMonth, endMonth).reduce((acc, m) => ({
      issuedSales: acc.issuedSales + m.issuedSales,
      totalPremium: acc.totalPremium + m.totalPremium,
      totalRevenue: acc.totalRevenue + m.totalRevenue,
      callCost: acc.callCost + m.callCost,
      agentComp: acc.agentComp + m.agentComp,
      totalCost: acc.totalCost + m.totalCost,
      netProfit: acc.netProfit + m.netProfit
    }), { issuedSales: 0, totalPremium: 0, totalRevenue: 0, callCost: 0, agentComp: 0, totalCost: 0, netProfit: 0 });
    
    return [...quarters, { name: 'Total', ...yearTotal }];
  };

  const year1Summary = getYearSummary(0, 12);
  const year2Summary = getYearSummary(12, 24);

  const formatCurrency = (value) => `$${Math.round(value).toLocaleString()}`;
  const formatNumber = (value) => Math.round(value).toLocaleString();

  return (
    <div className="flex h-screen bg-gray-50 p-1 gap-1">
      {/* Input Panel */}
      <div className="w-1/4 bg-white rounded shadow-sm p-1 overflow-y-auto">
        <h2 className="text-xs font-bold text-gray-800 mb-1">Assumption Inputs</h2>
        
        <div className="space-y-1">
          <div className="border-b pb-0.5">
            <h3 className="text-xs font-semibold text-gray-700 mb-0.5">Agency</h3>
            <InputSlider label="Starting Agents (Q1)" value={startingAgents} onChange={setStartingAgents} min={1} max={20} helpText="Number of sales agents starting in Quarter 1" />
            <InputSlider label="Additional Agents/Quarter" value={additionalAgentsPerQuarter} onChange={setAdditionalAgentsPerQuarter} min={0} max={20} helpText="New agents hired each quarter after Q1" />
            <InputSlider label="Calls/Agent/Day" value={callsPerDay} onChange={setCallsPerDay} min={5} max={30} helpText="Average number of calls each agent makes per day" />
          </div>
          
          <div className="border-b pb-0.5">
            <h3 className="text-xs font-semibold text-gray-700 mb-0.5">CSR/Account Manager</h3>
            <InputSlider label="Number of CSRs" value={csrCount} onChange={setCsrCount} min={0} max={10} helpText="Customer Service Representatives for account management" />
            <InputNumber label="CSR Hourly Wage (8hrs/day)" value={csrHourlyWage} onChange={setCsrHourlyWage} prefix="$" helpText="Hourly wage for CSR staff (8 hours per day)" />
            <InputSlider label="CSR Start Month" value={csrStartMonth} onChange={setCsrStartMonth} min={1} max={24} helpText="First month CSR costs begin" />
            <InputSlider label="CSR End Month" value={csrEndMonth} onChange={setCsrEndMonth} min={1} max={24} helpText="Last month CSR costs apply" />
            <InputSlider label="CSR Quality Level" value={csrQualityLevel} onChange={setCsrQualityLevel} min={1} max={5} helpText="CSR service quality (1=poor, 5=excellent) - affects retention" />
            <InputNumber label="CSR Training/Year" value={csrTrainingInvestment} onChange={setCsrTrainingInvestment} prefix="$" helpText="Annual training investment per CSR" />
            <InputSlider label="Response Time (Hours)" value={csrResponseTime} onChange={setCsrResponseTime} min={1} max={24} helpText="Average response time to customer inquiries" />
            <div className="text-xs text-gray-500 mt-1">
              <div>Q1: {startingAgents} agents</div>
              <div>Q2: {startingAgents + additionalAgentsPerQuarter} agents</div>
              <div>Q3: {startingAgents + (additionalAgentsPerQuarter * 2)} agents</div>
              <div>Q4: {startingAgents + (additionalAgentsPerQuarter * 3)} agents</div>
            </div>
          </div>
          
          <div className="border-b pb-0.5">
            <h3 className="text-xs font-semibold text-gray-700 mb-0.5">Lead Mix & Cost</h3>
            <InputNumber label="Cost/Inbound Call" value={costInbound} onChange={setCostInbound} prefix="$" helpText="Cost per inbound lead/call received" />
            <InputSlider label="% Inbounds" value={pctInbound} onChange={setPctInbound} min={0} max={100} suffix="%" helpText="Percentage of calls that are inbound vs transfers" />
            <InputNumber label="Cost/Live Transfer" value={costTransfer} onChange={setCostTransfer} prefix="$" helpText="Cost per live transfer call to agents" />
            <div className="text-xs text-gray-500 mt-1">% Transfers: {100 - pctInbound}%</div>
          </div>
          
          <div className="border-b pb-0.5">
            <h3 className="text-xs font-semibold text-gray-700 mb-0.5">Conversion & Commission</h3>
            <InputSlider label="Inbound Conv. Rate" value={inboundConv} onChange={setInboundConv} min={1} max={30} suffix="%" helpText="Percentage of inbound calls that convert to sales" />
            <InputSlider label="Transfer Conv. Rate" value={transferConv} onChange={setTransferConv} min={1} max={25} suffix="%" helpText="Percentage of transfer calls that convert to sales" />
            <InputSlider label="Auto Commission" value={autoComm} onChange={setAutoComm} min={5} max={20} suffix="%" helpText="Commission rate on auto insurance policies" />
            <InputSlider label="Home Commission" value={homeComm} onChange={setHomeComm} min={5} max={20} suffix="%" helpText="Commission rate on home/fire insurance policies" />
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-0.5">Additional Costs</h3>
            <InputNumber label="E&O Coverage (Monthly)" value={eoCoverageCost} onChange={setEoCoverageCost} prefix="$" helpText="Monthly Errors & Omissions insurance coverage cost" />
            <InputNumber label="Software Cost (Monthly)" value={softwareCost} onChange={setSoftwareCost} prefix="$" helpText="Monthly software licensing and technology costs" />
          </div>
        </div>
      </div>

      {/* Dashboard Panel */}
      <div className="w-3/4 flex flex-col gap-1 overflow-hidden">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-1">
          <KPICard title="Year 1 Revenue" value={formatCurrency(kpis.year1Revenue)} color="blue" />
          <KPICard title="Year 1 Costs" value={formatCurrency(kpis.year1Cost)} color="red" />
          <KPICard title="Year 1 Profit" value={formatCurrency(kpis.year1Profit)} color="green" />
          <KPICard title="Retention Rate" value={`${Math.round(monthlyData[0]?.retentionRate * 100 || 0)}%`} color="purple" />
          <KPICard title="Year 2 Revenue" value={formatCurrency(kpis.year2Revenue)} color="blue" />
          <KPICard title="Year 2 Costs" value={formatCurrency(kpis.year2Cost)} color="red" />
          <KPICard title="Year 2 Profit" value={formatCurrency(kpis.year2Profit)} color="green" />
          <KPICard title="Year 2 Residuals" value={formatCurrency(kpis.year2Residuals)} color="purple" />
        </div>

        {/* Chart */}
        <div className="bg-white rounded shadow-sm p-1 h-32">
          <h3 className="text-xs font-semibold text-gray-700 mb-0.5">Monthly Performance (24 Months)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Revenue" fill="#3b82f6" />
              <Bar dataKey="Cost" fill="#ef4444" />
              <Bar dataKey="Profit" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Breakdown for First 6 Months */}
        <div className="bg-white rounded shadow-sm p-1 flex-1 overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-700 mb-0.5">First 6 Months - Cashflow Analysis</h3>
          <div className="overflow-auto h-full">
            <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-1 py-0.5 text-left text-xs">Month</th>
                <th className="px-1 py-0.5 text-right text-xs">Agents</th>
                <th className="px-1 py-0.5 text-right text-xs">HHs</th>
                <th className="px-1 py-0.5 text-right text-xs">Revenue</th>
                <th className="px-1 py-0.5 text-right text-xs">Residual</th>
                <th className="px-1 py-0.5 text-right text-xs">Call Cost</th>
                <th className="px-1 py-0.5 text-right text-xs">CSR Cost</th>
                <th className="px-1 py-0.5 text-right text-xs">Training</th>
                <th className="px-1 py-0.5 text-right text-xs">E&O Cost</th>
                <th className="px-1 py-0.5 text-right text-xs">Software</th>
                <th className="px-1 py-0.5 text-right text-xs">Sales Comm</th>
                <th className="px-1 py-0.5 text-right text-xs">Total Cost</th>
                <th className="px-1 py-0.5 text-right text-xs">Net Profit</th>
                <th className="px-1 py-0.5 text-right text-xs">Cum Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.slice(0, 6).map((month, idx) => {
                const cumulativeProfit = monthlyData.slice(0, idx + 1).reduce((sum, m) => sum + m.netProfit, 0);
                return (
                  <tr key={month.month} className="border-t">
                    <td className="px-1 py-0.5 font-medium text-xs">M{month.month}</td>
                    <td className="px-1 py-0.5 text-right text-xs">{month.totalAgents}</td>
                    <td className="px-1 py-0.5 text-right text-xs">{Math.round(month.issuedSales).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.totalRevenue).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.residualIncome || 0).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.callCost).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.csrCost).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.csrTrainingCost).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.eoCost).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.softwareCost).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.salesAgentCommission).toLocaleString()}</td>
                    <td className="px-1 py-0.5 text-right text-xs">${Math.round(month.totalCost).toLocaleString()}</td>
                    <td className={`px-1 py-0.5 text-right text-xs ${month.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.round(month.netProfit).toLocaleString()}
                    </td>
                    <td className={`px-1 py-0.5 text-right text-xs font-semibold ${cumulativeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.round(cumulativeProfit).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-2 gap-1 flex-1 overflow-hidden">
          <SummaryTable title="Year 1 Summary" data={year1Summary} />
          <SummaryTable title="Year 2 Summary" data={year2Summary} />
        </div>
      </div>
    </div>
  );
};

const InputSlider = ({ label, value, onChange, min, max, suffix = '', helpText = '' }) => (
  <div className="mb-1">
    <div className="flex justify-between text-xs mb-0.5">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-gray-200 rounded cursor-pointer"
      title={helpText}
    />
    {helpText && <div className="text-xs text-gray-500 mt-0.5">{helpText}</div>}
  </div>
);

const InputNumber = ({ label, value, onChange, prefix = '', helpText = '' }) => (
  <div className="mb-1">
    <label className="text-xs text-gray-700 block mb-0.5">{label}</label>
    <div className="flex items-center">
      {prefix && <span className="text-xs text-gray-500 mr-1">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        title={helpText}
      />
    </div>
    {helpText && <div className="text-xs text-gray-500 mt-0.5">{helpText}</div>}
  </div>
);

const KPICard = ({ title, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };
  
  return (
    <div className={`${colorMap[color]} border rounded p-1`}>
      <div className="text-xs font-medium opacity-75">{title}</div>
      <div className="text-xs font-bold mt-0.5">{value}</div>
    </div>
  );
};

const SummaryTable = ({ title, data }) => (
  <div className="bg-white rounded shadow-sm p-1 overflow-auto">
    <h3 className="text-xs font-semibold text-gray-700 mb-0.5">{title}</h3>
    <table className="w-full text-xs">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-1 py-0.5 text-left text-xs">Period</th>
          <th className="px-1 py-0.5 text-right text-xs">Policies</th>
          <th className="px-1 py-0.5 text-right text-xs">Premium</th>
          <th className="px-1 py-0.5 text-right text-xs">Revenue</th>
          <th className="px-1 py-0.5 text-right text-xs">Cost</th>
          <th className="px-1 py-0.5 text-right text-xs">Profit</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className={row.name === 'Total' ? 'font-semibold border-t-2 bg-gray-50' : 'border-t'}>
            <td className="px-1 py-0.5 text-xs">{row.name}</td>
            <td className="px-1 py-0.5 text-right text-xs">{Math.round(row.issuedSales).toLocaleString()}</td>
            <td className="px-1 py-0.5 text-right text-xs">${Math.round(row.totalPremium / 1000)}k</td>
            <td className="px-1 py-0.5 text-right text-xs">${Math.round(row.totalRevenue / 1000)}k</td>
            <td className="px-1 py-0.5 text-right text-xs">${Math.round(row.totalCost / 1000)}k</td>
            <td className="px-1 py-0.5 text-right text-xs">${Math.round(row.netProfit / 1000)}k</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default FinancialDashboard;