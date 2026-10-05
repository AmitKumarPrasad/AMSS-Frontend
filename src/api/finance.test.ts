import { describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { createInvoice, listInvoices, listPayments, recordPayment } from "./finance";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("finance api", () => {
  it("lists invoices with optional status", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { content: [] } } as never);
    await listInvoices("school-1", { status: "OPEN" });
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/fees/invoices",
      { params: { page: 0, size: 50, status: "OPEN" } },
    );
  });

  it("creates an invoice", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "invoice-1" } } as never);
    const request = {
      studentId: "student-1",
      invoiceNumber: "INV-1001",
      dueDate: "2026-10-01",
      amount: "25000",
    };
    await createInvoice("school-1", request);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/fees/invoices",
      request,
    );
  });

  it("lists payments for an invoice", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { content: [] } } as never);
    await listPayments("school-1", "invoice-1");
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/fees/invoices/invoice-1/payments",
      { params: { page: 0, size: 50 } },
    );
  });

  it("records a payment", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "payment-1" } } as never);
    const request = { paymentReference: "PAY-1001", amount: "25000" };
    await recordPayment("school-1", "invoice-1", request);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/fees/invoices/invoice-1/payments",
      request,
    );
  });
});
