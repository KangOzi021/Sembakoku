/* SembakoKu - aplikasi front-end dengan LocalStorage, DOM, EventListener, Object, Array, Looping dan jQuery */
const STORAGE_PRODUCTS = "sembakoku_products_v1";
const STORAGE_SALES = "sembakoku_sales_v1";
const rupiah = value => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value)||0);

const seedProducts = [
 {id:1,name:"Beras Ramos 5 kg",category:"Beras",price:75000,stock:18},
 {id:2,name:"Minyak Goreng 1 L",category:"Minyak & Gula",price:18000,stock:24},
 {id:3,name:"Gula Pasir 1 kg",category:"Minyak & Gula",price:17000,stock:4},
 {id:4,name:"Telur Ayam 1 kg",category:"Lainnya",price:29000,stock:15},
 {id:5,name:"Mi Instan",category:"Makanan Instan",price:3500,stock:40},
 {id:6,name:"Garam 500 g",category:"Bumbu Dapur",price:5000,stock:3},
 {id:7,name:"Teh Celup",category:"Minuman",price:8500,stock:12}
];

function readData(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:fallback}catch(error){return fallback}}
function getProducts(){return readData(STORAGE_PRODUCTS,seedProducts)}
function getSales(){return readData(STORAGE_SALES,[])}
function saveProducts(items){localStorage.setItem(STORAGE_PRODUCTS,JSON.stringify(items))}
function saveSales(items){localStorage.setItem(STORAGE_SALES,JSON.stringify(items))}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]))}
function nextId(items){return items.length?Math.max(...items.map(item=>Number(item.id)||0))+1:1}

function initializeData(){
 if(!localStorage.getItem(STORAGE_PRODUCTS)) saveProducts(seedProducts);
 if(!localStorage.getItem(STORAGE_SALES)) saveSales([]);
}
function renderDashboard(){
 const products=getProducts(),sales=getSales();
 document.getElementById("statProducts").textContent=products.length;
 document.getElementById("statStock").textContent=products.reduce((sum,p)=>sum+Number(p.stock),0);
 document.getElementById("statTransactions").textContent=sales.length;
 document.getElementById("statRevenue").textContent=rupiah(sales.reduce((sum,s)=>sum+s.total,0));
 const low=products.filter(p=>p.stock<=5);
 document.getElementById("lowStockBody").innerHTML=low.length?low.map(p=>`<tr><td class="product-name">${escapeHTML(p.name)}</td><td>${escapeHTML(p.category)}</td><td><span class="badge badge-low">${p.stock} unit</span></td></tr>`).join(""):`<tr><td colspan="3" class="text-center text-secondary py-4">Semua stok dalam kondisi aman.</td></tr>`;
 const recent=sales.slice().reverse().slice(0,5);
 document.getElementById("recentTransactions").innerHTML=recent.length?recent.map(s=>`<div class="recent-item"><div><strong>${escapeHTML(s.customer)}</strong><small>${new Date(s.date).toLocaleString("id-ID")}</small></div><strong>${rupiah(s.total)}</strong></div>`).join(""):`<p class="text-secondary small mb-0">Belum ada transaksi penjualan.</p>`;
}

function renderProducts(filter=""){
 const body=document.getElementById("productTable");if(!body)return;
 const products=getProducts().filter(p=>(p.name+" "+p.category).toLowerCase().includes(filter.toLowerCase()));
 body.innerHTML=products.map(p=>`<tr><td class="product-name">${escapeHTML(p.name)}</td><td>${escapeHTML(p.category)}</td><td>${rupiah(p.price)}</td><td>${p.stock}</td><td><span class="badge ${p.stock<=5?"badge-low":"badge-stock"}">${p.stock<=5?"Stok menipis":"Tersedia"}</span></td><td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" data-edit="${p.id}">Edit</button><button class="btn btn-sm btn-outline-danger" data-delete="${p.id}">Hapus</button></td></tr>`).join("");
 document.getElementById("emptyProducts").classList.toggle("d-none",products.length>0);
}
function resetProductForm(){
 document.getElementById("productForm").reset();document.getElementById("productId").value="";
 document.getElementById("modalTitle").textContent="Tambah Produk";
}
function handleProductSubmit(event){
 event.preventDefault();
 const id=Number(document.getElementById("productId").value);
 const name=document.getElementById("productName").value.trim(),category=document.getElementById("productCategory").value;
 const price=Number(document.getElementById("productPrice").value),stock=Number(document.getElementById("productStock").value);
 if(!name||!category||!Number.isFinite(price)||price<=0||!Number.isInteger(stock)||stock<0){alert("Periksa kembali data produk. Harga harus lebih dari 0 dan stok berupa bilangan bulat minimal 0.");return}
 const products=getProducts();
 if(id){const index=products.findIndex(p=>p.id===id);if(index<0)return;products[index]={...products[index],name,category,price,stock}}
 else products.push({id:nextId(products),name,category,price,stock});
 saveProducts(products);renderProducts();renderDashboardIfExists();bootstrap.Modal.getOrCreateInstance(document.getElementById("productModal")).hide();resetProductForm();
}
function handleProductTableClick(event){
 const editButton=event.target.closest("[data-edit]"),deleteButton=event.target.closest("[data-delete]");
 if(editButton){const product=getProducts().find(p=>p.id===Number(editButton.dataset.edit));if(!product)return;
  document.getElementById("productId").value=product.id;document.getElementById("productName").value=product.name;document.getElementById("productCategory").value=product.category;document.getElementById("productPrice").value=product.price;document.getElementById("productStock").value=product.stock;document.getElementById("modalTitle").textContent="Edit Produk";bootstrap.Modal.getOrCreateInstance(document.getElementById("productModal")).show();}
 if(deleteButton){const id=Number(deleteButton.dataset.delete),product=getProducts().find(p=>p.id===id);if(!product)return;
  if(confirm(`Hapus produk "${product.name}"?`)){saveProducts(getProducts().filter(p=>p.id!==id));renderProducts();}}
}
function renderSaleOptions(){
 const select=document.getElementById("saleProduct");if(!select)return;
 select.innerHTML='<option value="">Pilih produk...</option>'+getProducts().filter(p=>p.stock>0).map(p=>`<option value="${p.id}">${escapeHTML(p.name)} — ${rupiah(p.price)} (stok ${p.stock})</option>`).join("");
}
let cart=[];
function renderCart(){
 const body=document.getElementById("cartTable");if(!body)return;
 body.innerHTML=cart.length?cart.map(item=>`<tr><td class="product-name">${escapeHTML(item.name)}</td><td>${rupiah(item.price)}</td><td>${item.qty}</td><td>${rupiah(item.price*item.qty)}</td><td><button class="btn btn-sm btn-outline-danger" data-remove-cart="${item.id}">Hapus</button></td></tr>`).join(""):`<tr><td colspan="5" class="text-center text-secondary py-4">Keranjang masih kosong.</td></tr>`;
 document.getElementById("cartTotal").textContent=rupiah(cart.reduce((sum,item)=>sum+item.price*item.qty,0));
}
function addCartItem(){
 const id=Number(document.getElementById("saleProduct").value),qty=Number(document.getElementById("saleQty").value),product=getProducts().find(p=>p.id===id);
 if(!product){alert("Silakan pilih produk terlebih dahulu.");return}
 if(!Number.isInteger(qty)||qty<1){alert("Jumlah harus berupa bilangan bulat minimal 1.");return}
 const existing=cart.find(item=>item.id===id),requested=qty+(existing?existing.qty:0);
 if(requested>product.stock){alert(`Stok ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}.`);return}
 if(existing)existing.qty+=qty;else cart.push({id:product.id,name:product.name,price:product.price,qty});
 renderCart();document.getElementById("saleQty").value=1;
}
function saveSale(){
 const customer=document.getElementById("customerName").value.trim(),message=document.getElementById("saleMessage");
 if(!customer){message.innerHTML='<div class="alert alert-warning">Nama pembeli wajib diisi.</div>';return}
 if(!cart.length){message.innerHTML='<div class="alert alert-warning">Keranjang masih kosong.</div>';return}
 const products=getProducts();
 for(const item of cart){const product=products.find(p=>p.id===item.id);if(!product||product.stock<item.qty){message.innerHTML='<div class="alert alert-danger">Stok berubah atau tidak mencukupi. Periksa kembali keranjang.</div>';return}}
 for(const item of cart){const product=products.find(p=>p.id===item.id);product.stock-=item.qty}
 const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
 const sale={id:Date.now(),customer,date:new Date().toISOString(),items:cart.map(item=>({...item})),total};
 saveProducts(products);saveSales([...getSales(),sale]);cart=[];renderCart();renderSaleOptions();document.getElementById("customerName").value="";
 message.innerHTML=`<div class="alert alert-success">Transaksi berhasil disimpan. Total belanja: <strong>${rupiah(total)}</strong>.</div>`;
}
function renderReports(){
 const sales=getSales(),body=document.getElementById("reportTable");if(!body)return;
 const total=sales.reduce((sum,s)=>sum+s.total,0),items=sales.reduce((sum,s)=>sum+s.items.reduce((n,i)=>n+i.qty,0),0);
 document.getElementById("reportCount").textContent=sales.length;document.getElementById("reportRevenue").textContent=rupiah(total);document.getElementById("reportItems").textContent=items;
 body.innerHTML=sales.slice().reverse().map((s,index)=>`<tr><td>${index+1}</td><td>${new Date(s.date).toLocaleString("id-ID")}</td><td>${escapeHTML(s.customer)}</td><td>${s.items.reduce((n,i)=>n+i.qty,0)}</td><td class="fw-bold">${rupiah(s.total)}</td><td><button class="btn btn-sm btn-outline-brand" data-detail="${s.id}">Detail</button></td></tr>`).join("");
 document.getElementById("emptyReports").classList.toggle("d-none",sales.length>0);
}
function openPrintWindow(title, content){
 const printWindow=window.open("", "_blank", "width=900,height=700");
 if(!printWindow){alert("Izinkan pop-up untuk situs ini agar dokumen dapat dicetak.");return}
 printWindow.document.open();
 printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title>
 <style>
 body{font-family:Arial,sans-serif;color:#222;padding:28px;max-width:1000px;margin:auto}
 h1,h2,p{text-align:center;margin:5px 0} .muted{color:#666;font-size:12px}
 .summary{display:flex;justify-content:space-between;gap:16px;margin:24px 0;padding:14px;background:#f3f6f3;border:1px solid #ddd}
 table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
 th,td{border:1px solid #ccc;padding:9px;text-align:left} th{background:#eef2ee}
 .total{text-align:right;font-size:18px;font-weight:bold;margin-top:18px}
 .actions{text-align:center;margin:24px}.actions button{padding:10px 18px;cursor:pointer}
 @media print{body{padding:0}.actions{display:none}.summary{-webkit-print-color-adjust:exact;print-color-adjust:exact}tr{break-inside:avoid}}
 </style></head><body>${content}
 <div class="actions"><button onclick="window.print()">Cetak</button></div>
 </body></html>`);
 printWindow.document.close();
 printWindow.focus();
}
function printAllSales(){
 const sales=getSales();
 if(!sales.length){alert("Belum ada transaksi yang dapat dicetak.");return}
 const total=sales.reduce((sum,s)=>sum+Number(s.total||0),0);
 const totalItems=sales.reduce((sum,s)=>sum+(s.items||[]).reduce((n,i)=>n+Number(i.qty||0),0),0);
 const rows=sales.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).map((s,index)=>`<tr>
 <td>${index+1}</td><td>${new Date(s.date).toLocaleString("id-ID")}</td>
 <td>${escapeHTML(s.customer)}</td><td>${(s.items||[]).map(i=>`${escapeHTML(i.name)} (${Number(i.qty)||0})`).join("<br>")}</td>
 <td>${rupiah(s.total)}</td></tr>`).join("");
 const content=`<h1>SEMBAKOKU</h1><h2>LAPORAN PENJUALAN</h2><p class="muted">Dicetak: ${new Date().toLocaleString("id-ID")}</p>
 <div class="summary"><span>Jumlah transaksi: <strong>${sales.length}</strong></span><span>Barang terjual: <strong>${totalItems}</strong></span><span>Total pendapatan: <strong>${rupiah(total)}</strong></span></div>
 <table><thead><tr><th>No.</th><th>Tanggal</th><th>Pembeli</th><th>Rincian barang (jumlah)</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
 <p class="total">Total Pendapatan: ${rupiah(total)}</p>`;
 openPrintWindow("Laporan Penjualan SembakoKu",content);
}
function printSingleSale(saleId){
 const sale=getSales().find(s=>Number(s.id)===Number(saleId));
 if(!sale){alert("Data transaksi tidak ditemukan.");return}
 const rows=(sale.items||[]).map(i=>`<tr><td>${escapeHTML(i.name)}</td><td>${Number(i.qty)||0}</td><td>${rupiah(i.price)}</td><td>${rupiah((Number(i.price)||0)*(Number(i.qty)||0))}</td></tr>`).join("");
 const content=`<h1>SEMBAKOKU</h1><h2>STRUK PEMBELIAN</h2><p class="muted">Tanggal: ${new Date(sale.date).toLocaleString("id-ID")}</p>
 <p><strong>Pembeli:</strong> ${escapeHTML(sale.customer)}</p>
 <table><thead><tr><th>Barang</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
 <p class="total">Total: ${rupiah(sale.total)}</p>`;
 openPrintWindow("Struk Transaksi SembakoKu",content);
}
function renderSaleDetail(event){
 const button=event.target.closest("[data-detail]");if(!button)return;
 const sale=getSales().find(s=>s.id===Number(button.dataset.detail));if(!sale)return;
 document.getElementById("detailContent").innerHTML=`<p><strong>Pembeli:</strong> ${escapeHTML(sale.customer)}</p><p><strong>Tanggal:</strong> ${new Date(sale.date).toLocaleString("id-ID")}</p><div class="table-responsive"><table class="table"><thead><tr><th>Barang</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${sale.items.map(i=>`<tr><td>${escapeHTML(i.name)}</td><td>${i.qty}</td><td>${rupiah(i.price*i.qty)}</td></tr>`).join("")}</tbody></table></div><h5 class="text-end">Total: ${rupiah(sale.total)}</h5><div class="text-end mt-3"><button type="button" class="btn btn-outline-brand" id="printSingleSale">Cetak Struk Transaksi Ini</button></div>`;
 document.getElementById("printSingleSale").addEventListener("click",()=>printSingleSale(sale.id));
 bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}
function renderDashboardIfExists(){if(document.body.dataset.page==="dashboard")renderDashboard()}

document.addEventListener("DOMContentLoaded",()=>{
 initializeData();
 const page=document.body.dataset.page;
 if(page==="dashboard")renderDashboard();
 if(page==="produk"){
  renderProducts();
  document.getElementById("productForm").addEventListener("submit",handleProductSubmit);
  document.getElementById("productTable").addEventListener("click",handleProductTableClick);
  document.getElementById("addProductBtn").addEventListener("click",resetProductForm);
  // jQuery: fitur pencarian produk secara langsung pada tabel.
  if(window.jQuery){$("#productSearch").on("input",function(){renderProducts($(this).val())});}
 }
 if(page==="transaksi"){
  renderSaleOptions();renderCart();
  document.getElementById("addToCart").addEventListener("click",addCartItem);
  document.getElementById("cartTable").addEventListener("click",event=>{const button=event.target.closest("[data-remove-cart]");if(button){cart=cart.filter(i=>i.id!==Number(button.dataset.removeCart));renderCart()}});
  document.getElementById("clearCart").addEventListener("click",()=>{cart=[];renderCart()});
  document.getElementById("saveSale").addEventListener("click",saveSale);
 }
 if(page==="laporan"){
  renderReports();document.getElementById("reportTable").addEventListener("click",renderSaleDetail);
  document.getElementById("printReport").addEventListener("click",printAllSales);
 }
});
