import { describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { listDocuments, listNotifications, markNotificationRead, publishDocument } from "./communication";
vi.mock("./client",()=>({apiClient:{get:vi.fn(),post:vi.fn()}}));
describe("communication api",()=>{
 it("lists current user notifications",async()=>{vi.mocked(apiClient.get).mockResolvedValueOnce({data:[]} as never);await listNotifications("s1");expect(apiClient.get).toHaveBeenCalledWith("/api/v1/schools/s1/notifications",{params:{limit:50}});});
 it("marks a notification read",async()=>{vi.mocked(apiClient.post).mockResolvedValueOnce({data:{}} as never);await markNotificationRead("s1","n1");expect(apiClient.post).toHaveBeenCalledWith("/api/v1/schools/s1/notifications/n1/read");});
 it("lists published documents",async()=>{vi.mocked(apiClient.get).mockResolvedValueOnce({data:[]} as never);await listDocuments("s1");expect(apiClient.get).toHaveBeenCalledWith("/api/v1/schools/s1/documents",{params:{publishedOnly:true,limit:50}});});
 it("publishes a document",async()=>{vi.mocked(apiClient.post).mockResolvedValueOnce({data:{}} as never);await publishDocument("s1","d1");expect(apiClient.post).toHaveBeenCalledWith("/api/v1/schools/s1/documents/d1/publish");});
});
