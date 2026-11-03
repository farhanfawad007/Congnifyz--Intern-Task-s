const API_BASE = '/api/items';

const form = document.getElementById('item-form');
const formTitle = document.getElementById('form-title');
const itemIdInput = document.getElementById('item-id');
const nameInput = document.getElementById('item-name');
const descriptionInput = document.getElementById('item-description');
const priceInput = document.getElementById('item-price');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const itemsList = document.getElementById('items-list');
const itemCount = document.getElementById('item-count');
const loadingEl = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const notification = document.getElementById('notification');

let notificationTimeout = null;

// --- Notification helpers ---

function showNotification(message, type = 'success') {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');

  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    notification.classList.add('hidden');
  }, 4000);
}

// --- API helpers ---

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from server.');
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`);
  }

  return data;
}

// --- Render helpers ---

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function renderItems(items) {
  loadingEl.classList.add('hidden');

  if (items.length === 0) {
    itemsList.innerHTML = '';
    emptyState.classList.remove('hidden');
    itemCount.textContent = '0 items';
    return;
  }

  emptyState.classList.add('hidden');
  itemCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  itemsList.innerHTML = items
    .map(
      (item) => `
      <article class="item-card" data-id="${item.id}">
        <div class="item-info">
          <h3 class="item-name">${escapeHtml(item.name)}</h3>
          <p class="item-description">${escapeHtml(item.description) || 'No description'}</p>
          <span class="item-price">${formatPrice(item.price)}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-edit" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="btn btn-delete" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </article>
    `
    )
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- Form state ---

function resetForm() {
  form.reset();
  itemIdInput.value = '';
  formTitle.textContent = 'Add New Item';
  submitBtn.textContent = 'Add Item';
  cancelBtn.classList.add('hidden');
}

function populateForm(item) {
  itemIdInput.value = item.id;
  nameInput.value = item.name;
  descriptionInput.value = item.description;
  priceInput.value = item.price;
  formTitle.textContent = 'Edit Item';
  submitBtn.textContent = 'Update Item';
  cancelBtn.classList.remove('hidden');
  nameInput.focus();
}

function getFormData() {
  return {
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    price: priceInput.value,
  };
}

function validateForm() {
  const { name, price } = getFormData();

  if (!name) {
    showNotification('Please enter an item name.', 'error');
    nameInput.focus();
    return false;
  }

  const parsedPrice = parseFloat(price);
  if (price === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) {
    showNotification('Please enter a valid non-negative price.', 'error');
    priceInput.focus();
    return false;
  }

  return true;
}

// --- CRUD operations ---

async function fetchItems() {
  try {
    loadingEl.classList.remove('hidden');
    const result = await apiRequest(API_BASE);
    renderItems(result.data);
  } catch (error) {
    loadingEl.classList.add('hidden');
    showNotification(error.message, 'error');
  }
}

async function createItem(data) {
  const result = await apiRequest(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  showNotification(result.message, 'success');
  resetForm();
  await fetchItems();
}

async function updateItem(id, data) {
  const result = await apiRequest(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  showNotification(result.message, 'success');
  resetForm();
  await fetchItems();
}

async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const result = await apiRequest(`${API_BASE}/${id}`, { method: 'DELETE' });
    showNotification(result.message, 'success');

    if (itemIdInput.value === String(id)) {
      resetForm();
    }

    await fetchItems();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function editItem(id) {
  try {
    const result = await apiRequest(API_BASE);
    const item = result.data.find((i) => i.id === id);

    if (!item) {
      showNotification(`Item with ID ${id} not found.`, 'error');
      return;
    }

    populateForm(item);
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// --- Event listeners ---

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const data = getFormData();
  const id = itemIdInput.value;

  submitBtn.disabled = true;

  try {
    if (id) {
      await updateItem(id, data);
    } else {
      await createItem(data);
    }
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', resetForm);

itemsList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id = parseInt(btn.dataset.id, 10);
  const action = btn.dataset.action;

  if (action === 'edit') {
    editItem(id);
  } else if (action === 'delete') {
    deleteItem(id);
  }
});

// Initial load
fetchItems();
