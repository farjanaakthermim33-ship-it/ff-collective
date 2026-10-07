lucide.createIcons();
let cart = [];
let total = 0;


let products = [];
//js connection with mysql database
async function loadProductsFromDatabase() {

    try {

        const response = await fetch("backend/products.php");

        if (!response.ok) {
            throw new Error("Could not load products");
        }

        const data = await response.json();

        products = data.map(p => ({
            id: Number(p.id),
            name: p.name,
            price: Number(p.price),
            category: p.category,
            img: p.image,
            desc: p.description
        }));

        console.log("Products from Database:", products);

        displayProducts();

    } catch (error) {

        console.error("Product loading error:", error);

    }

}

const specialtyData = {
    personal: { title: "Personal Shopping", icon: "shopping-cart", desc: "If you see a product on a foreign website, give us the link and we will bring it to you.", waMsg: "Hi, I need help with personal shopping for a link I found." },
    custom: { title: "Custom Orders", icon: "box", desc: "Contact us for bulk orders or business imports.", waMsg: "Hello, I am interested in bulk/custom business imports." },
    cargo: { title: "Fast Air Cargo", icon: "plane-takeoff", desc: "Weekly flights from USA & UK ensure 7-12 days delivery.", waMsg: "Hi, I want to know about your air cargo shipping rates." },
    quality: { title: "Quality Check", icon: "shield-check", desc: "Each product is manually inspected before shipping.", waMsg: "How do you perform the quality check for products?" },
    support: { title: "24/7 Support", icon: "headphones", desc: "Direct WhatsApp support for all your queries.", waMsg: "Hi, I need some support regarding my inquiry." }
};

function displayProducts(filter = 'all') {
    const grid = document.getElementById('product-grid');
    const homeGrid = document.getElementById('home-product-preview');
    grid.innerHTML = '';
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    filtered.forEach(p => { grid.innerHTML += createProductCard(p); });
    if (homeGrid) { homeGrid.innerHTML = products.slice(0, 4).map(p => createProductCard(p)).join(''); }
    lucide.createIcons();
}

function createProductCard(p) {
    return `
                <div class="glass p-5 rounded-[2.5rem] flex flex-col group">
                    <div class="relative overflow-hidden rounded-3xl mb-4">
                        <img src="${p.img}" class="h-48 w-full object-cover transition duration-500 group-hover:scale-110">
                    </div>
                    <h4 class="font-bold text-sm">${p.name}</h4>
                    <p class="text-[#00D4FF] font-black my-2">৳${p.price.toLocaleString()}</p>
                    <div class="grid grid-cols-2 gap-2 mt-auto">
                        <button onclick="showProductDetails(${p.id})" class="bg-white/5 hover:bg-white/10 py-3 rounded-xl text-[9px] font-bold uppercase border border-white/5 transition">Details</button>
                        <button onclick="addToCart('${p.name}', ${p.price})" class="bg-[#00D4FF] text-black py-3 rounded-xl text-[9px] font-bold uppercase transition">Add</button>
                    </div>
                </div>
            `;
}

function filterProducts(cat) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${cat}`).classList.add('active');
    displayProducts(cat);
}
function searchProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const grid = document.getElementById('product-grid');


    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.desc.toLowerCase().includes(searchTerm)
    );


    grid.innerHTML = '';
    if (filtered.length > 0) {
        filtered.forEach(p => {
            grid.innerHTML += createProductCard(p);
        });
    } else {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-xs">No products found matching "${searchTerm}"</div>`;
    }


    lucide.createIcons();
}
function showProductDetails(id) {

    const product = products.find(p => p.id === id);


    document.getElementById('detail-name').innerText = product.name;
    document.getElementById('detail-price').innerText = "৳" + product.price.toLocaleString();
    document.getElementById('detail-desc').innerText = product.desc;
    document.getElementById('detail-img').src = product.img;

    document.getElementById('detail-action-btn').innerHTML = `
        <button onclick="addToCart('${product.name}', ${product.price})" class="w-full md:w-auto bg-[#00D4FF] text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-cyan-500/20">
            Add to Cart
        </button>
    `;


    const relatedGrid = document.getElementById('related-products-grid');
    relatedGrid.innerHTML = '';


    const related = products.filter(p => p.category === product.category && p.id !== product.id);

    related.forEach(p => {
        relatedGrid.innerHTML += createProductCard(p);
    });


    lucide.createIcons();
    navigateTo('product-details');
    window.scrollTo(0, 0);
}

function openSpecialtyModal(key) {
    const data = specialtyData[key];
    document.getElementById('spec-title').innerText = data.title;
    document.getElementById('spec-desc').innerText = data.desc;
    document.getElementById('spec-icon').innerHTML = `<i data-lucide="${data.icon}" size="64"></i>`;
    lucide.createIcons();
    document.getElementById('spec-wa-btn').onclick = () => window.open(`https://wa.me/8801976756500?text=${encodeURIComponent(data.waMsg)}`, '_blank');
    document.getElementById('specialty-modal').classList.remove('hidden');
}

function closeSpecialtyModal() { document.getElementById('specialty-modal').classList.add('hidden'); }

function navigateTo(pageId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-section'));
    document.getElementById('page-' + pageId).classList.add('active-section');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-active'));
    const btn = document.getElementById('btn-' + pageId);
    if (btn) btn.classList.add('nav-active');
    window.scrollTo(0, 0);
}

let orderTimer;
let timeLeft = 5;

function addToCart(name, price) {

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    total += price;
    updateUI();
    showOrderTimer();
}

function showOrderTimer() {
    const modal = document.getElementById('order-timer-modal');
    const timerText = document.getElementById('timer-number');
    const progressCircle = document.getElementById('timer-progress');

    modal.classList.remove('hidden');
    timeLeft = 5;
    timerText.innerText = timeLeft;

    clearInterval(orderTimer);
    orderTimer = setInterval(() => {
        timeLeft--;
        timerText.innerText = timeLeft;


        const progress = (timeLeft / 5) * 100;
        progressCircle.setAttribute('stroke-dasharray', `${progress}, 100`);

        if (timeLeft <= 0) {
            clearInterval(orderTimer);
            navigateTo('checkout');
            modal.classList.add('hidden');
        }
    }, 1000);
}

function showCustomPopup(message, type = 'alert', onConfirm = null) {
    const modal = document.getElementById('custom-popup');
    const msgElem = document.getElementById('popup-message');
    const btnContainer = document.getElementById('popup-buttons');

    msgElem.innerText = message;
    btnContainer.innerHTML = '';
    modal.classList.remove('hidden');

    if (type === 'confirm') {
        btnContainer.innerHTML = `
            <button onclick="closePopup()" class="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold uppercase text-[10px] border border-white/10 hover:bg-white/10 transition">No, Back</button>
            <button id="popup-confirm-btn" class="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase text-[10px] shadow-lg shadow-red-600/20">Yes, Clear</button>
        `;
        document.getElementById('popup-confirm-btn').onclick = () => {
            if (onConfirm) onConfirm();
            closePopup();
        };
    } else {
        btnContainer.innerHTML = `
            <button onclick="closePopup()" class="w-full py-4 bg-[#00D4FF] text-black rounded-2xl font-bold uppercase text-[10px] hover:bg-white transition">Got It</button>
        `;
    }
}

function closePopup() {
    document.getElementById('custom-popup').classList.add('hidden');
}
function cancelOrderTimer() {
    clearInterval(orderTimer);
    document.getElementById('order-timer-modal').classList.add('hidden');

    if (cart.length > 0) {
        cart.pop();
        total = 0;
        updateUI();
        showCustomPopup("Item removed from your cart.");
    }
}

function cancelFullOrder() {
    showCustomPopup("Are you sure you want to clear your cart?", "confirm", () => {
        cart = [];
        total = 0;
        updateUI();
        navigateTo('home');

        setTimeout(() => showCustomPopup("Order cleared successfully!"), 300);
    });

}
function updateUI() {
    const deliveryCharge = parseInt(document.querySelector('input[name="location"]:checked').value);
    const grandTotal = total + deliveryCharge;

    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

    let listHTML = cart.length === 0 ? "No items" :
        cart.map((item, index) => `
            <div class="flex justify-between items-center mb-4 bg-white/5 p-3 rounded-xl">
                <div class="flex flex-col">
                    <span class="font-bold text-sm">${item.name}</span>
                    <span class="text-xs text-gray-400">৳${item.price.toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="changeQuantity(${index}, -1)" class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/20 transition">-</button>
                    
                    <span class="font-bold text-[#00D4FF]">${item.quantity}</span>
                    
                    <button onclick="changeQuantity(${index}, 1)" class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500/20 transition">+</button>
                </div>
            </div>
        `).join('');

    if (cart.length > 0) {
        listHTML += `
            <div class="flex justify-between border-t border-white/10 pt-4 mt-2 italic text-gray-400">
                <span>Delivery Charge</span>
                <span>৳${deliveryCharge}</span>
            </div>`;
    }

    document.getElementById('checkout-list').innerHTML = listHTML;
    document.getElementById('checkout-total').innerText = "৳" + grandTotal.toLocaleString();
}
function changeQuantity(index, delta) {
    const item = cart[index];

    if (delta === 1) {

        item.quantity += 1;
        total += item.price;
    } else {

        if (item.quantity > 1) {
            item.quantity -= 1;
            total -= item.price;
        } else {

            total -= item.price;
            cart.splice(index, 1);
        }
    }

    updateUI();
}


//function process order
async function processOrder() {

    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value;
    const addr = document.getElementById('cust-addr').value;
    const txnId = document.getElementById('cust-txnid')?.value || "N/A";
    const method = document.querySelector('input[name="pay-method"]:checked').value;

    const deliveryCharge = parseInt(
        document.querySelector('input[name="location"]:checked').value
    );

    const grandTotal = total + deliveryCharge;

    // Check customer information
    if (!name || !email || !phone || !addr || cart.length === 0) {
        showCustomPopup("Please fill all details!");
        return;
    }

    // Check transaction ID for online payment
    if (method !== "COD" && (txnId === "N/A" || !txnId)) {
        showCustomPopup(`Please provide Transaction ID for ${method} payment!`);
        return;
    }

    const itemsText = cart
        .map((i, idx) => `${idx + 1}. ${i.name} [x${i.quantity}]`)
        .join('\n');

    // Prepare order data
    const orderData = {
        name: name,
        email: email,
        phone: phone,
        address: addr,
        items: cart,
        payment_method: method,
        transaction_id: txnId,
        product_total: total,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal
    };

    try {

        // Send order to backend
        const response = await fetch("backend/order.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        // Check database save result
        if (!data.success) {
            showCustomPopup("Order could not be saved!");
            console.error(data.message);
            return;
        }

        // WhatsApp message
        const message =
            `🚀 *NEW ORDER RECEIVED* 🚀\n` +
            `👤 *Name:* ${name}\n` +
            `📧 *Email:* ${email}\n` +
            `📞 *Phone:* ${phone}\n` +
            `📍 *Address:* ${addr}\n` +
            `--------------------------\n` +
            `💳 *Payment Method:* ${method}\n` +
            (method !== "COD"
                ? `🆔 *Txn ID:* ${txnId}\n`
                : `📝 *Note:* Pay on Delivery\n`) +
            `--------------------------\n` +
            `🛒 *Items:* \n${itemsText}\n` +
            `--------------------------\n` +
            `💵 *Product Total:* ৳${total.toLocaleString()}\n` +
            `🚚 *Delivery Charge:* ৳${deliveryCharge}\n` +
            `💰 *Grand Total:* ৳${grandTotal.toLocaleString()}\n\n` +
            `✅ Order confirmation requested.`;

        // Open WhatsApp after database save
        window.open(
            `https://wa.me/8801976756500?text=${encodeURIComponent(message)}`,
            '_blank'
        );

        showCustomPopup("Order placed successfully!");

    } catch (error) {

        console.error("Order error:", error);
        showCustomPopup("Something went wrong while placing the order.");

    }
}

// Typing text animation
const typingTextElement = document.getElementById('typing-text');

const phrases = [
    "Premium gadgets & lifestyle items from USA, UK & Japan.",
    "100% authentic products at your doorstep.",
    "Experience fast and reliable global imports.",
    "Search for your favorite gadgets now!"
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        typingTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = 65; // typing speed
    if (isDeleting) typeSpeed /= 2; // faster deleting

    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 1500; // pause at end of phrase
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // pause before typing next phrase
    }

    setTimeout(typeWriter, typeSpeed);
}

function openReviewModal() {
    document.getElementById('review-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}


function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
}


function sendReview() {
    const name = document.getElementById('rev-name').value;
    const rating = document.getElementById('rev-rating').value;
    const msg = document.getElementById('rev-message').value;


    const productName = document.getElementById('detail-name')?.innerText || "Product";

    if (!name || !msg) {
        alert("Please fill name and message!");
        return;
    }

    const stars = "⭐".repeat(rating);
    const whatsappMessage = `📝 *NEW PRODUCT REVIEW* 📝%0A%0A📦 *Product:* ${productName}%0A👤 *Name:* ${name}%0A⭐ *Rating:* ${stars}%0A💬 *Review:* ${msg}`;


    window.open(`https://wa.me/8801976756500?text=${whatsappMessage}`, '_blank');

    closeReviewModal();
}
// Call typeWriter when the page loads
window.onload = () => {
    loadProductsFromDatabase();
    typeWriter();
};

document.querySelectorAll('input[name="pay-method"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const txnInputContainer = document.getElementById('cust-txnid').parentElement;
        if (this.value === "COD") {
            txnInputContainer.style.display = "none";
        } else {
            txnInputContainer.style.display = "block";
        }
    });
});


function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
    } else {
        menu.classList.add('hidden');
        icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}
function homeSearch(event) {
    const searchTerm = document.getElementById('home-search').value.toLowerCase();


    if (event.key === 'Enter' || searchTerm.length > 2) {

        navigateTo('shop');


        const shopSearchInput = document.getElementById('product-search');
        if (shopSearchInput) {
            shopSearchInput.value = searchTerm;

            searchProducts();
        }
    }

}
