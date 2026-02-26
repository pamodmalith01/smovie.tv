// --- smovie.tv Core Application ---

// Configuration
const ADMIN_EMAIL = "pamodmalith70@gmail.com";
const MOVIES_PER_PAGE = 8; // Adjust for "pages" requirement

// DOM Elements
const authContainer = document.getElementById('auth-container');
const loginBtn = document.getElementById('login-btn');
const userProfile = document.getElementById('user-profile');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

const navAddMovie = document.getElementById('nav-add-movie');
const adminSection = document.getElementById('admin-section');
const addMovieForm = document.getElementById('add-movie-form');
const moviesGrid = document.getElementById('movies-grid');

// Pagination Elements
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

// State
let currentUser = null;
let currentPage = 1;

// Initial Movies (Pre-loaded for demo purposes)
let movies = JSON.parse(localStorage.getItem('smovie_db')) || [
    {
        id: crypto.randomUUID(),
        title: "Dune: Part Two",
        year: 2024,
        rating: 8.8,
        poster: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=700&auto=format&fit=crop",
        url: "#",
        createdAt: new Date().toISOString()
    },
    {
        id: crypto.randomUUID(),
        title: "Inception",
        year: 2010,
        rating: 8.8,
        poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=700&auto=format&fit=crop",
        url: "#",
        createdAt: new Date(Date.now() - 100000).toISOString()
    },
    {
        id: crypto.randomUUID(),
        title: "Interstellar",
        year: 2014,
        rating: 8.6,
        poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=700&auto=format&fit=crop",
        url: "#",
        createdAt: new Date(Date.now() - 200000).toISOString()
    },
    {
        id: crypto.randomUUID(),
        title: "The Dark Knight",
        year: 2008,
        rating: 9.0,
        poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=700&auto=format&fit=crop",
        url: "#",
        createdAt: new Date(Date.now() - 300000).toISOString()
    }
];

// --- AUTHENTICATION ---
function initAuth() {
    const savedSession = localStorage.getItem('smovie_user_session');
    if (savedSession) {
        handleUserChange(JSON.parse(savedSession));
    } else {
        handleUserChange(null);
    }
}

loginBtn.addEventListener('click', () => {
    // Simulated Google Popup
    const emailInput = prompt("Sign in with Google\nEnter your email:", "");

    if (emailInput && emailInput.trim() !== '' && emailInput.includes('@')) {
        const email = emailInput.trim().toLowerCase();
        const namePart = email.split('@')[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[^a-zA-Z0-9]/g, ' ');

        const mockGoogleUser = {
            email: email,
            displayName: displayName,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`
        };

        localStorage.setItem('smovie_user_session', JSON.stringify(mockGoogleUser));
        handleUserChange(mockGoogleUser);
    } else if (emailInput !== null) {
        alert("Please enter a valid email address.");
    }
});

logoutBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem('smovie_user_session');
        handleUserChange(null);
    }
});

function handleUserChange(user) {
    currentUser = user;

    if (user) {
        authContainer.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.classList.add('flex');

        userAvatar.src = user.photoURL;
        userName.textContent = user.displayName;

        // --- ADMIN RESTRICTION ---
        // Only pamodmalith70@gmail.com can see Add Movie UI
        if (user.email === ADMIN_EMAIL) {
            navAddMovie.classList.remove('hidden');
            navAddMovie.classList.add('flex');
            adminSection.classList.remove('hidden');
        } else {
            navAddMovie.classList.add('hidden');
            navAddMovie.classList.remove('flex');
            adminSection.classList.add('hidden');
        }
    } else {
        authContainer.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userProfile.classList.remove('flex');

        navAddMovie.classList.add('hidden');
        navAddMovie.classList.remove('flex');
        adminSection.classList.add('hidden');
    }
}

// --- PAGINATION & RENDERING ---
function renderMovies() {
    moviesGrid.innerHTML = '';

    if (movies.length === 0) {
        moviesGrid.innerHTML = `<div class="col-span-full py-20 text-center text-gray-500 italic">No movies cataloged yet.</div>`;
        return;
    }

    const sortedMovies = [...movies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate pages
    const totalPages = Math.ceil(sortedMovies.length / MOVIES_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    const end = start + MOVIES_PER_PAGE;
    const paginatedMovies = sortedMovies.slice(start, end);

    paginatedMovies.forEach(movie => {
        const card = document.createElement('div');
        card.className = "group relative bg-dark-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-500 shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full";

        const safePoster = movie.poster || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=700&auto=format&fit=crop";

        card.innerHTML = `
            <div class="relative aspect-[2/3] w-full overflow-hidden bg-dark-900">
                <img src="${safePoster}" alt="${movie.title}" onerror="this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=700&auto=format&fit=crop'" class="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 transform">
                <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent"></div>
                <div class="absolute top-3 right-3 bg-brand-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md flex items-center shadow-lg">
                    <i class="fas fa-star text-yellow-300 mr-1 text-[10px]"></i> ${parseFloat(movie.rating).toFixed(1)}
                </div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 z-10">
                    <div class="bg-brand-500 text-white rounded-full w-14 h-14 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(229,9,20,0.6)]">
                        <i class="fas fa-play text-xl ml-1"></i>
                    </div>
                </div>
            </div>
            <div class="p-4 flex-grow flex flex-col justify-end bg-dark-800 absolute bottom-0 w-full z-20">
                <h3 class="text-white font-bold text-lg truncate drop-shadow-md pb-1">${movie.title}</h3>
                <div class="flex items-center text-xs text-gray-400 space-x-3">
                    <span class="flex items-center"><i class="fas fa-calendar-alt text-brand-500 mr-1.5"></i> ${movie.year}</span>
                    <span class="border border-gray-600 px-1.5 rounded text-[10px] uppercase font-semibold">4K</span>
                </div>
            </div>
        `;
        moviesGrid.appendChild(card);
    });

    // Update Pagination UI
    currentPageSpan.textContent = currentPage;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderMovies();
        window.scrollTo({ top: moviesGrid.offsetTop - 100, behavior: 'smooth' });
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderMovies();
        window.scrollTo({ top: moviesGrid.offsetTop - 100, behavior: 'smooth' });
    }
});

// --- MOVIE UPLOAD ---
addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        alert("Only pamodmalith70@gmail.com is authorized to upload movies.");
        return;
    }

    const title = document.getElementById('movie-title').value;
    const year = document.getElementById('movie-year').value;
    const rating = document.getElementById('movie-rating').value;
    const poster = document.getElementById('movie-poster').value;
    const movieFile = document.getElementById('movie-file').files[0];

    if (!movieFile) {
        alert("Please select a movie file.");
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressContainer = document.getElementById('upload-progress-container');
    const uploadStatus = document.getElementById('upload-status');

    // UI State: Uploading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Processing...';
    progressContainer.classList.remove('hidden');
    uploadStatus.classList.remove('hidden');

    // MOCKING GB UPLOAD PROGRESS
    // Since this is client-side, we simulate the "GB" upload time
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Finalize upload
            const newMovie = {
                id: crypto.randomUUID(),
                title: title,
                year: parseInt(year),
                rating: parseFloat(rating),
                poster: poster,
                fileSize: (movieFile.size / (1024 * 1024 * 1024)).toFixed(2) + " GB",
                createdAt: new Date().toISOString(),
                url: "#" // In a real app, this would be the URL from Firebase/S3
            };

            movies.unshift(newMovie);
            localStorage.setItem('smovie_db', JSON.stringify(movies));

            // UI Reset
            alert(`Success! "${title}" (${newMovie.fileSize}) uploaded to smovie.tv.`);
            addMovieForm.reset();
            progressContainer.classList.add('hidden');
            uploadStatus.classList.add('hidden');
            progressBar.style.width = '0%';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2 text-xl"></i> Publish to Catalog';

            currentPage = 1;
            renderMovies();
        }
        progressBar.style.width = progress + '%';
    }, 200);
});

// Initialize
initAuth();
renderMovies();
