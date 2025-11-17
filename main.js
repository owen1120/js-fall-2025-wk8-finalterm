import './assets/scss/all.scss';

import { getProducts, getCart, addToCart, deleteCartItem, deleteAllCartItems, postOrder } from './assets/js/api.js';

import Swal from 'sweetalert2';
import './node_modules/sweetalert2/dist/sweetalert2.min.css';

const productList = document.querySelector('.productWrap');
const cartTableBody = document.querySelector('.shoppingCart-table tbody');
const cartTotalPrice = document.querySelector('.js-cart-total');
const cartTableFooter = document.querySelector('.js-cart-footer');
const discardAllBtn = document.querySelector('.discardAllBtn');
const productFilter = document.querySelector('.productSelect');

const orderForm = document.querySelector('.orderInfo-form');
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');

let productsData = [];
let cartData = [];

function renderProducts(products) {
    let productHtml = '';

    products.forEach(product => {
        productHtml += `
        <li class="productCard" data-category="${product.category}">
            <h4 class="productType">新品</h4>
            <img src="${product.images}" alt="${product.title}">
            <a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
            <h3>${product.title}</h3>
            <del class="originPrice">NT$${product.origin_price.toLocaleString()}</del>
            <p class="nowPrice">NT$${product.price.toLocaleString()}</p>
        </li>
    `;
    });

    productList.innerHTML = productHtml;
}

function renderCart(cart) {
    let cartHtml = '';

    cart.carts.forEach(item => {
        const subtotal = item.product.price * item.quantity;

        cartHtml += `
        <tr>
            <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="${item.product.title}">
                <p>${item.product.title}</p>
            </div>
            </td>
            <td>NT$${item.product.price.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td>NT$${subtotal.toLocaleString()}</td>
            <td class="discardBtn">
            <a href="#" class="material-icons js-delete-item" data-id="${item.id}">
                clear
            </a>
            </td>
        </tr>
        `;
    });

    cartTableBody.innerHTML = cartHtml;

    cartTotalPrice.textContent = `NT$${cart.finalTotal.toLocaleString()}`;

    if (cart.carts.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px 0;">購物車目前是空的！</td></tr>';
        cartTableFooter.style.display = 'none';
    } else {
        cartTableFooter.style.display = 'table-footer-group';
    }
}

function handleProductListClick(e) {
  e.preventDefault();

  console.log('點擊目標');
  console.log(e.target);

  if (e.target.classList.contains('addCardBtn')) {
    
    console.log('準備呼叫 addItemToCart！');

    const productId = e.target.dataset.id;
    addItemToCart(productId);
  }
}

async function addItemToCart(productId) {
  console.log('準備 POST 產品 ID:', productId);
  
  const existingItem = cartData.carts.find(item => {
    return item.product.id === productId;
  });

  let newQty = 1;

  if (existingItem) {
    newQty = existingItem.quantity + 1;
    console.log('產品已在購物車中，新的數量為:', newQty);
  } else {
    console.log('產品不在購物車中，將以數量 1 加入購物車');
  }

  try {
    const res = await addToCart(productId, newQty);

    console.log('加入購物車成功，API 回應:', res.data);

    Swal .fire({
        icon: 'success',
        title: '成功加入購物車！',
        text: `${existingItem ? existingItem.product.title : '新商品' } 的數量已更新為 ${newQty}！`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });

    const cartRes = await getCart();
    cartData = cartRes.data;
    console.log('更新後的購物車資料:', cartData);

    renderCart(cartData);
    console.log('購物車已更新並重新渲染');
  } catch (error) {
    console.error('加入購物車時發生錯誤:', error);
    console.error(error.response ? error.response.data : error);

    Swal.fire({
        icon: 'error',
        title: '加入購物車失敗',
        text: '無法將商品加入購物車，請稍後再試。',
        confirmButtonColor: '#5434A7'
    });
  }
}

function handleCartClick(e) {
    e.preventDefault();

    if (!e.target.classList.contains('js-delete-item')) {
        return;
    }

    const cartId = e.target.dataset.id;
    console.log('準備刪除購物車項目 ID:', cartId);

    executeDeleteItem(cartId);
}

async function executeDeleteItem(cartId) {
    try {
        const res = await deleteCartItem(cartId);

        cartData = res.data;

        console.log('刪除成功，更新後的購物車資料:', cartData);

        renderCart(cartData);
    } catch (error) {
        console.error('刪除購物車項目時發生錯誤:', error);
        console.error(error.response ? error.response.data : error);
    }
}

function handleDeleteAllClick(e) {
    e.preventDefault();

    if (!confirm('確定要清空購物車嗎？')) {
        return;
    }

    console.log('準備刪除所有購物車項目');

    executeDeleteAll();
}

async function executeDeleteAll() {
    try {
        const res = await deleteAllCartItems();

        cartData = res.data;

        console.log('全部刪除成功，更新後的購物車資料:', cartData);

        renderCart(cartData);
    } catch (error) {
        console.error('刪除所有購物車項目時發生錯誤:', error);
        console.error(error.response ? error.response.data : error);
    }
}

function handleProductFilter(e) {
    const category = e.target.value;

    console.log('選取的分類:', category);

    const allProductCards = productList.querySelectorAll('.productCard');

    allProductCards.forEach(card => {

        if (category === '全部') {
            card.style.display = 'block';
        } else if (card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    })
}

function handleOrderSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {

        // alert('請完整填寫訂單資訊！');

        Swal.fire({
            icon: 'error',
            title: '表單驗證失敗',
            text: '請完整且正確填寫訂單資訊！',
            confirmButtonColor: '#5434A7'
        });

        return;
    }

    const orderData = {
        user: {
            name: customerName.value.trim(),
            tel: customerPhone.value.trim(),
            email: customerEmail.value.trim(),
            address: customerAddress.value.trim(),
            payment: tradeWay.value,
        }
    };

    console.log('準備送出訂單資料:', orderData);

    executePostOrder(orderData);
}

async function executePostOrder(orderData) {
    try {
        const res = await postOrder(orderData);

        console.log('訂單送出成功，API 回應:', res.data);

        // alert('感謝您的訂購！我們已收到您的訂單。');

        Swal.fire({
            icon: 'success',
            title: '訂單送出成功',
            text: '感謝您的訂購！我們已收到您的訂單。',
            confirmButtonColor: '#5434A7'
        });

        orderForm.reset();

        const cartRes = await getCart();
        cartData = cartRes.data;
        renderCart(cartData);
    } catch (error) {
        console.error('送出訂單時發生錯誤:', error);
        console.error(error.response ? error.response.data : error);
    }
}

function validateForm() {
    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();
    const email = customerEmail.value.trim();
    const address = customerAddress.value.trim();

    if (name === '' || phone === '' || email === '' || address === '') {
        console.log('表單驗證失敗');
        return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        console.warn('電子郵件格式不正確');
        return false;
    }

    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone)) {
        console.warn('手機號碼格式不正確');
        return false;
    }

    return true;
}

async function init() {
    try {
        const productRes = await getProducts();
        productsData = productRes.data.products;
        renderProducts(productsData);

        const cartRes = await getCart();
        console.log(cartRes.data);
        cartData = cartRes.data;
        renderCart(cartData);

    } catch (error) {
        console.error('Error fetching products:', error);
        alert('無法取得產品資料，請稍後再試。');
    }
}

init();

productList.addEventListener('click', handleProductListClick);

cartTableBody.addEventListener('click', handleCartClick);

discardAllBtn.addEventListener('click', handleDeleteAllClick);

productFilter.addEventListener('change', handleProductFilter);

orderForm.addEventListener('submit', handleOrderSubmit);