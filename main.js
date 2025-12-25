// API Endpoints
const randomApi = 'https://www.themealdb.com/api/json/v1/1/random.php';
const searchApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
const detailsApi = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

// Load random recipes on page load
async function loadRecipes() {
    const grid = document.getElementById('recipesGrid');
    grid.innerHTML = '<p class="text-center col-span-full text-xl py-20 text-gray-600">Loading featured recipes...</p>';

    const recipes = [];
    for (let i = 0; i < 6; i++) {
        try {
            const res = await fetch(randomApi);
            const data = await res.json();
            if (data.meals && data.meals[0]) {
                recipes.push(data.meals[0]);
            }
        } catch (e) {
            console.error('Random fetch failed:', e);
        }
    }
    showRecipes(recipes);
}

// Show recipes in cards
function showRecipes(recipes) {
    const grid = document.getElementById('recipesGrid');
    grid.innerHTML = '';

    if (recipes.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-full text-xl py-20 text-red-600">No recipes loaded. Try searching!</p>';
        return;
    }

    recipes.forEach(r => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition';
        card.innerHTML = `
            <img src="${r.strMealThumb || 'images/default-recipe.jpg'}" alt="${r.strMeal}" class="w-full h-56 object-cover">
            <div class="p-5">
                <h3 class="text-xl font-bold mb-2">${r.strMeal}</h3>
                <p class="text-gray-600 mb-4">${r.strInstructions?.substring(0, 100) || 'Click for details'}...</p>
                <button class="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600 view-btn" data-id="${r.idMeal}">View Details</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => loadDetails(btn.dataset.id);
    });
}

// Load details for modal
async function loadDetails(id) {
    try {
        const res = await fetch(`${detailsApi}${id}`);
        const data = await res.json();
        const r = data.meals?.[0];
        if (!r) return alert("Recipe not found");

        document.getElementById('modalTitle').textContent = r.strMeal;
        document.getElementById('modalImage').src = r.strMealThumb || 'images/default-recipe.jpg';
        document.getElementById('modalInstructions').textContent = r.strInstructions;

        const list = document.getElementById('modalIngredients');
        list.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const ing = r[`strIngredient${i}`];
            const meas = r[`strMeasure${i}`];
            if (ing && ing.trim()) {
                list.innerHTML += `<li>${meas.trim()} ${ing.trim()}</li>`;
            }
        }

        document.getElementById('recipeModal').classList.remove('hidden');
    } catch (e) {
        alert("Error loading details");
    }
}

// Search handler
document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault();
    const q = document.getElementById('searchInput').value.trim();
    if (!q) return loadRecipes();

    const grid = document.getElementById('recipesGrid');
    grid.innerHTML = `<p class="text-center col-span-full text-xl py-20 text-gray-600">Searching "${q}"...</p>`;

    try {
        const res = await fetch(`${searchApi}${encodeURIComponent(q)}`);
        const data = await res.json();
        showRecipes(data.meals || []);
    } catch (e) {
        grid.innerHTML = '<p class="text-center col-span-full text-xl py-20 text-red-600">Search failed. Check your internet.</p>';
    }
};

// Close modal
document.getElementById('closeModal').onclick = () => {
    document.getElementById('recipeModal').classList.add('hidden');
};

// Scroll to top
document.getElementById('scrollTop').onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
window.onscroll = () => {
    document.getElementById('scrollTop').classList.toggle('hidden', window.scrollY < 300);
};

// Start on load
window.onload = loadRecipes;