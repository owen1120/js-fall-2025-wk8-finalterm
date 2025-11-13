import './assets/scss/all.scss';

import c3 from 'c3';
import 'c3/c3.css';

import { getOrders, updateOrderStatus, deleteOrderItem, deleteAllOrders } from './assets/js/admin_api';

const orderListBody = document.querySelector('.orderPage-table tbody');
const discardAllBtn = document.querySelector('.discardAllBtn');

let ordersData = [];

function renderOrders(orders) {
    let ordersHtml = '';

    orders.forEach(order => {
        const productItems = order.products.map(product => {
            return `<p>${product.title} x ${product.quantity}</p>`;
        }).join('');

        const orderDate = new Date(order.createdAt * 1000);
        const formattedDate = `${orderDate.getFullYear()}/${orderDate.getMonth() + 1}/${orderDate.getDate()}`;

        const orderStatus = order.paid ? '已處理' : '未處理';
        const orderStatusClass = order.paid ? 'text-success' : 'text-danger';

        ordersHtml += `
            <tr>
                <td>${order.id}</td>
                <td>
                    <p>${order.user.name}</p>
                    <p>${order.user.tel}</p>
                </td>
                <td>${order.user.address}</td>
                <td>${order.user.email}</td>
                <td>${productItems}</td>
                <td>${formattedDate}</td>
                <td class="orderStatus">
                    <a href="#" class="js-toggle-status ${orderStatusClass}" data-id="${order.id}" data-status="${order.paid}">
                        ${orderStatus}
                    </a>
                </td>
                <td>
                <input 
                    type="button" class="delSingleOrder-Btn js-delete-item" value="刪除" data-id="${order.id}">
                </td>
            </tr>
        `;
    });

    orderListBody.innerHTML = ordersHtml;
}

function renderChart() {
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: [
                ['Louvre 雙人床架', 1],
                ['Antony 雙人床架', 2],
                ['Anty 雙人床架', 3],
                ['其他', 4],
            ],
            colors:{
                "Louvre 雙人床架":"#DACBFF",
                "Antony 雙人床架":"#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

async function init() {
    try {
        const orderRes = await getOrders();
        ordersData = orderRes.data.orders;

        renderOrders(ordersData);

        renderChart();
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('取得訂單資料失敗，請稍後再試。');
    }
}

init();