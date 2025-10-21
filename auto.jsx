import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialDashboard = () => {
  // Input States
  const [agents, setAgents] = useState(4);
  const [callsPerDay, setCallsPerDay] = useState(14);
  const [agentWage, setAgentWage] = useState(0);
  const [costInbound, setCostInbound] = useState(20);
  const [pctInbound, setPctInbound] = useState(50);
  const [costTransfer, setCostTransfer] = useState(7);
  const [inboundConv, setInboundConv] = useState(15);
  const [transferConv, setTransferConv] = useState(10);
  const [autoComm, setAutoComm] = useState(12);
  const [homeComm, setHomeComm] = useState(15);

  // Constants
  const WORKING_DAYS = 20.83;
  const ISSUANCE_RATE = 0.75;
  const AUTO_PREMIUM = 1197;
  const HOME_PREMIUM = 1480;
  const AUTO_MIX = 0.70;
  const HOME_MIX = 0.30;
  const RETENTION_YEAR_3 = 0.75;

  // Calculate monthly projections
  const monthlyData = useMemo(() => {
    const data = [];
    for (let month = 1; month <= 24; month++) {
      const totalCalls = agents * callsPerDay * WORKING_DAYS;
      const inboundCalls = totalCalls * (pctInbound / 100);
      const transferCalls = totalCalls * ((100 - pctInbound) / 100);
      
      const inboundSales = inboundCalls * (inboundConv / 100);
      const transferSales = transferCalls * (transferConv / 100);
      const totalSales = inboundSales + transferSales;
      const issuedSales = totalSales * ISSUANCE_RATE;
      
      const autoRevenue = (issuedSales * AUTO_MIX) * AUTO_PREMIUM * (autoComm / 100);
      const homeRevenue = (issuedSales * HOME_MIX) * HOME_PREMIUM * (homeComm / 100);
      const totalRevenue = autoRevenue + homeRevenue;
      
      const callCost = (inboundCalls * costInbound) + (transferCalls * costTransfer);
      const agentComp = 0; // Based on Excel: AgentComp per hour = 0
      const totalCost = callCost + agentComp;
      
      const netProfit = totalRevenue - totalCost;
      const totalPremium = (issuedSales * AUTO_MIX * AUTO_PREMIUM) + (issuedSales * HOME_MIX * HOME_PREMIUM);
      
      data.push({
        month,
        issuedSales,
        totalPremium,
        totalRevenue,
        callCost,
        agentComp,
        totalCost,
        netProfit
      });
    }
    return data;
  }, [agents, callsPerDay, pctInbound, inboundConv, transferConv, autoComm, homeComm, costInbound, costTransfer, agentWage]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total2YearRevenue = monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0);
    const total2YearCost = monthlyData.reduce((sum, m) => sum + m.totalCost, 0);
    const total2YearProfit = total2YearRevenue - total2YearCost;
    const year2Policies = monthlyData.slice(12).reduce((sum, m) => sum + m.issuedSales, 0);
    const year3Residual = total2YearRevenue * RETENTION_YEAR_3 * 0.5;
    
    return {
      total2YearRevenue,
      total2YearProfit,
      year2Policies,
      year3Residual
    };
  }, [monthlyData]);

  // Prepare chart data
  const chartData = monthlyData.map(m => ({
    month: `M${m.month}`,
    Revenue: Math.round(m.totalRevenue),
    Cost: Math.round(m.totalCost)
  }));

  const cumulativeData = monthlyData.map((m, idx) => ({
    month: `M${m.month}`,
    policies: Math.round(monthlyData.slice(0, idx + 1).reduce((sum, d) => sum + d.issuedSales, 0))
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
    <div className="flex h-screen bg-gray-50">
      {/* Input Panel */}
      <div className="w-1/4 bg-white m-3 rounded-lg shadow-sm p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Assumption Inputs</h2>
        
        <div className="space-y-3">
          <div className="border-b pb-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Agency</h3>
            <InputSlider label="Licensed Agents" value={agents} onChange={setAgents} min={1} max={50} />
            <InputSlider label="Calls/Agent/Day" value={callsPerDay} onChange={setCallsPerDay} min={5} max={30} />
            <InputNumber label="Agent Hourly Wage" value={agentWage} onChange={setAgentWage} prefix="$" />
          </div>
          
          <div className="border-b pb-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Lead Mix & Cost</h3>
            <InputNumber label="Cost/Inbound Call" value={costInbound} onChange={setCostInbound} prefix="$" />
            <InputSlider label="% Inbounds" value={pctInbound} onChange={setPctInbound} min={0} max={100} suffix="%" />
            <InputNumber label="Cost/Live Transfer" value={costTransfer} onChange={setCostTransfer} prefix="$" />
            <div className="text-xs text-gray-500 mt-1">% Transfers: {100 - pctInbound}%</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Conversion & Commission</h3>
            <InputSlider label="Inbound Conv. Rate" value={inboundConv} onChange={setInboundConv} min={1} max={30} suffix="%" />
            <InputSlider label="Transfer Conv. Rate" value={transferConv} onChange={setTransferConv} min={1} max={25} suffix="%" />
            <InputSlider label="Auto Commission" value={autoComm} onChange={setAutoComm} min={5} max={20} suffix="%" />
            <InputSlider label="Home Commission" value={homeComm} onChange={setHomeComm} min={5} max={20} suffix="%" />
          </div>
        </div>
      </div>

      {/* Dashboard Panel */}
      <div className="w-3/4 flex flex-col m-3 gap-3 overflow-y-auto">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <KPICard title="2-Year Revenue" value={formatCurrency(kpis.total2YearRevenue)} color="blue" />
          <KPICard title="2-Year Net Profit" value={formatCurrency(kpis.total2YearProfit)} color="green" />
          <KPICard title="Year 2 Policies" value={formatNumber(kpis.year2Policies)} color="purple" />
          <KPICard title="Year 3 Residual" value={formatCurrency(kpis.year3Residual)} color="orange" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-3 h-64">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Revenue" fill="#3b82f6" />
                <Bar dataKey="Cost" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cumulative Policies</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="policies" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
          <SummaryTable title="Year 1 Summary" data={year1Summary} />
          <SummaryTable title="Year 2 Summary" data={year2Summary} />
        </div>
      </div>
    </div>
  );
};

const InputSlider = ({ label, value, onChange, min, max, suffix = '' }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer"
    />
  </div>
);

const InputNumber = ({ label, value, onChange, prefix = '' }) => (
  <div className="mb-2">
    <label className="text-xs text-gray-700 block mb-1">{label}</label>
    <div className="flex items-center">
      {prefix && <span className="text-xs text-gray-500 mr-1">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

const KPICard = ({ title, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };
  
  return (
    <div className={`${colorMap[color]} border rounded-lg p-3`}>
      <div className="text-xs font-medium opacity-75">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
};

const SummaryTable = ({ title, data }) => (
  <div className="bg-white rounded-lg shadow-sm p-3 overflow-auto">
    <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
    <table className="w-full text-xs">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-1 py-1 text-left">Period</th>
          <th className="px-1 py-1 text-right">Policies</th>
          <th className="px-1 py-1 text-right">Premium</th>
          <th className="px-1 py-1 text-right">Revenue</th>
          <th className="px-1 py-1 text-right">Cost</th>
          <th className="px-1 py-1 text-right">Profit</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className={row.name === 'Total' ? 'font-semibold border-t-2 bg-gray-50' : 'border-t'}>
            <td className="px-1 py-1">{row.name}</td>
            <td className="px-1 py-1 text-right">{Math.round(row.issuedSales).toLocaleString()}</td>
            <td className="px-1 py-1 text-right">${Math.round(row.totalPremium / 1000)}k</td>
            <td className="px-1 py-1 text-right">${Math.round(row.totalRevenue / 1000)}k</td>
            <td className="px-1 py-1 text-right">${Math.round(row.totalCost / 1000)}k</td>
            <td className="px-1 py-1 text-right">${Math.round(row.netProfit / 1000)}k</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default FinancialDashboard;