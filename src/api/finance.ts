import { apiClient } from "./client";

export type InvoiceStatus = "OPEN" | "PARTIALLY_PAID" | "PAID";

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceNumber: string;
  dueDate: string;
  amount: string;
  paidAmount: string;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentReference: string;
  amount: string;
  paidAt: string;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function listInvoices(
  schoolId: string,
  params: { page?: number; size?: number; status?: InvoiceStatus } = {},
): Promise<PageResponse<Invoice>> {
  const response = await apiClient.get<PageResponse<Invoice>>(
    `/api/v1/schools/${schoolId}/fees/invoices`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 50,
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return response.data;
}

export async function createInvoice(
  schoolId: string,
  request: { studentId: string; invoiceNumber: string; dueDate: string; amount: string },
): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(
    `/api/v1/schools/${schoolId}/fees/invoices`,
    request,
  );
  return response.data;
}

export async function listPayments(
  schoolId: string,
  invoiceId: string,
  params: { page?: number; size?: number } = {},
): Promise<PageResponse<Payment>> {
  const response = await apiClient.get<PageResponse<Payment>>(
    `/api/v1/schools/${schoolId}/fees/invoices/${invoiceId}/payments`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    },
  );
  return response.data;
}

export async function recordPayment(
  schoolId: string,
  invoiceId: string,
  request: { paymentReference: string; amount: string },
): Promise<Payment> {
  const response = await apiClient.post<Payment>(
    `/api/v1/schools/${schoolId}/fees/invoices/${invoiceId}/payments`,
    request,
  );
  return response.data;
}
