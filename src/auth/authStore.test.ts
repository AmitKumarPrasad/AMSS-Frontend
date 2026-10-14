import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
const {loginApi}=vi.hoisted(()=>({loginApi:vi.fn()}));
vi.mock("../api/auth",()=>({login:loginApi}));
let store: typeof import("./authStore").useAuthStore;
const memory=new Map<string,string>();
const token=()=>`header.${btoa(JSON.stringify({sub:"school-admin",school_id:"school-one",roles:["SCHOOL_ADMIN"],exp:Math.floor(Date.now()/1000)+1800}))}.signature`;
beforeAll(async()=>{
 vi.stubGlobal("sessionStorage",{getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value),removeItem:(key:string)=>memory.delete(key)});
 store=(await import("./authStore")).useAuthStore;
});
beforeEach(()=>{store.getState().logout();loginApi.mockReset();});
describe("session logout",()=>{
 it("removes the authenticated identity and persisted token after sign-in",async()=>{
  loginApi.mockResolvedValue({accessToken:token()});
  await store.getState().login({username:"school-admin",password:"test-password"});
  expect(store.getState().isAuthenticated).toBe(true);
  store.getState().logout();
  expect(store.getState()).toMatchObject({accessToken:null,user:null,isAuthenticated:false});
  expect(JSON.parse(memory.get("amss-auth")!).state).toEqual({accessToken:null,user:null,isAuthenticated:false});
 });
 it("does not restore a session when an older login finishes after logout",async()=>{
  let resolve!:(value:{accessToken:string})=>void;
  loginApi.mockReturnValue(new Promise(r=>{resolve=r;}));
  const attempt=store.getState().login({username:"school-admin",password:"test-password"});
  store.getState().logout();resolve({accessToken:token()});
  await expect(attempt).rejects.toThrow("session changed");
  expect(store.getState()).toMatchObject({accessToken:null,user:null,isAuthenticated:false});
 });
});
