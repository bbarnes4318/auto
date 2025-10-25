import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialDashboard = () => {
  // Core Input States
  const [startingAgents, setStartingAgents] = useState(4);
  const [additionalAgentsPerQuarter, setAdditionalAgentsPerQuarter] = useState(4);
  const [callsPerDay, setCallsPerDay] = useState(14);
  
  // Advanced Settings - CSR/Account Manager States
  const [csrCount, setCsrCount] = useState(1);
  const [csrHourlyWage, setCsrHourlyWage] = useState(15);
  const [csrStartMonth, setCsrStartMonth] = useState(1);
  const [csrEndMonth, setCsrEndMonth] = useState(24);
  const [csrQualityLevel, setCsrQualityLevel] = useState(3); // 1-5 scale
  const [csrTrainingInvestment, setCsrTrainingInvestment] = useState(2000); // Annual training per CSR
  const [csrResponseTime, setCsrResponseTime] = useState(4); // Hours to respond
  
  // Advanced Settings - Lead Mix & Cost
  const [costInbound, setCostInbound] = useState(20);
  const [pctInbound, setPctInbound] = useState(50);
  const [costTransfer, setCostTransfer] = useState(7);
  const [inboundConv, setInboundConv] = useState(15);
  const [transferConv, setTransferConv] = useState(10);
  
  // Advanced Settings - Commission
  const [autoComm, setAutoComm] = useState(12);
  const [homeComm, setHomeComm] = useState(15);
  
  // Advanced Settings - Additional Costs
  const [eoCoverageCost, setEoCoverageCost] = useState(500);
  const [softwareCost, setSoftwareCost] = useState(200);
  
  // Advanced Settings - Automation & Capacity
  const [automationLevel, setAutomationLevel] = useState(3); // 1-4 scale (Manual to Advanced)
  const [autoHireCSRs, setAutoHireCSRs] = useState(true); // Auto-hire when capacity reached

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

  // Calculate CSR capacity based on automation level (from research)
  const getCSRCapacity = (automationLevel) => {
    const capacityRanges = {
      1: 600,  // Manual/Traditional
      2: 800,  // Moderate Automation
      3: 1200, // Automated (recommended for remote)
      4: 1400  // Advanced Technology
    };
    return capacityRanges[automationLevel] || 1200;
  };

  // Calculate retention rate based on CSR investment and quality
  const calculateRetentionRate = (csrCount, csrQuality, csrWage, responseTime, totalHouseholds, automationLevel) => {
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
    
    // Capacity overload penalty (from research: service quality degrades when overloaded)
    const maxCapacity = getCSRCapacity(automationLevel);
    const capacityPerCSR = totalHouseholds / Math.max(1, csrCount);
    if (capacityPerCSR > maxCapacity) {
      const overloadPenalty = Math.min(0.15, (capacityPerCSR - maxCapacity) / maxCapacity * 0.3);
      retentionRate -= overloadPenalty;
    }
    
    // Cap at top performer level
    return Math.min(TOP_PERFORMER_RETENTION, Math.max(0.35, retentionRate));
  };

  // Calculate monthly projections with realistic agent ramp-up
  const monthlyData = useMemo(() => {
    const data = [];
    let cumulativeHouseholds = 0;
    let currentCSRCount = csrCount;
    
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
      
      // Update cumulative households
      cumulativeHouseholds += monthlyIssuedHouseholds;
      
      // Auto-hire CSRs based on capacity (from research)
      if (autoHireCSRs && month >= csrStartMonth) {
        const maxCapacity = getCSRCapacity(automationLevel);
        const requiredCSRs = Math.ceil(cumulativeHouseholds / maxCapacity);
        if (requiredCSRs > currentCSRCount) {
          currentCSRCount = requiredCSRs;
        }
      }
      
      // Calculate costs
      const totalDailyInboundCalls = experiencedAgentDailyInbound + newAgentDailyInbound;
      const totalDailyTransferCalls = experiencedAgentDailyTransfer + newAgentDailyTransfer;
      const monthlyInboundCalls = totalDailyInboundCalls * WORKING_DAYS;
      const monthlyTransferCalls = totalDailyTransferCalls * WORKING_DAYS;
      const callCost = (monthlyInboundCalls * costInbound) + (monthlyTransferCalls * costTransfer);
      
      // CSR cost only applies during selected months (use current CSR count)
      const csrCost = (month >= csrStartMonth && month <= csrEndMonth) 
        ? currentCSRCount * csrHourlyWage * 8 * WORKING_DAYS 
        : 0;
      
      // CSR training cost (annual, distributed monthly)
      const csrTrainingCost = (month >= csrStartMonth && month <= csrEndMonth) 
        ? (currentCSRCount * csrTrainingInvestment) / 12 
        : 0;
      
      const salesAgentCommission = monthlyTotalCommission * 0.10; // 10% commission for sales agents
      const eoCost = eoCoverageCost; // Monthly E&O coverage cost
      const softwareCostMonthly = softwareCost; // Monthly software cost
      const totalCost = callCost + csrCost + csrTrainingCost + salesAgentCommission + eoCost + softwareCostMonthly;
      
      // Calculate dynamic retention rate based on CSR investment and capacity
      const currentRetentionRate = calculateRetentionRate(currentCSRCount, csrQualityLevel, csrHourlyWage, csrResponseTime, cumulativeHouseholds, automationLevel);
      
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
        retentionRate: currentRetentionRate,
        csrCount: currentCSRCount,
        cumulativeHouseholds,
        capacityUtilization: cumulativeHouseholds / (currentCSRCount * getCSRCapacity(automationLevel))
      });
    }
    return data;
  }, [startingAgents, additionalAgentsPerQuarter, callsPerDay, pctInbound, inboundConv, transferConv, autoComm, homeComm, costInbound, costTransfer, csrCount, csrHourlyWage, csrStartMonth, csrEndMonth, eoCoverageCost, softwareCost, csrQualityLevel, csrTrainingInvestment, csrResponseTime, automationLevel, autoHireCSRs]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const year1Data = monthlyData.slice(0, 12);
    const year2Data = monthlyData.slice(12, 24);
    
    const year1Revenue = year1Data.reduce((sum, m) => sum + m.totalRevenue, 0);
    const year1Cost = year1Data.reduce((sum, m) => sum + m.totalCost, 0);
    const year1Profit = year1Revenue - year1Cost;
    
    const year2Revenue = year2Data.reduce((sum, m) => sum + m.totalRevenue, 0);
    const year2Cost = year2Data.reduce((sum, m) => sum + m.totalCost, 0);
    
    // Calculate residual income from previous year using dynamic retention rate
    const currentRetentionRate = monthlyData[0]?.retentionRate || 0.75;
    const year2Residuals = year1Revenue * currentRetentionRate;
    const year3Residuals = year2Revenue * currentRetentionRate;
    
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

  // Prepare chart data - show all 24 months with cumulative profit
  const chartData = monthlyData.map((m, index) => {
    const cumulativeProfit = monthlyData.slice(0, index + 1).reduce((sum, month) => sum + month.netProfit, 0);
    return {
      month: `M${m.month}`,
      Revenue: Math.round(m.totalRevenue),
      Cost: Math.round(m.totalCost),
      Profit: Math.round(m.netProfit),
      'Cumulative Profit': Math.round(cumulativeProfit)
    };
  });

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

  // Reset to defaults
  const handleReset = () => {
    setStartingAgents(4);
    setAdditionalAgentsPerQuarter(4);
    setCallsPerDay(14);
    setCsrCount(1);
    setCsrHourlyWage(15);
    setCsrStartMonth(1);
    setCsrEndMonth(24);
    setCsrQualityLevel(3);
    setCsrTrainingInvestment(2000);
    setCsrResponseTime(4);
    setCostInbound(20);
    setPctInbound(50);
    setCostTransfer(7);
    setInboundConv(15);
    setTransferConv(10);
    setAutoComm(12);
    setHomeComm(15);
    setEoCoverageCost(500);
    setSoftwareCost(200);
    setAutomationLevel(3);
    setAutoHireCSRs(true);
  };

  return (
    <div className="flex h-screen w-screen bg-white text-gray-900">
      {/* LEFT SIDEBAR: Inputs */}
      <aside className="w-[340px] min-w-[320px] max-w-[360px] h-full border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold">Assumptions</h1>
          <p className="text-xs text-gray-500">Adjust inputs to see updated cashflow & profit</p>
        </div>

        {/* Core Inputs (Always Visible) */}
        <section className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Core Inputs</h2>
          
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 flex justify-between">
              <span>Starting Agents (Q1)</span>
              <span className="text-gray-400 text-[10px] uppercase tracking-wide"># agents</span>
            </label>
            <input
              type="number"
              value={startingAgents}
              onChange={(e) => setStartingAgents(Number(e.target.value))}
              min="1"
              max="20"
              className="w-full mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 flex justify-between">
              <span>Additional Agents/Quarter</span>
              <span className="text-gray-400 text-[10px] uppercase tracking-wide"># agents</span>
            </label>
            <input
              type="number"
              value={additionalAgentsPerQuarter}
              onChange={(e) => setAdditionalAgentsPerQuarter(Number(e.target.value))}
              min="0"
              max="20"
              className="w-full mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">New agents added each quarter after Q1</p>
          </div>

          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 flex justify-between">
              <span>Calls/Agent/Day</span>
              <span className="text-gray-400 text-[10px] uppercase tracking-wide"># calls</span>
            </label>
            <input
              type="number"
              value={callsPerDay}
              onChange={(e) => setCallsPerDay(Number(e.target.value))}
              min="5"
              max="30"
              className="w-full mt-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Average number of calls each agent makes per day</p>
          </div>
        </section>

        {/* Advanced Settings (Collapsible) */}
        <section className="p-4 flex-1 overflow-y-auto">
          <details className="group border border-gray-200 rounded-lg">
            <summary className="cursor-pointer select-none flex items-center justify-between p-3">
              <span className="text-sm font-semibold text-gray-800">Advanced Settings</span>
              <span className="text-xs text-gray-500 group-open:hidden">Show</span>
              <span className="text-xs text-gray-500 hidden group-open:inline">Hide</span>
            </summary>

            <div className="px-3 pb-3 max-h-[40vh] overflow-y-auto">
              {/* CSR / Service */}
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">CSR / Service</h3>

                <label className="text-[11px] font-medium text-gray-600 flex justify-between">
                  <span>Number of CSRs</span>
                </label>
                <input
                  type="number"
                  value={csrCount}
                  onChange={(e) => setCsrCount(Number(e.target.value))}
                  min="0"
                  max="10"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600 flex justify-between">
                  <span>CSR Hourly Wage</span>
                  <span className="text-gray-400">$/hour (8hrs/day)</span>
                </label>
                <input
                  type="number"
                  value={csrHourlyWage}
                  onChange={(e) => setCsrHourlyWage(Number(e.target.value))}
                  min="10"
                  max="50"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600 flex justify-between">
                  <span>CSR Quality Level</span>
                  <span className="text-gray-400">1-5 (affects retention)</span>
                </label>
                <input
                  type="number"
                  value={csrQualityLevel}
                  onChange={(e) => setCsrQualityLevel(Number(e.target.value))}
                  min="1"
                  max="5"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600">CSR Start Month</label>
                    <input
                      type="number"
                      value={csrStartMonth}
                      onChange={(e) => setCsrStartMonth(Number(e.target.value))}
                      min="1"
                      max="24"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600">CSR End Month</label>
                    <input
                      type="number"
                      value={csrEndMonth}
                      onChange={(e) => setCsrEndMonth(Number(e.target.value))}
                      min="1"
                      max="24"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <label className="text-[11px] font-medium text-gray-600 mt-2 block">
                  Avg Response Time to Customer (Hours)
                </label>
                <input
                  type="number"
                  value={csrResponseTime}
                  onChange={(e) => setCsrResponseTime(Number(e.target.value))}
                  min="1"
                  max="24"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600 mt-2 block">
                  Annual Training per CSR ($)
                </label>
                <input
                  type="number"
                  value={csrTrainingInvestment}
                  onChange={(e) => setCsrTrainingInvestment(Number(e.target.value))}
                  min="0"
                  max="10000"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600 mt-2 block">
                  Automation Level (1-4)
                </label>
                <input
                  type="number"
                  value={automationLevel}
                  onChange={(e) => setAutomationLevel(Number(e.target.value))}
                  min="1"
                  max="4"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">1=Manual(600 HH/CSR), 2=Moderate(800), 3=Automated(1200), 4=Advanced(1400)</p>

                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="autoHire"
                    checked={autoHireCSRs}
                    onChange={(e) => setAutoHireCSRs(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoHire" className="text-[11px] text-gray-700">Auto-hire CSRs when capacity reached</label>
                </div>
              </div>

              {/* Lead Mix & Cost */}
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Lead Mix & Cost</h3>

                <label className="text-[11px] font-medium text-gray-600">Cost per Inbound Call ($)</label>
                <input
                  type="number"
                  value={costInbound}
                  onChange={(e) => setCostInbound(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600">% inbound (vs. transfers)</label>
                <input
                  type="number"
                  value={pctInbound}
                  onChange={(e) => setPctInbound(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-gray-500 mb-2">% Transfers: {100 - pctInbound}%</p>

                <label className="text-[11px] font-medium text-gray-600">Cost per live transfer ($)</label>
                <input
                  type="number"
                  value={costTransfer}
                  onChange={(e) => setCostTransfer(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600">% inbound conversion rate</label>
                <input
                  type="number"
                  value={inboundConv}
                  onChange={(e) => setInboundConv(Number(e.target.value))}
                  min="1"
                  max="30"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600">% transfer conversion rate</label>
                <input
                  type="number"
                  value={transferConv}
                  onChange={(e) => setTransferConv(Number(e.target.value))}
                  min="1"
                  max="25"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Commission */}
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Commission</h3>

                <label className="text-[11px] font-medium text-gray-600">Auto Commission %</label>
                <input
                  type="number"
                  value={autoComm}
                  onChange={(e) => setAutoComm(Number(e.target.value))}
                  min="5"
                  max="20"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600">Home Commission %</label>
                <input
                  type="number"
                  value={homeComm}
                  onChange={(e) => setHomeComm(Number(e.target.value))}
                  min="5"
                  max="20"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Additional Costs */}
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Additional Monthly Costs</h3>

                <label className="text-[11px] font-medium text-gray-600">E&O Coverage ($)</label>
                <input
                  type="number"
                  value={eoCoverageCost}
                  onChange={(e) => setEoCoverageCost(Number(e.target.value))}
                  min="0"
                  max="5000"
                  className="w-full mb-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="text-[11px] font-medium text-gray-600">Software Cost ($)</label>
                <input
                  type="number"
                  value={softwareCost}
                  onChange={(e) => setSoftwareCost(Number(e.target.value))}
                  min="0"
                  max="5000"
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </details>
        </section>

        {/* Actions at Bottom */}
        <div className="mt-auto p-4 border-t border-gray-200 grid grid-cols-2 gap-2">
          <button
            onClick={handleReset}
            className="text-xs font-medium rounded-md border border-gray-300 py-2 hover:bg-gray-50"
          >
            Reset
          </button>
          <button className="text-xs font-medium rounded-md bg-indigo-600 text-white py-2 hover:bg-indigo-700">
            Save Scenario
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE: Results */}
      <main className="flex-1 h-full overflow-hidden flex flex-col p-3 gap-3 bg-white">
        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="rounded-lg border border-blue-200 p-3 flex flex-col bg-indigo-50">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
              Year 1 Revenue
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(kpis.year1Revenue)}</div>
          </div>

          <div className="rounded-lg border border-red-200 p-3 flex flex-col bg-red-50">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-red-700">
              Year 1 Costs
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(kpis.year1Cost)}</div>
          </div>

          <div className="rounded-lg border border-green-200 p-3 flex flex-col bg-green-50">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
              Year 1 Profit
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(kpis.year1Profit)}</div>
          </div>

          <div className="rounded-lg border border-teal-200 p-3 flex flex-col bg-teal-50">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
              Retention Rate
            </div>
            <div className="text-lg font-bold text-gray-900">{Math.round((monthlyData[0]?.retentionRate || 0) * 100)}%</div>
          </div>

          <div className="rounded-lg border border-purple-200 p-3 flex flex-col bg-purple-50">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-purple-700">
              Year 2 Residuals
            </div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(kpis.year2Residuals)}</div>
          </div>
        </div>

        {/* Cashflow Chart */}
        <div className="rounded-lg border border-gray-200 p-4 bg-white">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Monthly Cashflow – First 24 Months
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ fontSize: 12, backgroundColor: '#fff', border: '1px solid #d1d5db' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Revenue" fill="#3b82f6" />
              <Bar dataKey="Cost" fill="#ef4444" />
              <Bar dataKey="Profit" fill="#10b981" />
              <Bar dataKey="Cumulative Profit" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit & Residuals Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 p-3 bg-white">
            <div className="text-sm font-semibold text-gray-800 mb-2">Profit</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] uppercase font-medium text-gray-500">Year 1 Profit</div>
                <div className="text-base font-bold text-gray-900">{formatCurrency(kpis.year1Profit)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-medium text-gray-500">Year 2 Profit</div>
                <div className="text-base font-bold text-gray-900">{formatCurrency(kpis.year2Profit)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 bg-white">
            <div className="text-sm font-semibold text-gray-800 mb-2">Residuals</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] uppercase font-medium text-gray-500">Year 2 Residuals</div>
                <div className="text-base font-bold text-gray-900">{formatCurrency(kpis.year2Residuals)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-medium text-gray-500">Year 3 Residuals</div>
                <div className="text-base font-bold text-gray-900">{formatCurrency(kpis.year3Residuals)}</div>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 mt-2 italic">
              Year 2 residuals are already included in Year 2 profit.
            </div>
          </div>
        </div>

        {/* Year Summaries (Collapsible Tables) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <details className="rounded-lg border border-gray-200 bg-white">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-800 flex items-center justify-between hover:bg-gray-50">
              <span>Year 1 Summary</span>
              <span className="text-xs text-gray-500">Expand</span>
            </summary>
            <div className="px-3 pb-3 overflow-x-auto max-h-48">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 py-1 text-left text-xs">Period</th>
                    <th className="px-1 py-1 text-right text-xs">Policies</th>
                    <th className="px-1 py-1 text-right text-xs">Revenue</th>
                    <th className="px-1 py-1 text-right text-xs">Cost</th>
                    <th className="px-1 py-1 text-right text-xs">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {year1Summary.map((row, idx) => (
                    <tr key={idx} className={row.name === 'Total' ? 'font-semibold border-t-2 bg-gray-50' : 'border-t'}>
                      <td className="px-1 py-1 text-xs">{row.name}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatNumber(row.issuedSales)}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatCurrency(row.totalRevenue)}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatCurrency(row.totalCost)}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatCurrency(row.netProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <details className="rounded-lg border border-gray-200 bg-white">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-800 flex items-center justify-between hover:bg-gray-50">
              <span>Year 2 Summary</span>
              <span className="text-xs text-gray-500">Expand</span>
            </summary>
            <div className="px-3 pb-3 overflow-x-auto max-h-48">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 py-1 text-left text-xs">Period</th>
                    <th className="px-1 py-1 text-right text-xs">Policies</th>
                    <th className="px-1 py-1 text-right text-xs">Revenue</th>
                    <th className="px-1 py-1 text-right text-xs">Cost</th>
                    <th className="px-1 py-1 text-right text-xs">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {year2Summary.map((row, idx) => (
                    <tr key={idx} className={row.name === 'Total' ? 'font-semibold border-t-2 bg-gray-50' : 'border-t'}>
                      <td className="px-1 py-1 text-xs">{row.name}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatNumber(row.issuedSales)}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatCurrency(row.totalRevenue)}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatCurrency(row.totalCost)}</td>
                      <td className="px-1 py-1 text-right text-xs">{formatCurrency(row.netProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
};

export default FinancialDashboard;