import { useState } from "react";

type FinanceTab = "overview" | "fees" | "payments";

const feeRows = [
  { student: "Student records", type: "Tuition", due: "₹25,000", status: "Pending" },
  { student: "Student records", type: "Transport", due: "₹8,000", status: "Pending" },
  { student: "Student records", type: "Annual fee", due: "₹12,000", status: "Paid" },
];

const payments = [
  { reference: "PAY-1001", amount: "₹25,000", method: "Online", status: "SUCCESS" },
  { reference: "PAY-1002", amount: "₹12,000", method: "Online", status: "SUCCESS" },
  { reference: "PAY-1003", amount: "₹8,000", method: "Offline", status: "PENDING" },
];

export default function FinancePage() {
  const [tab, setTab] = useState<FinanceTab>("overview");

  return (
    <section className="page-section" aria-labelledby="finance-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Finance</p>
          <h1 id="finance-title">Finance</h1>
          <p className="subtitle">Monitor fee collections, outstanding balances and payment activity.</p>
        </div>
      </div>

      <div className="finance-summary">
        <article><strong>₹1.25L</strong><span>Collected this period</span></article>
        <article><strong>₹45K</strong><span>Outstanding</span></article>
        <article><strong>18</strong><span>Pending payments</span></article>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="Finance sections">
        <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button>
        <button type="button" className={tab === "fees" ? "active" : ""} onClick={() => setTab("fees")}>Fee Dues</button>
        <button type="button" className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>Payments</button>
      </div>

      {tab === "overview" && (
        <div className="finance-grid">
          <article className="academic-card"><p className="eyebrow">Collection health</p><h2>Fee collection</h2><p className="finance-copy">Track current collection progress and outstanding balances before reconciliation.</p><div className="progress-track"><span style={{ width: "74%" }} /></div><strong>74% collected</strong></article>
          <article className="academic-card"><p className="eyebrow">Actions</p><h2>Finance operations</h2><ul className="finance-list"><li>Review pending fee dues</li><li>Verify payment settlements</li><li>Export reconciliation data</li></ul></article>
        </div>
      )}

      {tab === "fees" && (
        <div className="table-card">
          <table><thead><tr><th>Record</th><th>Fee Type</th><th>Amount Due</th><th>Status</th></tr></thead>
          <tbody>{feeRows.map((row, index) => <tr key={index}><td>{row.student}</td><td>{row.type}</td><td>{row.due}</td><td><span className="badge">{row.status}</span></td></tr>)}</tbody></table>
        </div>
      )}

      {tab === "payments" && (
        <div className="table-card">
          <table><thead><tr><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
          <tbody>{payments.map((row) => <tr key={row.reference}><td>{row.reference}</td><td>{row.amount}</td><td>{row.method}</td><td><span className="badge">{row.status}</span></td></tr>)}</tbody></table>
        </div>
      )}

      <p className="state-message academic-note">Finance API wiring will be connected against the finalized backend fee and payment contracts; no undocumented endpoints are assumed.</p>
    </section>
  );
}
