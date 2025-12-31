import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const addPaintingForm = document.getElementById('add-painting-form');
const logoutBtn = document.getElementById('logout-btn');
const paintingsTbody = document.getElementById('paintings-tbody');
const paintingsTable = document.getElementById('paintings-table');
const loadingDiv = document.getElementById('loading');
const emptyMessage = document.getElementById('empty-message');
const uploadMessage = document.getElementById('upload-message');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeBtn = document.querySelector('.close');

let currentEditingId = null;

// ============ LOGIN ============
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loginForm.reset();
        loadPaintings();
    } catch (error) {
        document.getElementById('login-error').textContent = error.message;
    }
});

// ============ LOGOUT ============
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    addPaintingForm.reset();
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
});

// ============ UPLOAD PAINTING ============
addPaintingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const status = document.getElementById('status').value;
    const imageFile = document.getElementById('image-input').files[0];

    if (!imageFile) {
        uploadMessage.textContent = 'Please select an image';
        uploadMessage.className = 'error';
        return;
    }

    try {
        uploadMessage.textContent = 'Uploading...';
        
        // Upload image to Storage
        const storageRef = ref(storage, 'paintings/' + Date.now() + '_' + imageFile.name);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Save to Firestore
        await addDoc(collection(db, "paintings"), {
            title,
            description,
            price: parseInt(price),
            status,
            imageUrl,
            createdAt: new Date()
        });

        uploadMessage.textContent = 'Painting uploaded successfully!';
        uploadMessage.className = 'success';
        addPaintingForm.reset();
        
        setTimeout(() => {
            uploadMessage.textContent = '';
            loadPaintings();
        }, 2000);
    } catch (error) {
        console.error("Error uploading:", error);
        uploadMessage.textContent = 'Error uploading painting: ' + error.message;
        uploadMessage.className = 'error';
    }
});

// ============ LOAD PAINTINGS ============
async function loadPaintings() {
    try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        paintingsTbody.innerHTML = '';

        if (querySnapshot.empty) {
            paintingsTable.style.display = 'none';
            loadingDiv.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }

        loadingDiv.style.display = 'none';
        emptyMessage.style.display = 'none';
        paintingsTable.style.display = 'table';

        querySnapshot.forEach((doc) => {
            const painting = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${painting.imageUrl}" class="painting-thumbnail"></td>
                <td>${painting.title}</td>
                <td>₹${painting.price}</td>
                <td>${painting.status}</td>
                <td class="actions">
                    <button class="btn btn-edit" onclick="editPainting('${doc.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="deletePainting('${doc.id}')">Delete</button>
                </td>
            `;
            paintingsTbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading paintings:", error);
        loadingDiv.textContent = 'Error loading paintings';
    }
}

// ============ EDIT PAINTING ============
window.editPainting = function(id) {
    const rows = paintingsTbody.querySelectorAll('tr');
    let paintingData;

    // Fetch the full data from Firestore
    getDocs(collection(db, "paintings")).then(snapshot => {
        snapshot.forEach(doc => {
            if (doc.id === id) {
                paintingData = doc.data();
                currentEditingId = id;

                document.getElementById('edit-id').value = id;
                document.getElementById('edit-title').value = paintingData.title;
                document.getElementById('edit-description').value = paintingData.description;
                document.getElementById('edit-price').value = paintingData.price;
                document.getElementById('edit-status').value = paintingData.status;

                editModal.style.display = 'flex';
            }
        });
    });
};

// ============ SAVE EDIT ============
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-description').value;
    const price = document.getElementById('edit-price').value;
    const status = document.getElementById('edit-status').value;
    const imageFile = document.getElementById('edit-image').files[0];

    try {
        const paintingRef = doc(db, "paintings", id);
        const updateData = {
            title,
            description,
            price: parseInt(price),
            status
        };

        // If new image selected, upload it
        if (imageFile) {
            const storageRef = ref(storage, 'paintings/' + Date.now() + '_' + imageFile.name);
            await uploadBytes(storageRef, imageFile);
            updateData.imageUrl = await getDownloadURL(storageRef);
        }

        await updateDoc(paintingRef, updateData);
        editModal.style.display = 'none';
        loadPaintings();
    } catch (error) {
        console.error("Error updating:", error);
        alert('Error updating painting: ' + error.message);
    }
});

// ============ DELETE PAINTING ============
window.deletePainting = async function(id) {
    if (confirm('Are you sure you want to delete this painting?')) {
        try {
            await deleteDoc(doc(db, "paintings", id));
            loadPaintings();
        } catch (error) {
            console.error("Error deleting:", error);
            alert('Error deleting painting');
        }
    }
};

// ============ CLOSE EDIT MODAL ============
closeBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});