import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { signOut } from "./logout";
describe("logout workflow", () => {
  it("clears private data and mutations and replaces the page with login", () => {
    const client = new QueryClient();
    client.setQueryData(["students", "school-one"], [{name:"Private student"}]);
    const logout = vi.fn(); const navigate = vi.fn();
    signOut(client, logout, navigate);
    expect(logout).toHaveBeenCalledOnce();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
    expect(navigate).toHaveBeenCalledWith("/login", {replace:true});
  });
});
