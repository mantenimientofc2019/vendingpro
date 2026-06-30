import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, doc, getDocs, setDoc, updateDoc,
  deleteDoc, addDoc, onSnapshot, query, orderBy
} from "firebase/firestore";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxxxYXTyiRmp85RFpwGmmuUqQsi8UZKueo1asytWdtyuMbU4Oj7JYa3EGrG9Pzf8O9V/exec";

const DEFAULT_CATEGORIES = ["Bebidas frías", "Café e infusiones", "Snacks dulces", "Snacks salados", "Otros"];

const Icon = ({ name, size = 18 }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    sheets: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    sync: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    back: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    visit: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    money: <><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 15 12 15a2.5 2.5 0 002.5-2.5"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    machine: <><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 6h10M7 10h10M7 14h5"/><circle cx="16" cy="15" r="2"/></>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    box: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></>,
    spinner: <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
    tag: <><path d="M20.59 13.41L11.41 22.59a2 2 0 01-2.83 0L1 16V4a2 2 0 012-2h12l5.59 5.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    chevron: <polyline points="6 9 12 15 18 9"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #090e1a; --surf: #101623; --surf2: #18202f; --bdr: #1c2a3e;
    --acc: #00d4ff; --acc2: #7c3aed; --grn: #10b981; --red: #ef4444; --ylw: #f59e0b;
    --txt: #e2e8f0; --mut: #56677a;
    --sb-w: 220px; --sb-w-col: 62px;
    --font: 'Sora', sans-serif; --mono: 'JetBrains Mono', monospace;
  }
  body { font-family: var(--font); background: var(--bg); color: var(--txt); min-height: 100vh; }
  .sb { position:fixed; top:0; left:0; height:100vh; z-index:100; width:var(--sb-w-col); background:var(--surf); border-right:1px solid var(--bdr); display:flex; flex-direction:column; transition:width 0.25s cubic-bezier(.4,0,.2,1); overflow:hidden; }
  .sb.open { width: var(--sb-w); }
  .sb-head { height:60px; flex-shrink:0; display:flex; align-items:center; gap:10px; padding:0 14px; border-bottom:1px solid var(--bdr); }
  .sb-logo { width:34px; height:34px; flex-shrink:0; border-radius:10px; background:linear-gradient(135deg,var(--acc),var(--acc2)); display:flex; align-items:center; justify-content:center; font-size:17px; }
  .sb-brand { white-space:nowrap; overflow:hidden; opacity:0; transition:opacity 0.15s 0s; font-size:15px; font-weight:700; }
  .sb-brand span { color:var(--acc); }
  .sb.open .sb-brand { opacity:1; transition-delay:0.1s; }
  .sb-nav { flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; overflow-x:hidden; }
  .nav-section-label { font-size:9px; font-weight:700; color:var(--mut); text-transform:uppercase; letter-spacing:1px; padding:8px 10px 4px; opacity:0; transition:opacity 0.1s; white-space:nowrap; }
  .sb.open .nav-section-label { opacity:1; transition-delay:0.08s; }
  .nav-item { display:flex; align-items:center; gap:10px; height:40px; border-radius:8px; padding:0 10px; cursor:pointer; border:none; background:none; width:100%; color:var(--mut); font-size:13px; font-weight:500; font-family:var(--font); white-space:nowrap; transition:background 0.15s,color 0.15s; }
  .nav-item:hover { background:var(--surf2); color:var(--txt); }
  .nav-item.active { background:rgba(0,212,255,0.1); color:var(--acc); }
  .nav-icon { flex-shrink:0; display:flex; }
  .nav-label { opacity:0; transition:opacity 0.1s; overflow:hidden; }
  .sb.open .nav-label { opacity:1; transition-delay:0.08s; }
  .sb-footer { padding:10px 8px; border-top:1px solid var(--bdr); display:flex; flex-direction:column; gap:4px; }
  .user-row { display:flex; align-items:center; gap:10px; padding:6px; border-radius:8px; overflow:hidden; }
  .uavatar { width:34px; height:34px; flex-shrink:0; border-radius:9px; background:linear-gradient(135deg,var(--acc2),var(--acc)); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; }
  .uinfo { white-space:nowrap; overflow:hidden; opacity:0; transition:opacity 0.1s; }
  .sb.open .uinfo { opacity:1; transition-delay:0.08s; }
  .uname { font-size:13px; font-weight:600; }
  .urole { font-size:10px; color:var(--mut); }
  .logout-btn { display:flex; align-items:center; justify-content:center; gap:8px; height:36px; border-radius:8px; border:1px solid rgba(239,68,68,.25); background:rgba(239,68,68,.08); color:var(--red); cursor:pointer; font-family:var(--font); font-size:12px; font-weight:600; width:100%; white-space:nowrap; overflow:hidden; transition:all 0.15s; padding:0 10px; }
  .logout-btn:hover { border-color:var(--red); background:rgba(239,68,68,.18); }
  .logout-txt { opacity:0; transition:opacity 0.1s; }
  .sb.open .logout-txt { opacity:1; transition-delay:0.08s; }
  .sb-toggle { position:fixed; top:14px; left:14px; z-index:101; width:34px; height:34px; border-radius:8px; background:var(--surf); border:1px solid var(--bdr); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--mut); transition:all 0.15s; }
  .sb-toggle:hover { color:var(--acc); border-color:var(--acc); }
  .main { margin-left:var(--sb-w-col); transition:margin-left 0.25s cubic-bezier(.4,0,.2,1); padding:24px 28px; min-height:100vh; }
  .main.shifted { margin-left:var(--sb-w); }
  .loading-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; background:var(--bg); }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:radial-gradient(ellipse at 30% 50%,#0d1f3c,var(--bg) 65%); }
  .login-card { background:var(--surf); border:1px solid var(--bdr); border-radius:18px; padding:44px 36px; width:400px; box-shadow:0 24px 70px rgba(0,0,0,0.5); animation:up .4s ease; }
  @keyframes up { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  .login-logo { display:flex; align-items:center; gap:12px; margin-bottom:32px; }
  .login-logo-icon { width:46px; height:46px; background:linear-gradient(135deg,var(--acc),var(--acc2)); border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:21px; }
  .login-logo h1 { font-size:21px; font-weight:700; letter-spacing:-.5px; }
  .login-logo h1 span { color:var(--acc); }
  .login-sub { color:var(--mut); font-size:12px; margin-top:2px; }
  .fg { margin-bottom:16px; }
  .fg label { display:block; font-size:11px; font-weight:600; color:var(--mut); text-transform:uppercase; letter-spacing:.8px; margin-bottom:6px; }
  .fg input,.fg select,.fg textarea { width:100%; background:var(--surf2); border:1px solid var(--bdr); border-radius:9px; padding:11px 14px; color:var(--txt); font-family:var(--font); font-size:13px; outline:none; transition:border-color .2s,box-shadow .2s; }
  .fg input:focus,.fg select:focus,.fg textarea:focus { border-color:var(--acc); box-shadow:0 0 0 3px rgba(0,212,255,.08); }
  .fg select option { background:var(--surf2); }
  .fg textarea { resize:vertical; min-height:76px; }
  .btn { display:inline-flex; align-items:center; gap:7px; padding:10px 18px; border-radius:9px; font-family:var(--font); font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .2s; }
  .btn-p { background:linear-gradient(135deg,var(--acc),#0096cc); color:#000; box-shadow:0 4px 14px rgba(0,212,255,.25); }
  .btn-p:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,212,255,.35); }
  .btn-s { background:var(--surf2); color:var(--txt); border:1px solid var(--bdr); }
  .btn-s:hover { border-color:var(--acc); color:var(--acc); }
  .btn-d { background:rgba(239,68,68,.1); color:var(--red); border:1px solid rgba(239,68,68,.25); }
  .btn-d:hover { background:rgba(239,68,68,.2); }
  .btn-full { width:100%; justify-content:center; }
  .err { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); color:var(--red); padding:9px 13px; border-radius:8px; font-size:13px; margin-bottom:14px; }
  .ph { margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .ph-left h2 { font-size:22px; font-weight:700; letter-spacing:-.4px; }
  .ph-left p { color:var(--mut); font-size:13px; margin-top:3px; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:24px; }
  .sc { background:var(--surf); border:1px solid var(--bdr); border-radius:13px; padding:18px; position:relative; overflow:hidden; }
  .sc::before { content:''; position:absolute; top:0;left:0;right:0;height:3px; background:linear-gradient(90deg,var(--acc),var(--acc2)); }
  .sc-v { font-size:28px; font-weight:700; font-family:var(--mono); letter-spacing:-1px; }
  .sc-l { font-size:11px; color:var(--mut); margin-top:3px; text-transform:uppercase; letter-spacing:.5px; }
  .sc-i { position:absolute; top:16px; right:16px; color:var(--bdr); }
  .card { background:var(--surf); border:1px solid var(--bdr); border-radius:13px; overflow:hidden; margin-bottom:18px; }
  .ch { padding:16px 18px; border-bottom:1px solid var(--bdr); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
  .ct { font-size:14px; font-weight:700; }
  .tw { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  th { padding:11px 15px; text-align:left; font-size:10px; font-weight:700; color:var(--mut); text-transform:uppercase; letter-spacing:.8px; background:rgba(255,255,255,.02); border-bottom:1px solid var(--bdr); }
  td { padding:13px 15px; font-size:13px; border-bottom:1px solid rgba(28,42,62,.6); }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:rgba(255,255,255,.015); }
  .empty { text-align:center; padding:44px 20px; color:var(--mut); }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; animation:fi .2s ease; }
  @keyframes fi { from{opacity:0}to{opacity:1} }
  .modal { background:var(--surf); border:1px solid var(--bdr); border-radius:18px; width:100%; max-width:620px; max-height:90vh; overflow-y:auto; animation:up .3s ease; }
  .mh { padding:20px 24px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:var(--surf); z-index:1; border-bottom:1px solid var(--bdr); }
  .mt { font-size:17px; font-weight:700; }
  .mb { padding:22px 24px; }
  .frow { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .fsec { margin-bottom:22px; }
  .fst { font-size:10px; font-weight:700; color:var(--acc); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; padding-bottom:7px; border-bottom:1px solid rgba(0,212,255,.1); }
  .cg { display:flex; flex-wrap:wrap; gap:7px; }
  .ci { display:flex; align-items:center; gap:5px; padding:5px 11px; background:var(--surf2); border:1px solid var(--bdr); border-radius:7px; cursor:pointer; font-size:12px; transition:all .15s; }
  .ci:hover { border-color:var(--acc); }
  .ci.sel { background:rgba(0,212,255,.1); border-color:var(--acc); color:var(--acc); }
  .pr { display:flex; align-items:center; gap:9px; margin-bottom:9px; }
  .qi { width:72px; background:var(--surf2); border:1px solid var(--bdr); border-radius:7px; padding:7px 9px; color:var(--txt); font-family:var(--font); font-size:13px; outline:none; }
  .qi:focus { border-color:var(--acc); }
  .badge { display:inline-flex; align-items:center; gap:3px; padding:2px 9px; border-radius:20px; font-size:11px; font-weight:600; }
  .bg { background:rgba(16,185,129,.15); color:var(--grn); border:1px solid rgba(16,185,129,.25); }
  .br { background:rgba(239,68,68,.15); color:var(--red); border:1px solid rgba(239,68,68,.25); }
  .by { background:rgba(245,158,11,.15); color:var(--ylw); border:1px solid rgba(245,158,11,.25); }
  .bb { background:rgba(0,212,255,.1); color:var(--acc); border:1px solid rgba(0,212,255,.2); }
  .role-a { background:rgba(124,58,237,.2); color:#a78bfa; border:1px solid rgba(124,58,237,.3); font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; text-transform:uppercase; }
  .role-t { background:rgba(0,212,255,.1); color:var(--acc); border:1px solid rgba(0,212,255,.2); font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; text-transform:uppercase; }
  .fi { background:var(--surf2); border:1px solid var(--bdr); border-radius:8px; padding:8px 12px; color:var(--txt); font-family:var(--font); font-size:13px; outline:none; max-width:200px; min-width:0; }
  select.fi { appearance:auto; cursor:pointer; }
  .fi:focus { border-color:var(--acc); }
  .sync-bar { display:flex; align-items:center; gap:9px; padding:11px 14px; background:rgba(16,185,129,.05); border:1px solid rgba(16,185,129,.2); border-radius:9px; margin-bottom:18px; font-size:13px; }
  .dot { width:8px; height:8px; border-radius:50%; background:var(--grn); animation:pulse 2s infinite; flex-shrink:0; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.35} }
  .toast { position:fixed; bottom:20px; right:20px; z-index:300; background:var(--surf); border:1px solid var(--bdr); border-left:3px solid var(--grn); border-radius:11px; padding:12px 16px; display:flex; align-items:center; gap:9px; font-size:13px; font-weight:500; box-shadow:0 10px 36px rgba(0,0,0,.4); animation:si .3s ease; }
  @keyframes si { from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)} }
  .back-btn { display:inline-flex; align-items:center; gap:7px; color:var(--mut); font-size:13px; font-weight:500; cursor:pointer; background:none; border:none; font-family:var(--font); padding:0; margin-bottom:18px; transition:color .15s; }
  .back-btn:hover { color:var(--acc); }
  .drow { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--bdr); font-size:13px; }
  .drow:last-child { border-bottom:none; }
  .dk { color:var(--mut); }
  .dv { font-weight:500; max-width:58%; text-align:right; }
  .sbox { background:var(--surf2); border-radius:9px; padding:14px; margin-bottom:14px; }
  .tag { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:var(--surf2); border:1px solid var(--bdr); border-radius:6px; font-size:12px; }
  .tag-del { background:none; border:none; color:var(--mut); cursor:pointer; padding:0; display:flex; align-items:center; transition:color .15s; }
  .tag-del:hover { color:var(--red); }
  .actions { display:flex; gap:6px; }
  .cat-group { margin-bottom:16px; }
  .cat-group-title { display:flex; align-items:center; gap:7px; font-size:11px; font-weight:700; color:var(--acc); text-transform:uppercase; letter-spacing:.8px; margin-bottom:9px; padding-bottom:6px; border-bottom:1px solid rgba(0,212,255,.12); }
  .cat-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; background:rgba(124,58,237,.12); border:1px solid rgba(124,58,237,.25); border-radius:20px; font-size:11px; color:#a78bfa; font-weight:600; }
  .cat-pill-del { background:none; border:none; color:#a78bfa; cursor:pointer; padding:0; display:flex; align-items:center; opacity:.7; }
  .cat-pill-del:hover { opacity:1; color:var(--red); }
`;

// ── SEED inicial en Firestore si no hay datos ──────────────────────────────
const SEED_USERS = [
  { username:"admin", password:"admin123", name:"Administrador", role:"admin" },
  { username:"tecnico1", password:"tec123", name:"Carlos Martínez", role:"tecnico" },
];
const SEED_MACHINES = [
  { id:"VM-001", location:"Oficina Central - Planta 1" },
];
const SEED_PRODUCTS = [
  { nombre:"Agua 50cl", categoria:"Bebidas frías" },
  { nombre:"Coca-Cola 33cl", categoria:"Bebidas frías" },
  { nombre:"Nestea 33cl", categoria:"Bebidas frías" },
  { nombre:"Fanta Naranja 33cl", categoria:"Bebidas frías" },
  { nombre:"Café Solo", categoria:"Café e infusiones" },
  { nombre:"Café con Leche", categoria:"Café e infusiones" },
  { nombre:"Chocolate", categoria:"Café e infusiones" },
  { nombre:"Chips Lay's", categoria:"Snacks salados" },
  { nombre:"Galletas María", categoria:"Snacks dulces" },
  { nombre:"Barrita Energética", categoria:"Snacks dulces" },
  { nombre:"Zumo Naranja", categoria:"Bebidas frías" },
  { nombre:"Agua con Gas", categoria:"Bebidas frías" },
];

async function seedIfEmpty() {
  const usersSnap = await getDocs(collection(db, "users"));
  if (!usersSnap.empty) return;
  for (const u of SEED_USERS) await addDoc(collection(db, "users"), u);
  for (const m of SEED_MACHINES) await setDoc(doc(db, "machines", m.id), { location: m.location });
  await setDoc(doc(db, "config", "products"), { list: SEED_PRODUCTS });
  await setDoc(doc(db, "config", "categories"), { list: DEFAULT_CATEGORIES });
}

// Normaliza productos antiguos (string) a {nombre, categoria}
function normalizeProducts(raw) {
  if (!raw) return [];
  return raw.map(p => typeof p === "string" ? { nombre: p, categoria: "Otros" } : p);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]); // [{nombre, categoria}]
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sbOpen, setSbOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [detailVisit, setDetailVisit] = useState(null);
  const [toast, setToast] = useState(null);
  const [fMachine, setFMachine] = useState("");
  const [fTech, setFTech] = useState("");
  const [fDate, setFDate] = useState("");
  const [loginData, setLoginData] = useState({ username:"", password:"" });
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  useEffect(() => {
    seedIfEmpty().then(() => {
      const unsubUsers = onSnapshot(collection(db, "users"), snap => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubMachines = onSnapshot(collection(db, "machines"), snap => {
        setMachines(snap.docs.map(d => ({ id: d.id, location: d.data().location })).sort((a,b)=>a.id.localeCompare(b.id)));
      });
      const unsubProducts = onSnapshot(doc(db, "config", "products"), snap => {
        if (snap.exists()) setProducts(normalizeProducts(snap.data().list));
      });
      const unsubCategories = onSnapshot(doc(db, "config", "categories"), snap => {
        setCategories(snap.exists() ? (snap.data().list || DEFAULT_CATEGORIES) : DEFAULT_CATEGORIES);
      });
      const unsubVisits = onSnapshot(query(collection(db, "visits"), orderBy("createdAt", "desc")), snap => {
        setVisits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      setLoading(false);
      return () => { unsubUsers(); unsubMachines(); unsubProducts(); unsubCategories(); unsubVisits(); };
    });
  }, []);

  const doLogin = async () => {
    setLoginLoading(true);
    const found = users.find(u => u.username === loginData.username && u.password === loginData.password);
    if (found) {
      setUser(found);
      setPage(found.role === "admin" ? "dashboard" : "mis-visitas");
      setLoginErr("");
    } else setLoginErr("Usuario o contraseña incorrectos");
    setLoginLoading(false);
  };
  const doLogout = () => { setUser(null); setPage("dashboard"); setSbOpen(false); };

  const addVisit = async (v) => {
    const newVisit = { ...v, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, "visits"), newVisit);
    setPage("mis-visitas");
    notify("Visita guardada — sincronizando...");
    const machine = machines.find(m => m.id === newVisit.machineId);
    const payload = {
      id: docRef.id,
      fecha: new Date(newVisit.createdAt).toLocaleString("es-ES"),
      tecnico: newVisit.techName,
      maquina: newVisit.machineId,
      ubicacion: machine?.location || "",
      recaudacion: newVisit.recaudacion ? "Sí" : "No",
      importe: newVisit.recaudacion ? Number(newVisit.importe).toFixed(2) : "0.00",
      reposicion: newVisit.reposicion ? "Sí" : "No",
      productos: newVisit.productos?.map(p => p.nombre+"("+p.cantidad+")").join(", ") || "",
      incidencia: newVisit.incidencia && newVisit.incidenciaDesc ? "Sí" : "No",
      descripcion: newVisit.incidenciaDesc || "",
    };
    try {
      await fetch(SHEETS_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      notify("✓ Visita sincronizada con Google Sheets");
    } catch {
      notify("⚠ Guardada en Firebase — sin conexión a Sheets");
    }
  };

  const saveUser = async (f, id) => {
    if (id) await updateDoc(doc(db, "users", id), f);
    else await addDoc(collection(db, "users"), f);
    setModal(null);
    notify(id ? "Usuario actualizado" : "Usuario creado");
  };
  const deleteUser = async (id) => {
    if (window.confirm("¿Eliminar este usuario?")) { await deleteDoc(doc(db, "users", id)); notify("Usuario eliminado"); }
  };

  const saveMachine = async (f, id) => {
    if (id) await updateDoc(doc(db, "machines", id), { location: f.location });
    else await setDoc(doc(db, "machines", f.id), { location: f.location });
    setModal(null);
    notify(id ? "Máquina actualizada" : "Máquina añadida");
  };
  const deleteMachine = async (id) => {
    if (window.confirm("¿Eliminar la máquina "+id+"?")) { await deleteDoc(doc(db, "machines", id)); notify("Máquina eliminada"); }
  };

  const saveProducts = async (list) => { await setDoc(doc(db, "config", "products"), { list }); notify("Productos actualizados"); };
  const saveCategories = async (list) => { await setDoc(doc(db, "config", "categories"), { list }); notify("Categorías actualizadas"); };

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">
        <div className="spin" style={{color:"var(--acc)"}}><Icon name="spinner" size={32}/></div>
        <div style={{color:"var(--mut)",fontSize:14}}>Cargando VendingPro...</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">🏧</div>
            <div><h1>Vending<span>Pro</span></h1><div className="login-sub">Sistema de Gestión Integral</div></div>
          </div>
          {loginErr && <div className="err">⚠️ {loginErr}</div>}
          <div className="fg"><label>Usuario</label>
            <input placeholder="Tu usuario" value={loginData.username}
              onChange={e => setLoginData({...loginData, username:e.target.value})}
              onKeyDown={e => e.key==="Enter" && doLogin()} />
          </div>
          <div className="fg"><label>Contraseña</label>
            <input type="password" placeholder="Tu contraseña" value={loginData.password}
              onChange={e => setLoginData({...loginData, password:e.target.value})}
              onKeyDown={e => e.key==="Enter" && doLogin()} />
          </div>
          <button className="btn btn-p btn-full" style={{marginTop:4}} onClick={doLogin} disabled={loginLoading}>
            {loginLoading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </div>
      </div>
    </>
  );

  const navAdmin = [
    { section:"Principal" },
    { id:"dashboard", label:"Dashboard", icon:"dashboard" },
    { id:"visits", label:"Todas las Visitas", icon:"list" },
    { section:"Configuración" },
    { id:"users", label:"Usuarios", icon:"users" },
    { id:"mgmachines", label:"Máquinas", icon:"machine" },
    { id:"mgproducts", label:"Productos", icon:"box" },
    { id:"sheets", label:"Google Sheets", icon:"sheets" },
  ];
  const navTech = [
    { id:"mis-visitas", label:"Mis Visitas", icon:"list" },
    { id:"nueva-visita", label:"Nueva Visita", icon:"plus" },
  ];
  const nav = user.role === "admin" ? navAdmin : navTech;

  const fVisits = visits.filter(v => {
    if (fMachine && v.machineId !== fMachine) return false;
    if (fTech && !v.techName.toLowerCase().includes(fTech.toLowerCase())) return false;
    if (fDate && !v.createdAt.startsWith(fDate)) return false;
    return true;
  });
  const totalRec = visits.filter(v=>v.recaudacion).reduce((s,v)=>s+Number(v.importe||0),0);
  const incCount = visits.filter(v=>v.incidencia&&v.incidenciaDesc).length;
  const monthCount = visits.filter(v=>{ const d=new Date(v.createdAt),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length;

  return (
    <>
      <style>{css}</style>
      <button className="sb-toggle" onClick={()=>setSbOpen(o=>!o)}>
        <Icon name={sbOpen?"close":"menu"} size={16}/>
      </button>
      <aside className={"sb"+(sbOpen?" open":"")}>
        <div className="sb-head">
          <div className="sb-logo">🏧</div>
          <div className="sb-brand">Vending<span>Pro</span></div>
        </div>
        <nav className="sb-nav">
          {nav.map((item,i) =>
            item.section
              ? <div key={i} className="nav-section-label">{item.section}</div>
              : <button key={item.id} className={"nav-item"+(page===item.id?" active":"")}
                  onClick={()=>{setPage(item.id);setSbOpen(false);}}>
                  <span className="nav-icon"><Icon name={item.icon} size={17}/></span>
                  <span className="nav-label">{item.label}</span>
                </button>
          )}
        </nav>
        <div className="sb-footer">
          <div className="user-row">
            <div className="uavatar">{user.name[0]}</div>
            <div className="uinfo"><div className="uname">{user.name}</div><div className="urole">{user.role}</div></div>
          </div>
          <button className="logout-btn" onClick={doLogout} title="Cerrar sesión">
            <Icon name="logout" size={14}/>
            <span className="logout-txt">Cerrar sesión</span>
          </button>
        </div>
      </aside>
      {sbOpen && <div onClick={()=>setSbOpen(false)} style={{position:"fixed",inset:0,zIndex:99,background:"rgba(0,0,0,.4)"}}/>}

      <main className={"main"+(sbOpen?" shifted":"")}>

        {page==="mis-visitas" && user.role==="tecnico" && (
          <>
            <div className="ph">
              <div className="ph-left"><h2>Mis Visitas</h2><p>Historial de tus visitas registradas</p></div>
              <button className="btn btn-p" onClick={()=>setPage("nueva-visita")}><Icon name="plus" size={13}/>Nueva Visita</button>
            </div>
            <VisitTable visits={visits.filter(v=>v.techId===user.id)} onView={setDetailVisit}/>
          </>
        )}

        {page==="nueva-visita" && user.role==="tecnico" && (
          <>
            <button className="back-btn" onClick={()=>setPage("mis-visitas")}><Icon name="back" size={14}/>Volver a Mis Visitas</button>
            <VisitForm user={user} machines={machines} products={products} categories={categories} onSubmit={addVisit}/>
          </>
        )}

        {page==="dashboard" && user.role==="admin" && (
          <>
            <div className="ph"><div className="ph-left"><h2>Dashboard</h2><p>Resumen del sistema de gestión</p></div></div>
            <div className="stats">
              {[{v:visits.length,l:"Total Visitas",i:"visit"},{v:totalRec.toFixed(2)+" €",l:"Total Recaudado",i:"money"},{v:monthCount,l:"Visitas Este Mes",i:"machine"},{v:incCount,l:"Incidencias",i:"alert"}].map(s=>(
                <div className="sc" key={s.l}><div className="sc-v">{s.v}</div><div className="sc-l">{s.l}</div><div className="sc-i"><Icon name={s.i} size={26}/></div></div>
              ))}
            </div>
            <div className="sync-bar"><div className="dot"/><span style={{color:"var(--grn)",fontWeight:600}}>Firebase + Google Sheets activos</span><span style={{color:"var(--mut)"}}>— {visits.length} registros</span></div>
            <VisitTable visits={visits.slice(0,8)} onView={setDetailVisit} compact/>
          </>
        )}

        {page==="visits" && user.role==="admin" && (
          <>
            <div className="ph"><div className="ph-left"><h2>Todas las Visitas</h2><p>{visits.length} registros totales</p></div></div>
            <div className="card">
              <div className="ch">
                <span style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:600}}><Icon name="filter" size={13}/>Filtros</span>
                {(fMachine||fTech||fDate)&&<button className="btn btn-s" style={{padding:"5px 11px",fontSize:12}} onClick={()=>{setFMachine("");setFTech("");setFDate("");}}>Limpiar</button>}
              </div>
              <div style={{padding:"14px 18px",display:"flex",gap:9,flexWrap:"wrap"}}>
                <select className="fi" value={fMachine} onChange={e=>setFMachine(e.target.value)}>
                  <option value="">Todas las máquinas</option>
                  {machines.map(m=><option key={m.id} value={m.id}>{m.id} – {m.location}</option>)}
                </select>
                <input className="fi" style={{maxWidth:180}} placeholder="Buscar técnico..." value={fTech} onChange={e=>setFTech(e.target.value)}/>
                <input type="date" className="fi" value={fDate} onChange={e=>setFDate(e.target.value)}/>
              </div>
            </div>
            <VisitTable visits={fVisits} onView={setDetailVisit} showTech/>
          </>
        )}

        {page==="users" && user.role==="admin" && (
          <>
            <div className="ph">
              <div className="ph-left"><h2>Usuarios</h2><p>{users.length} usuarios registrados</p></div>
              <button className="btn btn-p" onClick={()=>setModal({type:"user",data:null})}><Icon name="plus" size={13}/>Nuevo Usuario</button>
            </div>
            <div className="card">
              <div className="tw">
                <table>
                  <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Visitas</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {users.map(u=>(
                      <tr key={u.id}>
                        <td style={{fontWeight:600}}>{u.name}</td>
                        <td style={{fontFamily:"var(--mono)",fontSize:12}}>{u.username}</td>
                        <td><span className={u.role==="admin"?"role-a":"role-t"}>{u.role}</span></td>
                        <td style={{fontFamily:"var(--mono)"}}>{visits.filter(v=>v.techId===u.id).length}</td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-s" style={{padding:"5px 10px",fontSize:12}} onClick={()=>setModal({type:"user",data:u})}><Icon name="edit" size={12}/>Editar</button>
                            {u.id!==user.id&&<button className="btn btn-d" style={{padding:"5px 10px",fontSize:12}} onClick={()=>deleteUser(u.id)}><Icon name="trash" size={12}/></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page==="mgmachines" && user.role==="admin" && (
          <>
            <div className="ph">
              <div className="ph-left"><h2>Máquinas</h2><p>{machines.length} máquinas registradas</p></div>
              <button className="btn btn-p" onClick={()=>setModal({type:"machine",data:null})}><Icon name="plus" size={13}/>Nueva Máquina</button>
            </div>
            <div className="card">
              <div className="tw">
                <table>
                  <thead><tr><th>ID</th><th>Ubicación</th><th>Visitas</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {machines.length===0
                      ? <tr><td colSpan={4}><div className="empty">No hay máquinas. Añade la primera.</div></td></tr>
                      : machines.map(m=>(
                        <tr key={m.id}>
                          <td style={{fontFamily:"var(--mono)",color:"var(--acc)",fontWeight:600}}>{m.id}</td>
                          <td>{m.location}</td>
                          <td style={{fontFamily:"var(--mono)"}}>{visits.filter(v=>v.machineId===m.id).length}</td>
                          <td>
                            <div className="actions">
                              <button className="btn btn-s" style={{padding:"5px 10px",fontSize:12}} onClick={()=>setModal({type:"machine",data:m})}><Icon name="edit" size={12}/>Editar</button>
                              <button className="btn btn-d" style={{padding:"5px 10px",fontSize:12}} onClick={()=>deleteMachine(m.id)}><Icon name="trash" size={12}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {page==="mgproducts" && user.role==="admin" && (
          <ProductsManager products={products} categories={categories} onSaveProducts={saveProducts} onSaveCategories={saveCategories} notify={notify}/>
        )}

        {page==="sheets" && user.role==="admin" && <SheetsView visits={visits} machines={machines}/>}

      </main>

      {modal?.type==="user" && (
        <UserModal data={modal.data} onSubmit={(f)=>saveUser(f, modal.data?.id)} onClose={()=>setModal(null)}/>
      )}
      {modal?.type==="machine" && (
        <MachineModal data={modal.data} onSubmit={(f)=>saveMachine(f, modal.data?.id)} onClose={()=>setModal(null)}/>
      )}
      {detailVisit && <DetailModal visit={detailVisit} machines={machines} onClose={()=>setDetailVisit(null)}/>}
      {toast && <div className="toast"><Icon name="check" size={15} style={{color:"var(--grn)"}}/>{toast}</div>}
    </>
  );
}

function VisitTable({ visits, onView, compact, showTech }) {
  return (
    <div className="card">
      <div className="tw">
        {visits.length===0
          ? <div className="empty">📋<br/>No hay visitas registradas aún</div>
          : <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  {(showTech||!compact)&&<th>Técnico</th>}
                  <th>Máquina</th><th>Recaudación</th><th>Reposición</th><th>Incidencia</th><th></th>
                </tr>
              </thead>
              <tbody>
                {visits.map(v=>(
                  <tr key={v.id}>
                    <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--mut)"}}>{new Date(v.createdAt).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
                    {(showTech||!compact)&&<td style={{fontWeight:600}}>{v.techName}</td>}
                    <td><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--acc)"}}>{v.machineId}</span></td>
                    <td>{v.recaudacion?<span className="badge bg">✓ {Number(v.importe||0).toFixed(2)} €</span>:<span className="badge br">✗ No</span>}</td>
                    <td>{v.reposicion?<span className="badge bb">✓ {v.productos?.length||0} prod.</span>:<span style={{color:"var(--mut)",fontSize:12}}>—</span>}</td>
                    <td>{v.incidencia&&v.incidenciaDesc?<span className="badge by">⚠ Sí</span>:<span style={{color:"var(--mut)",fontSize:12}}>—</span>}</td>
                    <td><button className="btn btn-s" style={{padding:"5px 10px",fontSize:12}} onClick={()=>onView(v)}><Icon name="eye" size={12}/>Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}

function VisitForm({ user, machines, products, categories, onSubmit }) {
  const [f, setF] = useState({machineId:"",recaudacion:false,importe:"",reposicion:false,incidencia:false,incidenciaDesc:""});
  const [prods, setProds] = useState({});
  const [openCat, setOpenCat] = useState(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (p) => setProds(prev=>{if(prev[p]){const n={...prev};delete n[p];return n;}return{...prev,[p]:1};});

  // Agrupar productos por categoría
  const grouped = {};
  products.forEach(p => {
    const cat = p.categoria || "Otros";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p.nombre);
  });
  const orderedCats = categories.filter(c => grouped[c]?.length).concat(
    Object.keys(grouped).filter(c => !categories.includes(c))
  );

  const submit = async () => {
    if(!f.machineId){setErr("Selecciona una máquina");return;}
    setSaving(true);
    await onSubmit({techId:user.id,techName:user.name,...f,productos:Object.entries(prods).map(([nombre,cantidad])=>({nombre,cantidad}))});
    setSaving(false);
  };

  return (
    <div>
      <div className="ph"><div className="ph-left"><h2>Nueva Visita</h2><p>Registra los datos de la visita a la máquina</p></div></div>
      <div className="card"><div style={{padding:"20px 22px"}}>
        {err&&<div className="err">{err}</div>}
        <div className="fsec">
          <div className="fst">📍 Identificación</div>
          <div className="frow">
            <div className="fg"><label>Técnico</label><input value={user.name} disabled style={{opacity:.6}}/></div>
            <div className="fg"><label>Máquina *</label>
              <select value={f.machineId} onChange={e=>setF({...f,machineId:e.target.value})}>
                <option value="">Selecciona máquina...</option>
                {machines.map(m=><option key={m.id} value={m.id}>{m.id} — {m.location}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="fsec">
          <div className="fst">💰 Recaudación</div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginBottom:11}}>
            <input type="checkbox" checked={f.recaudacion} onChange={e=>setF({...f,recaudacion:e.target.checked})}/>¿Se ha recaudado?
          </label>
          {f.recaudacion&&<div className="fg" style={{maxWidth:180}}><label>Importe (€)</label><input type="number" min="0" step="0.01" placeholder="0.00" value={f.importe} onChange={e=>setF({...f,importe:e.target.value})}/></div>}
        </div>
        <div className="fsec">
          <div className="fst">📦 Reposición — por categoría</div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginBottom:11}}>
            <input type="checkbox" checked={f.reposicion} onChange={e=>setF({...f,reposicion:e.target.checked})}/>¿Se han repuesto productos?
          </label>
          {f.reposicion&&(
            <>
              {orderedCats.length===0 && <div style={{fontSize:13,color:"var(--mut)",marginBottom:10}}>No hay productos configurados todavía.</div>}
              {orderedCats.map(cat=>{
                const isOpen = openCat===cat;
                const seleccionadosEnCat = grouped[cat].filter(p=>prods[p]).length;
                return (
                  <div key={cat} className="cat-group">
                    <div className="cat-group-title" style={{cursor:"pointer",justifyContent:"space-between",display:"flex"}} onClick={()=>setOpenCat(isOpen?null:cat)}>
                      <span style={{display:"flex",alignItems:"center",gap:7}}>
                        <Icon name="tag" size={12}/>{cat}
                        {seleccionadosEnCat>0 && <span className="badge bb" style={{marginLeft:4}}>{seleccionadosEnCat}</span>}
                      </span>
                      <span style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform .15s"}}><Icon name="chevron" size={14}/></span>
                    </div>
                    {isOpen && (
                      <div className="cg" style={{marginBottom:12}}>
                        {grouped[cat].map(p=>(
                          <div key={p} className={"ci"+(prods[p]?" sel":"")} onClick={()=>toggle(p)}>
                            {prods[p]&&<Icon name="check" size={11}/>} {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {Object.keys(prods).length>0&&<div style={{marginTop:6}}>
                <div style={{fontSize:11,color:"var(--mut)",marginBottom:7,fontWeight:600}}>Cantidades a reponer:</div>
                {Object.keys(prods).map(p=>(
                  <div key={p} className="pr">
                    <span style={{fontSize:13,flex:1}}>{p}</span>
                    <input className="qi" type="number" min="1" value={prods[p]} onChange={e=>setProds(prev=>({...prev,[p]:Number(e.target.value)}))}/>
                    <span style={{fontSize:12,color:"var(--mut)"}}>unid.</span>
                  </div>
                ))}
              </div>}
            </>
          )}
        </div>
        <div className="fsec">
          <div className="fst">⚠️ Incidencias</div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginBottom:11}}>
            <input type="checkbox" checked={f.incidencia} onChange={e=>setF({...f,incidencia:e.target.checked})}/>¿Hay alguna incidencia?
          </label>
          {f.incidencia&&<div className="fg"><label>Descripción</label><textarea placeholder="Describe el problema..." value={f.incidenciaDesc} onChange={e=>setF({...f,incidenciaDesc:e.target.value})}/></div>}
        </div>
        <button className="btn btn-p" onClick={submit} disabled={saving}>
          <Icon name="sync" size={13}/>{saving?"Guardando...":"Guardar y Sincronizar"}
        </button>
      </div></div>
    </div>
  );
}

function UserModal({ data, onSubmit, onClose }) {
  const [f, setF] = useState(data?{name:data.name,username:data.username,password:data.password,role:data.role}:{name:"",username:"",password:"",role:"tecnico"});
  const [err, setErr] = useState("");
  const submit = () => {if(!f.name||!f.username||!f.password){setErr("Todos los campos son obligatorios");return;}onSubmit(f);};
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:440}}>
        <div className="mh"><div className="mt">{data?"Editar Usuario":"Nuevo Usuario"}</div><button className="btn btn-s" style={{padding:"5px 9px"}} onClick={onClose}><Icon name="close" size={13}/></button></div>
        <div className="mb">
          {err&&<div className="err">{err}</div>}
          <div className="fg"><label>Nombre completo</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>
          <div className="fg"><label>Usuario (login)</label><input value={f.username} onChange={e=>setF({...f,username:e.target.value})}/></div>
          <div className="fg"><label>Contraseña</label><input type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></div>
          <div className="fg"><label>Rol</label><select value={f.role} onChange={e=>setF({...f,role:e.target.value})}><option value="tecnico">Técnico</option><option value="admin">Administrador</option></select></div>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
            <button className="btn btn-s" onClick={onClose}>Cancelar</button>
            <button className="btn btn-p" onClick={submit}><Icon name="check" size={13}/>{data?"Guardar cambios":"Crear usuario"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MachineModal({ data, onSubmit, onClose }) {
  const [f, setF] = useState(data?{id:data.id,location:data.location}:{id:"",location:""});
  const [err, setErr] = useState("");
  const submit = () => {if(!f.id||!f.location){setErr("Todos los campos son obligatorios");return;}onSubmit(f);};
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:440}}>
        <div className="mh"><div className="mt">{data?"Editar Máquina":"Nueva Máquina"}</div><button className="btn btn-s" style={{padding:"5px 9px"}} onClick={onClose}><Icon name="close" size={13}/></button></div>
        <div className="mb">
          {err&&<div className="err">{err}</div>}
          <div className="fg"><label>ID de la máquina</label><input placeholder="Ej: VM-006" value={f.id} disabled={!!data} style={data?{opacity:.6}:{}} onChange={e=>setF({...f,id:e.target.value.toUpperCase()})}/></div>
          <div className="fg"><label>Ubicación</label><input placeholder="Ej: Centro Comercial Norte" value={f.location} onChange={e=>setF({...f,location:e.target.value})}/></div>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
            <button className="btn btn-s" onClick={onClose}>Cancelar</button>
            <button className="btn btn-p" onClick={submit}><Icon name="check" size={13}/>{data?"Guardar cambios":"Añadir máquina"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsManager({ products, categories, onSaveProducts, onSaveCategories, notify }) {
  const [list, setList] = useState(products);
  const [cats, setCats] = useState(categories);
  const [newProd, setNewProd] = useState("");
  const [newProdCat, setNewProdCat] = useState("");
  const [newCat, setNewCat] = useState("");

  useEffect(() => setList(products), [products]);
  useEffect(() => { setCats(categories); if(!newProdCat && categories.length) setNewProdCat(categories[0]); }, [categories]);

  const addCategory = () => {
    const c = newCat.trim();
    if (!c) return;
    if (cats.includes(c)) { notify("⚠ Esa categoría ya existe"); return; }
    const updated = [...cats, c];
    setCats(updated);
    onSaveCategories(updated);
    setNewCat("");
  };
  const removeCategory = (c) => {
    const enUso = list.some(p => p.categoria === c);
    if (enUso) { notify("⚠ Hay productos usando esa categoría, reasígnalos primero"); return; }
    if (window.confirm("¿Eliminar la categoría \""+c+"\"?")) {
      const updated = cats.filter(x=>x!==c);
      setCats(updated);
      onSaveCategories(updated);
    }
  };

  const addProduct = () => {
    const p = newProd.trim();
    if (!p) return;
    if (!newProdCat) { notify("⚠ Crea primero una categoría"); return; }
    if (list.some(x=>x.nombre===p)) { notify("⚠ Ese producto ya existe"); return; }
    const updated = [...list, { nombre:p, categoria:newProdCat }];
    setList(updated);
    onSaveProducts(updated);
    setNewProd("");
  };
  const removeProduct = (nombre) => {
    if (window.confirm("¿Eliminar \""+nombre+"\"?")) {
      const updated = list.filter(x=>x.nombre!==nombre);
      setList(updated);
      onSaveProducts(updated);
    }
  };
  const changeProductCategory = (nombre, categoria) => {
    const updated = list.map(x => x.nombre===nombre ? {...x, categoria} : x);
    setList(updated);
    onSaveProducts(updated);
  };

  const grouped = {};
  list.forEach(p => { const c=p.categoria||"Otros"; if(!grouped[c]) grouped[c]=[]; grouped[c].push(p.nombre); });

  return (
    <>
      <div className="ph"><div className="ph-left"><h2>Productos</h2><p>{list.length} productos en {cats.length} categorías</p></div></div>

      <div className="card" style={{marginBottom:18}}>
        <div className="ch"><div className="ct">🏷️ Categorías</div></div>
        <div style={{padding:"16px 18px"}}>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <input style={{flex:1,background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:9,padding:"10px 14px",color:"var(--txt)",fontFamily:"var(--font)",fontSize:13,outline:"none"}}
              placeholder="Nueva categoría, ej: Bebidas calientes"
              value={newCat} onChange={e=>setNewCat(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addCategory()}/>
            <button className="btn btn-p" onClick={addCategory}><Icon name="plus" size={13}/>Añadir</button>
          </div>
          <div className="cg">
            {cats.map(c=>(
              <div key={c} className="cat-pill">
                {c}
                <button className="cat-pill-del" onClick={()=>removeCategory(c)} title="Eliminar"><Icon name="close" size={11}/></button>
              </div>
            ))}
            {cats.length===0 && <div style={{fontSize:13,color:"var(--mut)"}}>Crea tu primera categoría arriba.</div>}
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:18}}>
        <div className="ch"><div className="ct">➕ Añadir producto</div></div>
        <div style={{padding:"16px 18px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <input style={{flex:1,minWidth:180,background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:9,padding:"10px 14px",color:"var(--txt)",fontFamily:"var(--font)",fontSize:13,outline:"none"}}
            placeholder="Nombre del producto..."
            value={newProd} onChange={e=>setNewProd(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addProduct()}/>
          <select className="fi" style={{maxWidth:200}} value={newProdCat} onChange={e=>setNewProdCat(e.target.value)}>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-p" onClick={addProduct}><Icon name="plus" size={13}/>Añadir</button>
        </div>
      </div>

      <div className="card">
        <div className="ch"><div className="ct">📦 Catálogo por categoría</div></div>
        <div style={{padding:"16px 18px"}}>
          {Object.keys(grouped).length===0
            ? <div style={{color:"var(--mut)",fontSize:13}}>No hay productos.</div>
            : Object.keys(grouped).sort().map(cat=>(
                <div key={cat} className="cat-group">
                  <div className="cat-group-title"><Icon name="tag" size={12}/>{cat} ({grouped[cat].length})</div>
                  <div className="tw">
                    <table>
                      <tbody>
                        {grouped[cat].map(nombre=>(
                          <tr key={nombre}>
                            <td style={{width:"50%"}}>{nombre}</td>
                            <td>
                              <select className="fi" style={{maxWidth:170}} value={cat} onChange={e=>changeProductCategory(nombre, e.target.value)}>
                                {cats.map(c=><option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td style={{textAlign:"right"}}>
                              <button className="btn btn-d" style={{padding:"5px 10px",fontSize:12}} onClick={()=>removeProduct(nombre)}><Icon name="trash" size={12}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </>
  );
}

function DetailModal({ visit, machines, onClose }) {
  const machine = machines.find(m=>m.id===visit.machineId);
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:500}}>
        <div className="mh">
          <div><div className="mt">Detalle de Visita</div><div style={{fontSize:11,color:"var(--mut)",fontFamily:"var(--mono)"}}>#{visit.id}</div></div>
          <button className="btn btn-s" style={{padding:"5px 9px"}} onClick={onClose}><Icon name="close" size={13}/></button>
        </div>
        <div className="mb">
          <div className="sbox">
            <div className="drow"><span className="dk">Fecha</span><span className="dv">{new Date(visit.createdAt).toLocaleString("es-ES")}</span></div>
            <div className="drow"><span className="dk">Técnico</span><span className="dv" style={{fontWeight:700}}>{visit.techName}</span></div>
            <div className="drow"><span className="dk">Máquina</span><span className="dv" style={{color:"var(--acc)",fontFamily:"var(--mono)"}}>{visit.machineId}</span></div>
            <div className="drow"><span className="dk">Ubicación</span><span className="dv">{machine?.location||"—"}</span></div>
          </div>
          <div className="sbox">
            <div style={{fontWeight:700,marginBottom:9,fontSize:13}}>💰 Recaudación</div>
            {visit.recaudacion
              ? <><div className="drow"><span className="dk">Estado</span><span className="badge bg">Recaudado</span></div>
                  <div className="drow"><span className="dk">Importe</span><span className="dv" style={{color:"var(--grn)",fontFamily:"var(--mono)",fontSize:17}}>{Number(visit.importe).toFixed(2)} €</span></div></>
              : <div style={{color:"var(--mut)",fontSize:13}}>Sin recaudación</div>}
          </div>
          <div className="sbox">
            <div style={{fontWeight:700,marginBottom:9,fontSize:13}}>📦 Reposición</div>
            {visit.reposicion&&visit.productos?.length>0
              ? visit.productos.map((p,i)=><div key={i} className="drow"><span className="dk">{p.nombre}</span><span className="badge bb">{p.cantidad} unid.</span></div>)
              : <div style={{color:"var(--mut)",fontSize:13}}>Sin reposición</div>}
          </div>
          {visit.incidencia&&visit.incidenciaDesc&&(
            <div className="sbox" style={{border:"1px solid rgba(245,158,11,.3)",background:"rgba(245,158,11,.04)"}}>
              <div style={{fontWeight:700,marginBottom:7,fontSize:13,color:"var(--ylw)"}}>⚠️ Incidencia</div>
              <div style={{fontSize:13,lineHeight:1.6}}>{visit.incidenciaDesc}</div>
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"9px 13px",background:"rgba(16,185,129,.05)",borderRadius:7,border:"1px solid rgba(16,185,129,.2)"}}>
            <div className="dot" style={{animationPlayState:"paused"}}/><span style={{fontSize:12,color:"var(--grn)"}}>Guardado en Firebase + Google Sheets</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetsView({ visits, machines }) {
  return (
    <>
      <div className="ph"><div className="ph-left"><h2>Google Sheets</h2><p>Datos sincronizados automáticamente</p></div></div>
      <div className="sync-bar" style={{marginBottom:18}}>
        <div className="dot"/>
        <div><div style={{fontWeight:600,fontSize:13}}>Firebase + Sheets activos</div><div style={{fontSize:11,color:"var(--mut)"}}>Los datos se guardan en Firebase y se envían a tu hoja automáticamente.</div></div>
        <div style={{marginLeft:"auto",fontFamily:"var(--mono)",fontSize:22,fontWeight:700,color:"var(--grn)"}}>{visits.length}</div>
      </div>
      <div className="card">
        <div className="tw">
          <table>
            <thead><tr>{["ID","Fecha","Técnico","Máquina","Recaudación","Importe €","Reposición","Productos","Incidencia","Descripción"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {visits.length===0
                ? <tr><td colSpan={10} style={{textAlign:"center",color:"var(--mut)",padding:32}}>Los datos aparecerán cuando los técnicos registren visitas.</td></tr>
                : visits.map(v=>(
                    <tr key={v.id}>
                      <td style={{fontFamily:"var(--mono)",fontSize:11}}>#{v.id.slice(-6)}</td>
                      <td style={{fontSize:12}}>{new Date(v.createdAt).toLocaleString("es-ES")}</td>
                      <td>{v.techName}</td>
                      <td style={{fontFamily:"var(--mono)",color:"var(--acc)"}}>{v.machineId}</td>
                      <td>{v.recaudacion?"Sí":"No"}</td>
                      <td style={{fontFamily:"var(--mono)"}}>{v.recaudacion?Number(v.importe).toFixed(2):"—"}</td>
                      <td>{v.reposicion?"Sí":"No"}</td>
                      <td style={{fontSize:11}}>{v.productos?.map(p=>p.nombre+"("+p.cantidad+")").join(", ")||"—"}</td>
                      <td>{v.incidencia?"⚠️ Sí":"No"}</td>
                      <td style={{fontSize:12,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.incidenciaDesc||"—"}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
