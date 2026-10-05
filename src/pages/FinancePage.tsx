import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import { getApiErrorInfo } from "../api/errorHandling";
import { getStudents, type Student } from "../api/students";
import {
  createInvoice,
  listInvoices,
  listPayments,
  recordPayment,
  type Invoice,
  type InvoiceStatus,
  type Payment,
} from "../api/finance";

const statusOptions: Array<"" | InvoiceStatus> = ["", "OPEN", "PARTIALLY_PAID", "PAID"];

export default function FinancePage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(accessToken), [accessToken]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [status, setStatus] = useState<"" | InvoiceStatus>("");
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const refreshInvoices = useCallback(() => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    Promise.all([listInvoices(schoolId, { status: status || undefined }), getStudents({ page: 0, size: 100 })])
      .then(([invoicePage, studentPage]) => {
        setInvoices(invoicePage.content ?? []);
        setStudents(studentPage.content ?? []);
        setSelectedInvoiceId((current) =>
          current && invoicePage.content.some((item) => item.id === current)
            ? current
            : invoicePage.content[0]?.id ?? "",
        );
      })
      .catch((err) => setError(getApiErrorInfo(err).message))
      .finally(() => setLoading(false));
  }, [schoolId, status]);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      setError("Your session does not contain a school identifier.");
      return;
    }
    refreshInvoices();
  }, [schoolId, refreshInvoices]);

  useEffect(() => {
    if (!schoolId || !selectedInvoiceId) {
      setPayments([]);
      return;
    }
    setPaymentsLoading(true);
    setPaymentError(null);
    listPayments(schoolId, selectedInvoiceId)
      .then((page) => setPayments(page.content ?? []))
      .catch((err) => setPaymentError(getApiErrorInfo(err).message))
      .finally(() => setPaymentsLoading(false));
  }, [schoolId, selectedInvoiceId]);

  const selectedInvoice = invoices.find((item) => item.id === selectedInvoiceId);
  const studentName = (id: string) => {
    const student = students.find((item) => String(item.id) === id);
    return student ? [student.firstName, student.lastName].filter(Boolean).join(" ") || student.name || id : id;
  };

  const collected = invoices.reduce((sum, item) => sum + Number(item.paidAmount), 0);
  const outstanding = invoices.reduce((sum, item) => sum + Math.max(0, Number(item.amount) - Number(item.paidAmount)), 0);
  const pending = invoices.filter((item) => item.status !== "PAID").length;

  const submitInvoice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!schoolId) return;
    setSaving(true);
    setError(null);
    try {
      await createInvoice(schoolId, { studentId, invoiceNumber, dueDate, amount });
      setShowCreate(false);
      setInvoiceNumber("");
      setStudentId("");
      setDueDate("");
      setAmount("");
      refreshInvoices();
    } catch (err) {
      setError(getApiErrorInfo(err).message);
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!schoolId || !selectedInvoiceId) return;
    setSaving(true);
    setPaymentError(null);
    try {
      await recordPayment(schoolId, selectedInvoiceId, { paymentReference, amount: paymentAmount });
      setPaymentReference("");
      setPaymentAmount("");
      const page = await listPayments(schoolId, selectedInvoiceId);
      setPayments(page.content ?? []);
      refreshInvoices();
    } catch (err) {
      setPaymentError(getApiErrorInfo(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="page-section"><p className="state-message">Loading finance…</p></section>;

  return (
    <section className="page-section" aria-labelledby="finance-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Finance</p>
          <h1 id="finance-title">Finance</h1>
          <p className="subtitle">Manage verified fee invoices and payment activity.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowCreate((value) => !value)}>
          {showCreate ? "Close" : "Create invoice"}
        </button>
      </div>

      {error && <p className="state-message error" role="alert">{error}</p>}

      <div className="finance-summary">
        <article><strong>₹{collected.toLocaleString("en-IN")}</strong><span>Collected</span></article>
        <article><strong>₹{outstanding.toLocaleString("en-IN")}</strong><span>Outstanding</span></article>
        <article><strong>{pending}</strong><span>Open invoices</span></article>
      </div>

      {showCreate && (
        <form className="filter-bar" onSubmit={submitInvoice}>
          <label>Student<select required value={studentId} onChange={(event) => setStudentId(event.target.value)}>
            <option value="">Select student</option>
            {students.map((student) => <option key={String(student.id)} value={String(student.id)}>{studentName(String(student.id))}</option>)}
          </select></label>
          <label>Invoice number<input required value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} /></label>
          <label>Due date<input required type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
          <label>Amount<input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <button className="primary-button" disabled={saving} type="submit">{saving ? "Saving…" : "Create"}</button>
        </form>
      )}

      <div className="filter-bar">
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as "" | InvoiceStatus)}>
          {statusOptions.map((option) => <option key={option} value={option}>{option || "All statuses"}</option>)}
        </select></label>
      </div>

      <div className="table-card">
        <table>
          <thead><tr><th>Invoice</th><th>Student</th><th>Due date</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} onClick={() => setSelectedInvoiceId(invoice.id)} aria-selected={invoice.id === selectedInvoiceId}>
                <td>{invoice.invoiceNumber}</td>
                <td>{studentName(invoice.studentId)}</td>
                <td>{invoice.dueDate}</td>
                <td>₹{Number(invoice.amount).toLocaleString("en-IN")}</td>
                <td>₹{Number(invoice.paidAmount).toLocaleString("en-IN")}</td>
                <td><span className="badge">{invoice.status}</span></td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={6}>No invoices found.</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="finance-grid">
          <article className="academic-card">
            <p className="eyebrow">Selected invoice</p>
            <h2>{selectedInvoice.invoiceNumber}</h2>
            <p>{studentName(selectedInvoice.studentId)} · Due {selectedInvoice.dueDate}</p>
            <strong>Outstanding: ₹{Math.max(0, Number(selectedInvoice.amount) - Number(selectedInvoice.paidAmount)).toLocaleString("en-IN")}</strong>
          </article>
          <article className="academic-card">
            <p className="eyebrow">Record payment</p>
            {paymentError && <p className="state-message error" role="alert">{paymentError}</p>}
            <form onSubmit={submitPayment}>
              <label>Reference<input required value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} /></label>
              <label>Amount<input required min="0.01" step="0.01" type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
              <button className="primary-button" disabled={saving} type="submit">{saving ? "Saving…" : "Record payment"}</button>
            </form>
          </article>
        </div>
      )}

      <div className="table-card">
        <h2>Payment activity</h2>
        {paymentsLoading ? <p className="state-message">Loading payments…</p> : (
          <table>
            <thead><tr><th>Reference</th><th>Amount</th><th>Paid at</th><th>Status</th></tr></thead>
            <tbody>
              {payments.map((payment) => <tr key={payment.id}><td>{payment.paymentReference}</td><td>₹{Number(payment.amount).toLocaleString("en-IN")}</td><td>{payment.paidAt}</td><td><span className="badge">{payment.status}</span></td></tr>)}
              {payments.length === 0 && <tr><td colSpan={4}>No payments recorded for the selected invoice.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
