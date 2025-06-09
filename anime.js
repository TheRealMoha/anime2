document.addEventListener('DOMContentLoaded', function() {
  // Éléments du DOM
  const container = document.getElementById("animeContainer");
  const input = document.getElementById("searchInput");
  const genreSelect = document.getElementById("genreSelect");
  const toggleBtn = document.getElementById("toggleSearch");
  const searchOptions = document.getElementById("searchOptions");
  const homeLink = document.getElementById("homeLink");
  const backToTopButton = document.getElementById("back-to-top");
  const navLinks = document.querySelectorAll('.nav-right a');
  const sections = document.querySelectorAll('section');

  // Variables
  let konamiIndex = 0;
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let debounceTimer;

  // Événements
  toggleBtn?.addEventListener("click", toggleSearchOptions);
  input?.addEventListener("input", handleSearchInput);
  genreSelect?.addEventListener("change", handleGenreChange);
  homeLink?.addEventListener("click", handleHomeClick);
  backToTopButton?.addEventListener("click", scrollToTop);
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('keydown', handleKonamiCode);

  // Navigation fluide
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Fonctions
  function toggleSearchOptions() {
    searchOptions.classList.toggle("hidden");
  }

  function handleSearchInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim();
      const genre = genreSelect.value;
      fetchAnime(query, genre);
    }, 300);
  }

  function handleGenreChange() {
    const query = input.value.trim();
    const genre = genreSelect.value;
    fetchAnime(query, genre);
  }

  function handleHomeClick(e) {
    e.preventDefault();
    scrollToTop();
    fetchAnime(); // Recharge les animes populaires
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function handleScroll() {
    // Bouton back-to-top
    if (backToTopButton) {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }

    // Gestion de la classe active pour la navigation
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPos >= sectionTop && scrollPos < (sectionTop + sectionHeight)) {
        const id = section.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  function handleKonamiCode(e) {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        document.body.classList.add('konami-mode');
        konamiIndex = 0;
        setTimeout(() => {
          alert("Anime Power Activated! ヾ(^▽^*)))");
        }, 300);
      }
    } else {
      konamiIndex = 0;
    }
  }

  async function fetchAnime(query = "", genre = "") {
    try {
      container.innerHTML = "<div class='loading'>Chargement en cours...</div>";
      
      let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24`;
      if (genre) {
        url += `&genres=${genre}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      
      const data = await res.json();
      displayAnime(data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des animes:", error);
      container.innerHTML = "<p class='error'>Impossible de charger les animes. Veuillez réessayer plus tard.</p>";
    }
  }

  function displayAnime(list) {
    container.innerHTML = "";
    
    if (!list || list.length === 0) {
      container.innerHTML = "<p class='no-results'>Aucun anime trouvé. Essayez une autre recherche.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    
    list.forEach(anime => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${anime.images?.jpg?.image_url || 'https://via.placeholder.com/180x250'}" 
             alt="${anime.title}" 
             onerror="this.src='https://via.placeholder.com/180x250'">
        <h3>${anime.title}</h3>
        <p>Score : ${anime.score ? anime.score.toFixed(1) : "N/A"}</p>
        <a href="${anime.url || '#'}" target="_blank" rel="noopener noreferrer">
          Voir sur MyAnimeList
        </a>
      `;
      fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
  }

  // Charger les animes populaires au début
  fetchAnime();
});