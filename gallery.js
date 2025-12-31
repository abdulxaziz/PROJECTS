import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');
const emptyMessage = document.getElementById('empty-message');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');

// Load paintings from Firestore
async function loadPaintings() {
    try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintings = [];

        querySnapshot.forEach((doc) => {
            paintings.push({ id: doc.id, ...doc.data() });
        });

        loading.style.display = 'none';

        if (paintings.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }

        displayPaintings(paintings);
    } catch (error) {
        console.error("Error loading paintings:", error);
        loading.textContent = "Error loading paintings. Please try again.";
    }
}

// Display paintings as cards
function displayPaintings(paintings) {
    gallery.innerHTML = '';

    paintings.forEach(painting => {
        const card = document.createElement('div');
        card.className = 'painting-card';
        card.innerHTML = `
            <img src="${painting.imageUrl}" alt="${painting.title}" class="painting-card-image">
            <div class="painting-card-body">
                <h3>${painting.title}</h3>
                <p>${painting.description.substring(0, 100)}...</p>
                <div class="card-price">₹${painting.price}</div>
                <span class="card-status ${painting.status === 'Available' ? 'status-available' : 'status-sold'}">
                    ${painting.status}
                </span>
            </div>
        `;

        card.addEventListener('click', () => openModal(painting));
        gallery.appendChild(card);
    });
}

// Open modal with full details
function openModal(painting) {
    document.getElementById('modal-image').src = painting.imageUrl;
    document.getElementById('modal-title').textContent = painting.title;
    document.getElementById('modal-description').textContent = painting.description;
    document.getElementById('modal-price').textContent = painting.price;
    document.getElementById('modal-status').textContent = painting.status;
    document.getElementById('modal-status').className = 
        painting.status === 'Available' ? 'status status-available' : 'status status-sold';

    // Set WhatsApp link (replace with actual number)
    const whatsappNumber = '+923214657768'; // Change this to client's number
    const message = `Hi, I'm interested in buying: ${painting.title} (₹${painting.price})`;
    document.getElementById('whatsapp-btn').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    document.getElementById('whatsapp-btn').onclick = () => {
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
    };

    // Set Email link
    const emailSubject = `Inquiry about: ${painting.title}`;
    const emailBody = `Hi,\n\nI'm interested in purchasing:\n\nTitle: ${painting.title}\nPrice: ₹${painting.price}\n\nPlease let me know more details.\n\nThank you!`;
    document.getElementById('email-btn').onclick = () => {
        window.location.href = `mailto:a4857030@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    };

    modal.style.display = 'flex';
}

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Load paintings on page load
loadPaintings();