import './assets/scss/all.scss';

import c3 from 'c3';
import 'c3/c3.css';

import { getOrders, updateOrderStatus, deleteOrderItem, deleteAllOrders } from './assets/js/admin_api';

const orderListBody = document.querySelector('.orderPage-table tbody');
const discardAllBtn = document.querySelector('.discardAllBtn');

const toggleChartBtn = document.getElementById('toggleChartBtn');
const chartTitle = document.getElementById('chartTitle');
let chartState = 'product';

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

function renderChart(orders) {

    if (chartState === 'product') {
        console.log('渲染全品項營收比重圖表');

        const revenueData = {};
    
        orders.forEach(order => {
            order.products.forEach(product => {
                const title = product.title;
                const price = product.price;
                const quantity = product.quantity;
                const total = price * quantity;
    
                if (revenueData[title]) {
                    revenueData[title] += total;
                } else {
                    revenueData[title] = total;
                }
            });
        });
    
        console.log('營收統計物件:', revenueData);
    
        let chartColumns = Object.keys(revenueData).map(title => {
            return [title, revenueData[title]];
        });
    
        chartColumns.sort((a, b) => {
            return b[1] - a[1];
        });
    
        console.log('圖表資料陣列:', chartColumns);
    
        let finalChartColumns = [];
    
        if (chartColumns.length > 3) {
            const top3 = chartColumns.slice(0, 3);
            const others = chartColumns.slice(3);
    
            const othersTotal = others.reduce((accumulator, currentItem) => {
                return accumulator + currentItem[1];
            }, 0);
    
            finalChartColumns = [...top3, ['其他', othersTotal]];
        } else {
            finalChartColumns = chartColumns;
        }
    
        const colorPalette = ['#DACBFF', '#9D7FEA', '#5434A7'];
        const otherColor = '#301E5F';
    
        const dynamicColors = {};
    
        finalChartColumns.forEach((item, index) => {
            const name = item[0];
    
            if (name === '其他') {
                dynamicColors[name] = otherColor;
            } else if (index < colorPalette.length) {
                dynamicColors[name] = colorPalette[index];
            }
        });
    
        console.log('最終圖表資料陣列:', finalChartColumns);
        console.log('圖表顏色對應物件:', dynamicColors);
    
        c3.generate({
            bindto: '#chart', // HTML 元素綁定
            data: {
                type: "pie",
                columns: finalChartColumns,
                colors: dynamicColors
            },
        });

    } else {
        console.log('渲染全產品類別營收比重圖表');

        const categoryRevenue = {
            '床架': 0,
            '收納': 0,
            '窗簾': 0
        };

        orders.forEach(order => {
            order.products.forEach(product => {
                const category = product.category;
                const total = product.price * product.quantity;

                if (category === '床架') {
                    categoryRevenue['床架'] += total;
                } else if (category === '收納') {
                    categoryRevenue['收納'] += total;
                } else if (category === '窗簾') {
                    categoryRevenue['窗簾'] += total;
                }
            });
        });

        console.log('類別營收統計物件:', categoryRevenue);

        const finalChartColumns = Object.keys(categoryRevenue).map(category => {
            return [category, categoryRevenue[category]];
        });

        console.log('圖表資料陣列:', finalChartColumns);

        const categoryColors = {
            '床架': '#9D7FEA',
            '收納': '#DACBFF',
            '窗簾': '#5434A7'
        };

        c3.generate({
            bindto: '#chart', // HTML 元素綁定
            data: {
                type: "pie",
                columns: finalChartColumns,
                colors: categoryColors
            },
        });
    }
}

discardAllBtn.addEventListener('click', async (e) => {
    console.log('刪除全部訂單按鈕被點擊');

    try {
        const res = await deleteAllOrders();

        console.log('全部訂單刪除回應:', res);

        alert('已刪除全部訂單');
        init();
    } catch (error) {
        console.error('Error deleting all orders:', error);
        alert('刪除全部訂單失敗，請稍後再試。');
    }
});

orderListBody.addEventListener('click', async (e) => {
    e.preventDefault();

    const target = e.target;

    console.log('點擊事件目標:', target);

    if (target.classList.contains('js-delete-item')) {
        const orderId = target.dataset.id;

        console.log('刪除訂單 ID:', orderId);

        try {
            const res = await deleteOrderItem(orderId);
            console.log('刪除單筆訂單回應:', res);
            alert('已刪除該筆訂單');
            init();
        } catch (error) {
            console.error('Error deleting order item:', error);
            alert('刪除訂單失敗，請稍後再試。');
        }
    }

    if (target.classList.contains('js-toggle-status')) {
        const orderId = target.dataset.id;
        const currentStatus = target.dataset.status === 'true';
        const newStatus = !currentStatus;

        console.log(`準備切換狀態 ID: ${orderId}, 原狀態: ${currentStatus}, 新狀態: ${newStatus}`);

        try {
            const data = {
                id: orderId,
                paid: newStatus
            };
            const res =await updateOrderStatus(data);
            console.log('更新訂單狀態回應:', res);
            alert('已更新訂單狀態');
            init();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('更新訂單狀態失敗，請稍後再試。');
        }
    }
});

toggleChartBtn.addEventListener('click', () => {
    console.log('切換圖表按鈕被點擊');

    if (chartState === 'product') {
        chartState = 'category';
        chartTitle.textContent = '全產品類別營收比重';
        toggleChartBtn.textContent = '切換為「全品項」比重';
    } else {
        chartState = 'product';
        chartTitle.textContent = '全品項營收比重';
        toggleChartBtn.textContent = '切換為「類別」比重';
    }

    console.log('目前圖表狀態:', chartState);

    renderChart(ordersData);
});

async function init() {
    try {
        const orderRes = await getOrders();
        ordersData = orderRes.data.orders;

        renderOrders(ordersData);

        renderChart(ordersData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('取得訂單資料失敗，請稍後再試。');
    }
}

init();