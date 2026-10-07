async function loadOrders() {

          try {

                    const response = await fetch("backend/get_orders.php");

                    const orders = await response.json();

                    const container = document.getElementById("orders-container");

                    container.innerHTML = "";

                    orders.forEach(order => {

                              const items = JSON.parse(order.items);

                              let itemsHTML = "";

                              items.forEach(item => {

                                        itemsHTML += `
                    <p>
                        ${item.name} × ${item.quantity}
                    </p>
                `;

                              });

                              container.innerHTML += `
                <div class="bg-gray-800 p-5 rounded-lg mb-4">

                    <h2 class="text-xl font-bold">
                        Order #${order.id}
                    </h2>

                    <p>Name: ${order.name}</p>
                    <p>Email: ${order.email}</p>
                    <p>Phone: ${order.phone}</p>
                    <p>Address: ${order.address}</p>

                    <hr class="my-3">

                    <p class="font-bold">Products:</p>

                    ${itemsHTML}

                    <hr class="my-3">

                    <p>Payment: ${order.payment_method}</p>
                    <p>Transaction ID: ${order.transaction_id}</p>
                    <p>Grand Total: ৳${order.grand_total}</p>
                    <select 
                    
       // admin status change//

    onchange="updateStatus(${order.id}, this.value)"
    class="bg-gray-700 text-white p-2 rounded mt-2"
>
    <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>
        Pending
    </option>

    <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>
        Confirmed
    </option>

    <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>
        Shipped
    </option>

    <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>
        Delivered
    </option>

    <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>
        Cancelled
    </option>
</select>
                    <p>Date: ${order.created_at}</p>

                </div>
            `;

                    });



          } catch (error) {

                    console.error("Error loading orders:", error);

          }
}

/* update status function*/

async function updateStatus(id, status) {

          try {

                    const response = await fetch("backend/update_status.php", {
                              method: "POST",

                              headers: {
                                        "Content-Type": "application/json"
                              },

                              body: JSON.stringify({
                                        id: id,
                                        status: status
                              })
                    });

                    const data = await response.json();

                    if (data.success) {

                              alert("Order status updated successfully!");

                    } else {

                              alert("Failed to update order status!");

                    }

          } catch (error) {

                    console.error("Error updating status:", error);

                    alert("Something went wrong!");

          }
}

loadOrders();