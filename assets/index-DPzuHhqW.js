import{a as v}from"./index-BtgFpLJ9.js";const $="https://livejs-api.hexschool.io/api/livejs/v1",S="owenhe",a=v.create({baseURL:`${$}/customer/${S}`}),L=()=>a.get("/products"),u=()=>a.get("/carts"),C=(e,t=1)=>{const r={data:{productId:e,quantity:t}};return a.post("/carts",r)},T=e=>a.delete(`/carts/${e}`),P=()=>a.delete("/carts"),q=e=>{const t={data:e};return a.post("/orders",t)},p=document.querySelector(".productWrap"),l=document.querySelector(".shoppingCart-table tbody"),I=document.querySelector(".js-cart-total"),d=document.querySelector(".discardAllBtn"),D=document.querySelector(".productSelect"),m=document.querySelector(".orderInfo-form"),g=document.querySelector("#customerName"),f=document.querySelector("#customerPhone"),y=document.querySelector("#customerEmail"),h=document.querySelector("#customerAddress"),w=document.querySelector("#tradeWay");let s=[],o=[];function i(e){let t="";e.forEach(r=>{t+=`
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${r.images}" alt="${r.title}">
            <a href="#" class="addCardBtn" data-id="${r.id}">加入購物車</a>
            <h3>${r.title}</h3>
            <del class="originPrice">NT$${r.origin_price.toLocaleString()}</del>
            <p class="nowPrice">NT$${r.price.toLocaleString()}</p>
        </li>
    `}),p.innerHTML=t}function c(e){let t="";e.carts.forEach(r=>{const n=r.product.price*r.quantity;t+=`
        <tr>
            <td>
            <div class="cardItem-title">
                <img src="${r.product.images}" alt="${r.product.title}">
                <p>${r.product.title}</p>
            </div>
            </td>
            <td>NT$${r.product.price.toLocaleString()}</td>
            <td>${r.quantity}</td>
            <td>NT$${n.toLocaleString()}</td>
            <td class="discardBtn">
            <a href="#" class="material-icons js-delete-item" data-id="${r.id}">
                clear
            </a>
            </td>
        </tr>
        `}),l.innerHTML=t,I.textContent=`NT$${e.finalTotal.toLocaleString()}`,e.carts.length===0?(l.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px 0;">購物車目前是空的！</td></tr>',d.style.display="none"):d.style.display="block"}function A(e){if(e.preventDefault(),console.log("點擊目標"),console.log(e.target),e.target.classList.contains("addCardBtn")){console.log("準備呼叫 addItemToCart！");const t=e.target.dataset.id;E(t)}}async function E(e){console.log("準備 POST 產品 ID:",e);try{const t=await C(e);console.log("成功！API 回應:",t.data),o=(await u()).data,console.log("準備渲染的購物車資料:",o),c(o),console.log("完畢！")}catch(t){console.error("捕捉到「裂痕」:"),console.error(t.response?t.response.data:t)}}function b(e){if(e.preventDefault(),!e.target.classList.contains("js-delete-item"))return;const t=e.target.dataset.id;console.log("準備刪除購物車項目 ID:",t),x(t)}async function x(e){try{o=(await T(e)).data,console.log("刪除成功，更新後的購物車資料:",o),c(o)}catch(t){console.error("刪除購物車項目時發生錯誤:",t),console.error(t.response?t.response.data:t)}}function R(e){e.preventDefault(),confirm("確定要清空購物車嗎？")&&(console.log("準備刪除所有購物車項目"),k())}async function k(){try{o=(await P()).data,console.log("全部刪除成功，更新後的購物車資料:",o),c(o)}catch(e){console.error("刪除所有購物車項目時發生錯誤:",e),console.error(e.response?e.response.data:e)}}function N(e){const t=e.target.value;if(console.log("選取的分類:",t),t==="全部"){i(s);return}const r=s.filter(n=>n.category===t);i(r)}function B(e){if(e.preventDefault(),!H()){alert("請完整填寫訂單資訊！");return}const t={user:{name:g.value.trim(),tel:f.value.trim(),email:y.value.trim(),address:h.value.trim(),payment:w.value}};console.log("準備送出訂單資料:",t),j(t)}async function j(e){try{const t=await q(e);console.log("訂單送出成功，API 回應:",t.data),alert("感謝您的訂購！我們已收到您的訂單。"),m.reset(),o=(await u()).data,c(o)}catch(t){console.error("送出訂單時發生錯誤:",t),console.error(t.response?t.response.data:t)}}function H(){return!(g.value.trim()===""||f.value.trim()===""||y.value.trim()===""||h.value.trim()==="")}async function F(){try{s=(await L()).data.products,i(s);const t=await u();console.log(t.data),o=t.data,c(o)}catch(e){console.error("Error fetching products:",e),alert("無法取得產品資料，請稍後再試。")}}F();p.addEventListener("click",A);l.addEventListener("click",b);d.addEventListener("click",R);D.addEventListener("change",N);m.addEventListener("submit",B);
