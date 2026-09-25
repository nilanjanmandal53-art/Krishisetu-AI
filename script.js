
// Replace lines 1 and 2 at the top of script.js with these:
// Replace lines 1 and 2 in script.js with this:
const API_URL = 'http://127.0.0.1:3000/api/produce';
const AUTH_API_URL = 'http://127.0.0.1:3000/api/login';

let currentRole = 'Farmer';
let userProfile = {
    role: 'Farmer',
    name: '',
    location: '',
    acres: '',
    crop: '',
    storage: 'None',
    transport: 'Need Pickup',
    preferredArea: 'Local Mandi'
};

// Produce Data List
let produceList = [
    {
        id: 1,
        name: "Tomato",
        qty: 500,
        price: 30,
        quality: "Grade A",
        harvestDate: "2026-09-04",
        expiryDate: "2026-09-10",
        location: "South 24 Parganas",
        storage: "Cold Store"
    }
];

// 1. INITIALIZE & RESTORE SESSION ON PAGE LOAD

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            
            // Restore Dashboard
            document.getElementById('dash-welcome').innerText = `Welcome, ${user.name}`;
            document.getElementById('dash-role').innerText = user.role || 'Farmer';
            document.getElementById('dash-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${user.district || 'West Bengal'}`;

            // Restore Profile Inputs
            document.getElementById('prof-input-name').value = user.name || '';
            document.getElementById('prof-input-location').value = user.district || '';
            setProfileRole(user.role || 'Farmer');

            // Show Dashboard
            document.getElementById('auth-card').classList.add('hidden');
            document.getElementById('dashboard-card').classList.remove('hidden');

            renderProduceList();
        } catch (e) {
            console.error("Error restoring session:", e);
        }
    }
});

function setRole(role) {
    currentRole = role;
    const btnFarmer = document.getElementById('btn-farmer');
    const btnFpo = document.getElementById('btn-fpo');
    if (role === 'Farmer') {
        btnFarmer.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-white text-emerald-600 shadow-sm transition";
        btnFpo.className = "flex-1 py-2 text-sm font-semibold rounded-md text-slate-600 transition";
    } else {
        btnFpo.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-white text-emerald-600 shadow-sm transition";
        btnFarmer.className = "flex-1 py-2 text-sm font-semibold rounded-md text-slate-600 transition";
    }
}

// 2. ASYNC LOGIN FUNCTION CONNECTED TO BACKEND
async function loginFarmer() {
    const nameInput = document.getElementById('input-name').value.trim();
    const phoneInput = document.getElementById('input-phone').value.trim();
    const districtInput = document.getElementById('input-district').value.trim();

    if (!nameInput || !phoneInput) {
        alert("Please enter both your Name and Mobile Number.");
        return;
    }

    try {
        const response = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: currentRole,
                name: nameInput,
                phone: phoneInput,
                district: districtInput
            })
        });

        const result = await response.json();

        if (result.success) {
            const user = result.user;

            // Save session to LocalStorage
            localStorage.setItem('userData', JSON.stringify(user));
            localStorage.setItem('sellerPhone', user.phone);

            // Update Dashboard UI
            document.getElementById('dash-welcome').innerText = `Welcome, ${user.name}`;
            document.getElementById('dash-role').innerText = user.role;
            document.getElementById('dash-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${user.district}, West Bengal`;

            // Pre-fill Profile Drawer fields
            document.getElementById('prof-input-name').value = user.name;
            document.getElementById('prof-input-location').value = user.district;
            setProfileRole(user.role);

            // Show Dashboard
            document.getElementById('auth-card').classList.add('hidden');
            document.getElementById('dashboard-card').classList.remove('hidden');

            renderProduceList();
        } else {
            alert(result.message || "Login failed");
        }
    } catch (err) {
        console.error("Backend Connection Error:", err);
        alert("Unable to reach backend server. Make sure 'node server.js' is running in terminal!");
    }
}

function logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('sellerPhone');

    const sidebar = document.getElementById('profile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');

    document.getElementById('dashboard-card').classList.add('hidden');
    document.getElementById('auth-card').classList.remove('hidden');
}

// 3. PROFILE DRAWER CONTROLS
function toggleSidebar() {
    const sidebar = document.getElementById('profile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        if (overlay) overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
    }
}

function setProfileRole(role) {
    userProfile.role = role;
    const badge = document.getElementById('role-badge');
    const label = document.getElementById('label-profile-name');
    if (badge) badge.innerText = role;
    if (label) label.innerText = role === 'Farmer' ? 'Farmer Name' : 'FPO Entity Name';

    const farmerBtn = document.getElementById('prof-role-farmer');
    const fpoBtn = document.getElementById('prof-role-fpo');
    if (farmerBtn) farmerBtn.className = role === 'Farmer' ? 'py-2 text-xs font-bold rounded-md bg-white text-emerald-700 shadow-sm' : 'py-2 text-xs font-bold rounded-md text-slate-600';
    if (fpoBtn) fpoBtn.className = role === 'FPO' ? 'py-2 text-xs font-bold rounded-md bg-white text-emerald-700 shadow-sm' : 'py-2 text-xs font-bold rounded-md text-slate-600';
}

function setProfileStorage(type, event) {
    userProfile.storage = type;
    document.querySelectorAll('.prof-storage-chip').forEach(el => el.classList.remove('border-emerald-600', 'bg-emerald-50', 'text-emerald-700'));
    event.currentTarget.classList.add('border-emerald-600', 'bg-emerald-50', 'text-emerald-700');
}

function setProfileTransport(type, event) {
    userProfile.transport = type;
    document.querySelectorAll('.prof-transport-chip').forEach(el => el.classList.remove('border-emerald-600', 'bg-emerald-50', 'text-emerald-700'));
    event.currentTarget.classList.add('border-emerald-600', 'bg-emerald-50', 'text-emerald-700');
}

function setProfileArea(area, event) {
    userProfile.preferredArea = area;
    document.querySelectorAll('.prof-area-chip').forEach(el => el.classList.remove('border-emerald-600', 'bg-emerald-50', 'text-emerald-700'));
    event.currentTarget.classList.add('border-emerald-600', 'bg-emerald-50', 'text-emerald-700');
}

function autoDetectProfileLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {
            document.getElementById('prof-input-location').value = "Sonarpur, WB (GPS)";
        });
    }
}

// 4. SAVE PROFILE UPDATES
function handleProfileSubmit(e) {
    e.preventDefault();
    const newName = document.getElementById('prof-input-name').value;
    const newLocation = document.getElementById('prof-input-location').value;

    userProfile.name = newName;
    userProfile.location = newLocation;
    userProfile.acres = document.getElementById('prof-input-acres').value;
    userProfile.crop = document.getElementById('prof-input-crop').value;

    // Save to LocalStorage
    const existingUser = JSON.parse(localStorage.getItem('userData') || '{}');
    const updatedUser = { ...existingUser, name: newName, district: newLocation, role: userProfile.role };
    localStorage.setItem('userData', JSON.stringify(updatedUser));

    // Live update UI
    document.getElementById('dash-welcome').innerText = `Welcome, ${newName}`;
    document.getElementById('dash-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${newLocation}`;

    const statusEl = document.getElementById('profile-status');
    if (statusEl) {
        statusEl.innerText = "Saved successfully!";
        statusEl.className = "text-xs font-bold text-emerald-600";

        setTimeout(() => {
            statusEl.innerText = "Up to date";
            statusEl.className = "text-xs text-slate-500";
            toggleSidebar();
        }, 1000);
    }
}

// 5. PRODUCE MODULE FUNCTIONS
function openProduceModal(editId = null) {
    const modal = document.getElementById('produce-modal');
    const form = document.getElementById('produce-form');
    const modalTitle = document.getElementById('modal-title');
    modal.classList.remove('hidden');

    if (editId) {
        modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Produce Listing`;
        const item = produceList.find(p => p.id === editId);
        document.getElementById('edit-produce-id').value = item.id;
        document.getElementById('prod-name').value = item.name;
        document.getElementById('prod-qty').value = item.qty;
        document.getElementById('prod-price').value = item.price;
        document.getElementById('prod-quality').value = item.quality;
        document.getElementById('prod-storage').value = item.storage;
        document.getElementById('prod-harvest-date').value = item.harvestDate;
        document.getElementById('prod-expiry-date').value = item.expiryDate;
        document.getElementById('prod-location').value = item.location;
    } else {
        modalTitle.innerHTML = `<i class="fa-solid fa-wheat-field"></i> Add Produce Listing`;
        form.reset();
        document.getElementById('edit-produce-id').value = '';
        document.getElementById('prod-location').value = document.getElementById('prof-input-location').value || "South 24 Parganas";
    }
}

function closeProduceModal() {
    document.getElementById('produce-modal').classList.add('hidden');
}

function renderProduceList() {
    const container = document.getElementById('produce-list-container');
    container.innerHTML = '';

    let totalVolume = 0;

    if (produceList.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic col-span-2 text-center py-6">No produce listed yet. Click "Add Produce" to upload your stock.</p>`;
        document.getElementById('dash-produce').innerText = "0 kg";
        return;
    }

    produceList.forEach(item => {
        totalVolume += parseFloat(item.qty) || 0;
        const card = document.createElement('div');
        card.className = "bg-slate-50 rounded-xl border border-slate-200 p-4 relative hover:shadow-md transition";
        card.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex gap-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        🌾
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-sm font-bold text-slate-800">${item.name}</h4>
                            <span class="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">${item.quality}</span>
                        </div>
                        <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <i class="fa-solid fa-location-dot text-slate-400"></i> ${item.location}
                        </p>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="openProduceModal(${item.id})" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white transition" title="Edit Listing">
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                    <button onclick="deleteProduce(${item.id})" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition" title="Delete Listing">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 my-3 py-2 px-3 bg-white rounded-lg border border-slate-100 text-xs">
                <div>
                    <span class="text-slate-400 block text-[10px]">Stock Quantity</span>
                    <span class="font-bold text-slate-700">${item.qty} kg</span>
                </div>
                <div>
                    <span class="text-slate-400 block text-[10px]">Expected Price</span>
                    <span class="font-bold text-emerald-600">₹${item.price} / kg</span>
                </div>
            </div>

            <div class="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Harvest: <strong>${item.harvestDate}</strong></span>
                <span class="text-amber-600 font-semibold">Valid till ${item.expiryDate}</span>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('dash-produce').innerText = `${totalVolume.toLocaleString()} kg`;
}

function saveProduce(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-produce-id').value;

    const produceData = {
        id: editId ? parseInt(editId) : Date.now(),
        name: document.getElementById('prod-name').value,
        qty: document.getElementById('prod-qty').value,
        price: document.getElementById('prod-price').value,
        quality: document.getElementById('prod-quality').value,
        storage: document.getElementById('prod-storage').value,
        harvestDate: document.getElementById('prod-harvest-date').value,
        expiryDate: document.getElementById('prod-expiry-date').value,
        location: document.getElementById('prod-location').value
    };

    if (editId) {
        const index = produceList.findIndex(p => p.id === parseInt(editId));
        produceList[index] = produceData;
    } else {
        produceList.push(produceData);
    }

    renderProduceList();
    closeProduceModal();
}

function deleteProduce(id) {
    if (confirm("Are you sure you want to remove this produce listing?")) {
        produceList = produceList.filter(p => p.id !== id);
        renderProduceList();
    }
}