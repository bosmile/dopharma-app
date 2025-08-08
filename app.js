
const LS_KEY = "dopharma-static-v1";

const emptyStore = { products: [], licenses: [], tenders: [] };

let store = load();
let activeTab = "products";
let query = "";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function load() {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : emptyStore; } catch { return emptyStore; }
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(store)); }

function uid() { return Math.random().toString(36).slice(2,10); }
function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  const today = new Date(); const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((d.getTime() - start.getTime()) / (1000*60*60*24));
}

function render() {
  // Tabs
  $$(".tab-panel").forEach(p => p.classList.remove("active"));
  $(`#${activeTab}`).classList.add("active");
  $$(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === activeTab));

  // Search
  const q = query.toLowerCase();

  // Products
  const pBody = $("#pBody"); pBody.innerHTML = "";
  store.products
    .filter(p => [p.code, p.name, p.ingredient, p.maker].join(" ").toLowerCase().includes(q))
    .forEach(p => {
      const tr = document.createElement("tr");
      const exp = daysUntil(p.expDate);
      tr.innerHTML = `
        <td><strong>${p.code||""}</strong></td>
        <td>${p.name||""}</td>
        <td>${p.ingredient||""}</td>
        <td>${p.maker||""}</td>
        <td>${p.expDate ? `<span class="badge ${exp<=30?"warn":"ok"}">${p.expDate}${Number.isFinite(exp) ? ` (${exp} ngày)` : ""}</span>` : "—"}</td>
        <td class="actions-cell"><button title="Xóa" data-del="${p.id}">🗑</button></td>`;
      pBody.appendChild(tr);
    });

  // Licenses
  const lBody = $("#lBody"); lBody.innerHTML = "";
  store.licenses
    .filter(l => [l.code, l.name, l.agency, l.status].join(" ").toLowerCase().includes(q))
    .forEach(l => {
      const tr = document.createElement("tr");
      const exp = daysUntil(l.expDate);
      tr.innerHTML = `
        <td><strong>${l.code||""}</strong></td>
        <td>${l.name||""}</td>
        <td>${l.agency||""}</td>
        <td>${l.expDate ? `<span class="badge ${exp<=30?"warn":"ok"}">${l.expDate}${Number.isFinite(exp) ? ` (${exp} ngày)` : ""}</span>` : "—"}</td>
        <td>${l.status||"—"}</td>
        <td class="actions-cell"><button title="Xóa" data-dell="${l.id}">🗑</button></td>`;
      lBody.appendChild(tr);
    });

  // Tenders
  const tBody = $("#tBody"); tBody.innerHTML = "";
  store.tenders
    .filter(t => [t.code, t.name, t.productName, t.productCode, t.result].join(" ").toLowerCase().includes(q))
    .forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${t.code||""}</strong></td>
        <td>${t.name||""}</td>
        <td>${t.date||""}</td>
        <td>${t.productName||""}</td>
        <td>${t.qty?.toLocaleString?.()||""}</td>
        <td>${t.bidPrice?.toLocaleString?.()||""}</td>
        <td>${t.winPrice?.toLocaleString?.()||""}</td>
        <td>${t.result ? (t.result==="Thắng"?"🏅":"") + t.result : "—"}</td>
        <td>${t.url ? `<a href="${t.url}" target="_blank">Mở</a>` : "—"}</td>
        <td class="actions-cell"><button title="Xóa" data-delt="${t.id}">🗑</button></td>`;
      tBody.appendChild(tr);
    });
}

function openForm(kind) {
  const dlg = $("#formDialog"); const fields = $("#formFields"); const title = $("#formTitle");
  dlg.returnValue = ""; fields.innerHTML = ""; title.textContent = "Thêm bản ghi";
  let formSpec = [];
  if (kind === "products") formSpec = [
    ["code","Mã SP","text"], ["name","Tên sản phẩm","text"], ["ingredient","Hoạt chất","text"], ["spec","Quy cách","text"],
    ["maker","Nhà sản xuất","text"], ["origin","Nước sản xuất","text"], ["regNo","Số ĐK","text"],
    ["regDate","Ngày đăng ký","date"], ["expDate","Ngày hết hạn","date"], ["note","Ghi chú","text","full"]
  ];
  if (kind === "licenses") formSpec = [
    ["code","Mã GP","text"], ["name","Tên giấy phép","text"], ["agency","Cơ quan cấp","text"],
    ["issueDate","Ngày cấp","date"], ["expDate","Ngày hết hạn","date"], ["status","Trạng thái","text"], ["note","Ghi chú","text","full"]
  ];
  if (kind === "tenders") formSpec = [
    ["code","Mã gói thầu","text"], ["name","Tên gói thầu","text"], ["date","Ngày tham gia","date"],
    ["productCode","Mã SP","text"], ["productName","Tên sản phẩm","text"],
    ["qty","Khối lượng","number"], ["bidPrice","Đơn giá chào (VNĐ)","number"], ["winPrice","Giá trúng thầu (VNĐ)","number"],
    ["result","Kết quả (Thắng/Thua/Đang chờ)","text"], ["url","Link gói thầu","text","full"], ["note","Ghi chú","text","full"]
  ];
  // Build inputs
  for (const [key,label,type,cls] of formSpec) {
    const wrap = document.createElement("div"); if (cls==="full") wrap.classList.add("full");
    const id = `f_${key}`;
    wrap.innerHTML = `<label for="${id}">${label}</label><input id="${id}" type="${type}" />`;
    fields.appendChild(wrap);
  }
  dlg.showModal();
  $("#saveBtn").onclick = () => {
    const obj = { id: uid() };
    for (const [key,label] of formSpec) {
      const el = document.getElementById(`f_${key}`);
      let v = el.value;
      if (key==='qty' || key==='bidPrice' || key==='winPrice') v = Number(v||0);
      obj[key] = v;
    }
    if (kind==="products") store.products.push(obj);
    if (kind==="licenses") store.licenses.push(obj);
    if (kind==="tenders") store.tenders.push(obj);
    save(); render();
  };
}

function init() {
  // Tabs
  $$(".tabs button").forEach(btn => btn.addEventListener("click", () => { activeTab = btn.dataset.tab; render(); }));
  // Toolbar
  $("#searchInput").addEventListener("input", (e)=>{ query = e.target.value; render(); });
  $("#addBtn").addEventListener("click", ()=> openForm(activeTab));
  // Export/Import
  $("#exportBtn").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(store,null,2)], {type: "application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "dopharma-data.json"; a.click(); URL.revokeObjectURL(url);
  });
  $("#importInput").addEventListener("change", async (e)=>{
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text(); store = JSON.parse(text); save(); render();
  });
  // Delete handlers (event delegation)
  document.body.addEventListener("click", (e)=>{
    const t = e.target;
    if (t.dataset?.del) { store.products = store.products.filter(x=>x.id!==t.dataset.del); save(); render(); }
    if (t.dataset?.dell) { store.licenses = store.licenses.filter(x=>x.id!==t.dataset.dell); save(); render(); }
    if (t.dataset?.delt) { store.tenders = store.tenders.filter(x=>x.id!==t.dataset.delt); save(); render(); }
  });

  render();
}

init();
