
const LS_KEY = "dopharma-static-v4";

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
    .filter(p => [
      p.name, p.code, p.ingredient, p.dosageForm, p.packing, p.standard
    ].join(" ").toLowerCase().includes(q))
    .forEach((p, idx) => {
      const tr = document.createElement("tr");
      const exp = daysUntil(p.sĐK_expDate);
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${p.labelUrl ? `<a href="${p.labelUrl}" target="_blank">Mở</a>` : "—"}</td>
        <td>${p.gplh||""}</td>
        <td>${p.sĐK_expDate ? `<span class="badge ${exp<=30?"warn":"ok"}">${p.sĐK_expDate}${Number.isFinite(exp) ? ` (${exp} ngày)` : ""}</span>` : "—"}</td>
        <td>${p.extendCode||""}</td>
        <td>${p.extendReceivedDate||""}</td>
        <td>${p.allowedContinue ? "✓" : (p.allowedContinue===false? "✗" : "—")}</td>
        <td>${p.productUrl ? `<a href="${p.productUrl}" target="_blank">${p.name||""}</a>` : (p.name||"")}</td>
        <td>${p.ingredient||""}</td>
        <td>${p.strength||""}</td>
        <td>${p.decisionNo||""}</td>
        <td>${p.issueYear||""}</td>
        <td>${p.issueBatch||""}</td>
        <td>${p.dosageForm||""}</td>
        <td>${p.packing||""}</td>
        <td>${p.standard||""}</td>
        <td>${p.shelfLife||""}</td>
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
        <td>${l.licenseUrl ? `<a href="${l.licenseUrl}" target="_blank">${l.name||""}</a>` : (l.name||"")}</td>
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
        <td>${t.url ? `<a href="${t.url}" target="_blank">${t.name||""}</a>` : (t.name||"")}</td>
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
    ["name","Tên thuốc","text","full"],
    ["productUrl","Link hồ sơ sản phẩm (bấm vào tên để mở)","text","full"],
    ["labelUrl","Link HDSD/Mẫu nhãn","text","full"],
    ["gplh","Số GPLH","text"], ["sĐK_expDate","Ngày hết hạn SĐK","date"],
    ["extendCode","Mã hồ sơ gia hạn","text"], ["extendReceivedDate","Ngày tiếp nhận HS gia hạn","date"],
    ["allowedContinue","Được tiếp tục sử dụng GĐKLH (✓=có, để trống/0=không)","text","full"],
    ["ingredient","Hoạt chất","text","full"], ["strength","Hàm lượng","text"],
    ["decisionNo","Số quyết định","text"], ["issueYear","Năm cấp","number"], ["issueBatch","Đợt cấp","text"],
    ["dosageForm","Dạng bào chế","text"], ["packing","Quy cách đóng gói","text"],
    ["standard","Tiêu chuẩn","text"], ["shelfLife","Tuổi thọ","text"]
  ];
  if (kind === "licenses") formSpec = [
    ["licenseUrl","Link hồ sơ giấy phép (bấm vào tên để mở)","text","full"],
    ["code","Mã GP","text"], ["name","Tên giấy phép","text"], ["agency","Cơ quan cấp","text"],
    ["issueDate","Ngày cấp","date"], ["expDate","Ngày hết hạn","date"], ["status","Trạng thái","text"], ["note","Ghi chú","text","full"]
  ];
  if (kind === "tenders") formSpec = [
    ["code","Mã gói thầu","text"], ["name","Tên gói thầu (bấm vào để mở link)","text"], ["url","Link gói thầu","text","full"],
    ["date","Ngày tham gia","date"], ["productCode","Mã SP","text"], ["productName","Tên sản phẩm","text"],
    ["qty","Khối lượng","number"], ["bidPrice","Đơn giá chào (VNĐ)","number"], ["winPrice","Giá trúng thầu (VNĐ)","number"],
    ["result","Kết quả (Thắng/Thua/Đang chờ)","text"], ["note","Ghi chú","text","full"]
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
      if (['issueYear','qty','bidPrice','winPrice'].includes(key)) v = Number(v||0);
      if (key==='allowedContinue') v = (el.value.trim()===''? null : (el.value.trim()==='0' ? false : true));
      obj[key] = v;
    }
    if (kind==="products") store.products.push(obj);
    if (kind==="licenses") store.licenses.push(obj);
    if (kind==="tenders") store.tenders.push(obj);
    save(); render();
  };
}

// ---- Excel helpers ----
function normalizeHeader(h){ return (h||'').toString().trim().toLowerCase(); }

function importExcelToCurrentTab(workbook) {
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
  if (activeTab === 'products') {
    data.forEach(row => {
      const n = (k) => row[k] ?? row[k.toUpperCase()] ?? row[k.toLowerCase()];
      const g = (labelList) => {
        for (const lab of labelList) { const v = row[lab]; if (v !== undefined && v !== '') return v; }
        return '';
      };
      const allowedRaw = g(['Được tiếp tục sử dụng GĐKLH','duoc tiep tuc su dung gdkLH','allowed','Allowed']);
      let allowed = null;
      const s = (allowedRaw||'').toString().toLowerCase().trim();
      if (['✓','co','có','1','yes','true'].includes(s)) allowed = true;
      if (['x','khong','không','0','no','false'].includes(s)) allowed = false;

      store.products.push({
        id: uid(),
        labelUrl: g(['HDSD/Mẫu nhãn','link hdsd','label','label url']),
        gplh: g(['Số GPLH','so gplh']),
        sĐK_expDate: g(['Ngày hết hạn SĐK','ngay het han sdk']),
        extendCode: g(['Mã HS gia hạn','ma ho so gia han']),
        extendReceivedDate: g(['Ngày tiếp nhận HS gia hạn','ngay tiep nhan hs gia han']),
        allowedContinue: allowed,
        name: g(['Tên thuốc','ten thuoc','Tên sản phẩm','ten san pham']),
        productUrl: g(['Link hồ sơ sản phẩm','product url','link san pham']),
        ingredient: g(['Hoạt chất','hoat chat']),
        strength: g(['Hàm lượng','ham luong']),
        decisionNo: g(['Số quyết định','so quyet dinh']),
        issueYear: Number(g(['Năm cấp','nam cap'])) || null,
        issueBatch: g(['Đợt cấp','dot cap']),
        dosageForm: g(['Dạng bào chế','dang bao che']),
        packing: g(['Quy cách đóng gói','quy cach dong goi']),
        standard: g(['Tiêu chuẩn','tieu chuan']),
        shelfLife: g(['Tuổi thọ','tuoi tho']),
      });
    });
  } else if (activeTab === 'licenses') {
    data.forEach(row => {
      const g = (labelList) => { for (const lab of labelList) { const v = row[lab]; if (v!==undefined && v!=='') return v; } return ''; };
      store.licenses.push({
        id: uid(),
        licenseUrl: g(['Link hồ sơ giấy phép','license url','link giay phep']),
        code: g(['Mã GP','ma gp']),
        name: g(['Tên giấy phép','ten giay phep']),
        agency: g(['Cơ quan cấp','co quan cap']),
        issueDate: g(['Ngày cấp','ngay cap']),
        expDate: g(['Ngày hết hạn','ngay het han']),
        status: g(['Trạng thái','trang thai']),
      });
    });
  } else if (activeTab === 'tenders') {
    data.forEach(row => {
      const g = (labelList) => { for (const lab of labelList) { const v = row[lab]; if (v!==undefined && v!=='') return v; } return ''; };
      store.tenders.push({
        id: uid(),
        code: g(['Mã','ma','Mã gói thầu','ma goi thau']),
        name: g(['Tên gói thầu','ten goi thau']),
        url: g(['Link','url','link goi thau']),
        date: g(['Ngày','ngay','Ngày tham gia','ngay tham gia']),
        productCode: g(['Mã SP','ma sp']),
        productName: g(['Tên sản phẩm','ten san pham']),
        qty: Number(g(['Khối lượng','khoi luong'])) || null,
        bidPrice: Number(g(['Đơn giá','don gia','Đơn giá chào (VNĐ)'])) || null,
        winPrice: Number(g(['Giá trúng','gia trung','Giá trúng thầu (VNĐ)'])) || null,
        result: g(['Kết quả','ket qua']),
      });
    });
  }
  save(); render();
}

function exportCurrentFilteredToExcel() {
  let rows = []; let filename = 'export.xlsx';
  if (activeTab==='products') {
    filename='san-pham.xlsx';
    const q = query.toLowerCase();
    const arr = store.products.filter(p => [p.name,p.code,p.ingredient,p.dosageForm,p.packing,p.standard].join(' ').toLowerCase().includes(q));
    rows = arr.map((p,i)=>({
      STT: i+1,
      'HDSD/Mẫu nhãn': p.labelUrl,
      'Số GPLH': p.gplh,
      'Ngày hết hạn SĐK': p.sĐK_expDate,
      'Mã HS gia hạn': p.extendCode,
      'Ngày tiếp nhận HS gia hạn': p.extendReceivedDate,
      'Được tiếp tục sử dụng GĐKLH': p.allowedContinue===true?'Có':(p.allowedContinue===false?'Không':''),
      'Tên thuốc': p.name,
      'Link hồ sơ sản phẩm': p.productUrl,
      'Hoạt chất': p.ingredient,
      'Hàm lượng': p.strength,
      'Số quyết định': p.decisionNo,
      'Năm cấp': p.issueYear,
      'Đợt cấp': p.issueBatch,
      'Dạng bào chế': p.dosageForm,
      'Quy cách đóng gói': p.packing,
      'Tiêu chuẩn': p.standard,
      'Tuổi thọ': p.shelfLife,
    }));
  } else if (activeTab==='licenses') {
    filename='giay-phep.xlsx';
    const q = query.toLowerCase();
    const arr = store.licenses.filter(l => [l.code,l.name,l.agency,l.status].join(' ').toLowerCase().includes(q));
    rows = arr.map(l=>({
      'Mã GP': l.code, 'Tên giấy phép': l.name, 'Link hồ sơ giấy phép': l.licenseUrl,
      'Cơ quan cấp': l.agency, 'Ngày cấp': l.issueDate, 'Ngày hết hạn': l.expDate, 'Trạng thái': l.status,
    }));
  } else if (activeTab==='tenders') {
    filename='goi-thau.xlsx';
    const q = query.toLowerCase();
    const arr = store.tenders.filter(t => [t.code,t.name,t.productName,t.productCode,t.result].join(' ').toLowerCase().includes(q));
    rows = arr.map(t=>({
      'Mã': t.code, 'Tên gói thầu': t.name, 'Link gói thầu': t.url,
      'Ngày': t.date, 'Mã SP': t.productCode, 'Tên sản phẩm': t.productName,
      'Khối lượng': t.qty, 'Đơn giá': t.bidPrice, 'Giá trúng': t.winPrice, 'Kết quả': t.result
    }));
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}

function init() {
  // Tabs
  $$(".tabs button").forEach(btn => btn.addEventListener("click", () => { activeTab = btn.dataset.tab; render(); }));
  // Toolbar
  $("#searchInput").addEventListener("input", (e)=>{ query = e.target.value; render(); });
  $("#addBtn").addEventListener("click", ()=> openForm(activeTab));
  // Export/Import JSON
  $("#exportBtn").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(store,null,2)], {type: "application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "dopharma-data.json"; a.click(); URL.revokeObjectURL(url);
  });
  $("#importInput").addEventListener("change", async (e)=>{
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text(); store = JSON.parse(text); save(); render();
  });
  // Excel import/export
  $("#excelInput").addEventListener("change", async (e)=>{
    const f = e.target.files?.[0]; if (!f) return;
    const data = await f.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    importExcelToCurrentTab(wb);
    e.target.value = '';
  });
  $("#exportExcelBtn").addEventListener("click", exportCurrentFilteredToExcel);

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
