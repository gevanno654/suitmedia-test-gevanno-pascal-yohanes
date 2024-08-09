// !!!!!!!!!!!!! //
// Src/Script.js //
// !!!!!!!!!!!!! //



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// List Post Function Area -Start- //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://suitmedia-backend.suitdev.com/api/ideas';
    let currentPage = 1;
    let pageSize = 10;
    let sortBy = '-published_at'; // --Defaultnya Newest khusus untuk pengguna yang pertama kali membuka website.-- //

    const sortSelect = document.getElementById('sortSelect');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const postList = document.getElementById('postList');
    const pagination = document.getElementById('pagination');

     // ----------------------------- //
    // Membaca state di LocalStorage //
   // ----------------------------- //
    const storedPageSize = localStorage.getItem('pageSize');
    const storedSortBy = localStorage.getItem('sortBy');

    // --Untuk Show per Page-- //
    if (storedPageSize) {
        pageSize = parseInt(storedPageSize);
        pageSizeSelect.value = pageSize;
    }

    // --Untuk Sort by-- //
    if (storedSortBy) {
        sortBy = storedSortBy;
        sortSelect.value = sortBy;
    }
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //



     // ------------------------------- //
    // Menyimpan state di LocalStorage //
   // ------------------------------- //
    sortSelect.addEventListener('change', () => { // --Untuk Sort by-- //
        sortBy = sortSelect.value;
        localStorage.setItem('sortBy', sortBy);
        currentPage = 1;
        fetchData();
    });

    pageSizeSelect.addEventListener('change', () => { // --Untuk Show per Page-- //
        pageSize = parseInt(pageSizeSelect.value);
        localStorage.setItem('pageSize', pageSize);
        currentPage = 1;
        fetchData();
    });
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //



     // ---------------------- //
    // Data Fetching Function //
   // ---------------------- //
    function fetchData() {
        const url = `${apiUrl}?page[number]=${currentPage}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sortBy}`;
        fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            renderPosts(data.data);
            renderPagination(data.meta);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //



     // ----------------------- //
    // Post Rendering Function //
   // ----------------------- //
    function renderPosts(posts) {
        postList.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'col-md-4 post-card';
            const publishedDate = new Date(post.published_at);
            const formattedDate = `${publishedDate.getDate()} ${publishedDate.toLocaleString('id-ID', { month: 'long' })} ${publishedDate.getFullYear()}`;
            card.innerHTML = `
                <div class="card">
                    <img src="${post.small_image[0].url}" data-src="${post.medium_image[0].url}" class="card-img-top lazy-load" alt="${post.title}">
                    <div class="card-body">
                        <p class="card-text published-date">${formattedDate}</p>
                        <h5 class="card-title post-title">${post.title}</h5>
                    </div>
                </div>
            `;
            postList.appendChild(card);
        });
        lazyLoadImages();// --Insialisasi lazy loading-- //
    }
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //

    

     // --------------------- //
    // Lazy Loading Function //
   // --------------------- //
    function lazyLoadImages() {
        const lazyLoadImages = document.querySelectorAll('.lazy-load');

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                }
            });
        });

        lazyLoadImages.forEach(img => {
            observer.observe(img);
        });
    }
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //



     // ----------------------------- //
    // Pagination Rendering Function //
   // ----------------------------- //
    function renderPagination(paginationData) {
        const showingText = document.getElementById('showingText');
        const totalItems = paginationData.total;
        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);
    
        showingText.textContent = `Showing ${startItem} - ${endItem} of ${totalItems}`;
    
        pagination.innerHTML = '';
        const totalPages = paginationData.last_page;
        const startPage = Math.max(currentPage - 2, 1);
        const endPage = Math.min(startPage + 4, totalPages);
    
        // --Menambahkan tombol "<<" untuk ke halaman awal-- //
        addPaginationItem('<<', 1, currentPage > 1);
    
        // --Menambahkan tombol "<" untuk ke halaman sebelumnya-- //
        addPaginationItem('<', Math.max(currentPage - 1, 1), currentPage > 1);
    
        // --Menambahkan Angka Halaman-- //
        for (let i = startPage; i <= endPage; i++) {
            addPaginationItem(i, i);
        }
    
        // --Menambahkan tombol ">" untuk ke halaman selanjutnya-- //
        addPaginationItem('>', Math.min(currentPage + 1, totalPages), currentPage < totalPages);
    
        // --Menambahkan tombol ">>" untuk ke halaman akhir-- //
        addPaginationItem('>>', totalPages, currentPage < totalPages);
    }
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //



     // --------------------------------- //
    // Pagination Item Creation Function //
   // --------------------------------- //
    function addPaginationItem(label, page, isEnabled = true) {
        const li = document.createElement('li');
        li.className = `page-item ${page === currentPage ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}`;
        
        // Menambahkan atribut aria-label untuk arrow pagination
        let ariaLabel = '';
        if (label === '<<') {
            ariaLabel = 'First';
        } else if (label === '<') {
            ariaLabel = 'Previous';
        } else if (label === '>') {
            ariaLabel = 'Next';
        } else if (label === '>>') {
            ariaLabel = 'Last';
        }
    
        li.innerHTML = `<a class="page-link" href="#"${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}>${label}</a>`;
        
        if (isEnabled) {
            li.addEventListener('click', (event) => {
                event.preventDefault();
                currentPage = page;
                fetchData();
            });
        }
        pagination.appendChild(li);
    }

    fetchData();
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //



     // -------------------------------- //
    // Inisialisasi Lenis Smooth Scroll //
   // -------------------------------- //
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
     // ----------------------------- //
    // ------------ END ------------ //
   // ----------------------------- //
});

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// List Post Function Area -End- //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------- //


// !!!!!!!!!!!!!!!!!!!!! //
// Nav-Link Area -Start- //
// !!!!!!!!!!!!!!!!!!!!! //

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = {
        'work.html': 'workLink',
        'about.html': 'aboutLink',
        'services.html': 'servicesLink',
        'ideas.html': 'ideasLink',
        'careers.html': 'careersLink',
        'contact.html': 'contactLink'
    };

    if (navLinks[currentPage]) {
        document.getElementById(navLinks[currentPage]).classList.add('active');
    }
});

// !!!!!!!!!!!!!!!!!!! //
// Nav-Link Area -End- //
// !!!!!!!!!!!!!!!!!!! //


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------- //


// !!!!!!!!!!!!!!!!!!!!!!!!!!! //
// Navbar Trigger Area -Start- //
// !!!!!!!!!!!!!!!!!!!!!!!!!!! //

document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Scrolling down
            navbar.classList.add('navbar-hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-transparent');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
});

// !!!!!!!!!!!!!!!!!!!!!!!!! //
// Navbar Trigger Area -End- //
// !!!!!!!!!!!!!!!!!!!!!!!!! //


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------- //


// !!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// Parallax Banner Area -Start- //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!! //

window.onload = function() {
    const scrollPosition = window.pageYOffset;
    const bannerText = document.querySelector('.banner-text');
    const bannerImage = document.querySelector('.banner-image');

    // Inisialisasi posisi awal
    bannerText.style.transform = `translate(-50%, calc(-50% + ${scrollPosition * 0.20}px))`;
    bannerImage.style.transform = `translateY(${scrollPosition * 0.4}px) scale(1)`;

    document.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;

        // Efek Parallax saat scroll
        bannerText.style.transform = `translate(-50%, calc(-50% + ${scrollPosition * 0.20}px))`;
        bannerImage.style.transform = `translateY(${scrollPosition * 0.4}px) scale(1)`;
    });
};

// !!!!!!!!!!!!!!!!!!!!!!!!!! //
// Parallax Banner Area -End- //
// !!!!!!!!!!!!!!!!!!!!!!!!!! //