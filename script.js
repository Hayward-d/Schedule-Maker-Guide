function openSectionById(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const content = section.querySelector('.section-content');

  document.querySelectorAll('.guide-section').forEach(sec => {
    const secContent = sec.querySelector('.section-content');
    sec.classList.remove('open');
    secContent.style.maxHeight = null;
  });

  section.classList.add('open');
  content.style.maxHeight = content.scrollHeight + "px";
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAllSections() {
  document.querySelectorAll('.guide-section').forEach(sec => {
    sec.classList.remove('open');
    const content = sec.querySelector('.section-content');
    content.style.maxHeight = null;
  });
}

document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const section = header.closest('.guide-section');
    const content = header.nextElementSibling;
    const isOpen = section.classList.contains('open');

    if (isOpen) {
      section.classList.remove('open');
      content.style.maxHeight = null;
    } else {
      closeAllSections();
      section.classList.add('open');
      content.style.maxHeight = content.scrollHeight + "px";
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  });
});

document.querySelectorAll('.content-menu a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    const targetId = this.getAttribute('href').substring(1);
    const section = document.getElementById(targetId);

    if (!section) return;

    const content = section.querySelector('.section-content');

    closeAllSections();

    section.classList.add('open');
    content.style.maxHeight = content.scrollHeight + "px";
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

  });
});

document.querySelectorAll('.section-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openSectionById(link.getAttribute('href').substring(1));
  });
});

document.querySelectorAll('.section-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    const target = link.getAttribute('href').substring(1);
    const [sectionId, anchorId] = target.split(':');

    const section = document.getElementById(sectionId);
    if (!section) return;

    const content = section.querySelector('.section-content');
    const anchor = document.getElementById(anchorId);

    openSectionById(sectionId);

    setTimeout(() => {
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  });
});

const scrollBtn = document.getElementById('scrollTopBtn');
const landingBG = document.querySelector('.landing-bg');

scrollBtn.addEventListener('click', () => {
  closeAllSections();
  window.scrollTo({ top: 0, behavior: 'smooth' });

});

window.addEventListener('scroll', () => {
  if (window.scrollY < 300) {
    scrollBtn.classList.add('hidden');
  } else {
    scrollBtn.classList.remove('hidden');
  }
});

function updateFloatingButtons() {
  const shouldHideBG = window.scrollY > 500;
  const shouldHideScroll = window.scrollY < 300;

  scrollBtn.classList.toggle('hidden', shouldHideScroll);
  landingBG.classList.toggle('hidden', shouldHideBG);
}

window.addEventListener('scroll', updateFloatingButtons);

window.addEventListener('load', updateFloatingButtons);

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const resultsContainer = document.getElementById("searchResults");

const contentDropdown = document.querySelector('.content-dropdown');
const contentBtn = document.querySelector('.content-btn');
const contentMenu = document.querySelector('.content-menu');
const banner = document.querySelector('.top-banner');
const subbanner = document.querySelector('.banner-subbar');

function updateBanner() {
  banner.classList.toggle('hidden', window.scrollY > 300);
  subbanner.classList.toggle('hidden', window.scrollY > 200);
  if (searchResults.classList.contains("active") && window.scrollY > 300) {
    searchResults.classList.remove("active");
    searchInput.value = "";
  }
}

window.addEventListener('scroll', updateBanner);

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    updateBanner();
  });
});

contentBtn.addEventListener('click', e => {
  e.stopPropagation();
  contentDropdown.classList.toggle('open');
  if (searchResults.classList.contains("active")) {
    searchResults.classList.remove("active");
    searchInput.value = "";
  }
});

function closeContentMenu() {
  contentDropdown.classList.remove('open');
}

document.addEventListener('click', e => {
  if (!contentDropdown.contains(e.target)) {
    closeContentMenu()
  }
});

document.addEventListener('click', e => {
  if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
    searchResults.classList.remove("active");
    searchInput.value = "";
  }
});

let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    closeContentMenu();
  }

  lastScrollY = currentScrollY;
});

searchInput.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';

  if (!query) {
    resultsContainer.classList.remove('active');
    removeHighlights();
    return;
  }
  resultsContainer.classList.add('active');

  document.querySelectorAll(".guide-section").forEach(section => {
    const sectionId = section.id;
    const sectionTitle = section.querySelector('.section-header').innerText.substring(2);
    const content = section.querySelector('.section-content');
    const text = content.innerText;

    const regex = new RegExp(query, 'gi');
    let match;

    let matchIndex = 0;

    while ((match = regex.exec(text)) !== null) {

      const currentMatchIndex = matchIndex;
      matchIndex++;

      const start = Math.max(match.index - 40, 0);
      const end = Math.min(match.index + 40, text.length);
      const snippet = text.substring(start, end);
      const resultItem = document.createElement('div');
      resultItem.classList.add('search-item');

      const regexHighlight = new RegExp(`(${query})`, 'gi');

      const highlightedSnippet = snippet.replace(regexHighlight, '<span class="dropdown-highlight">$1</span>');

      resultItem.innerHTML = `<strong>${sectionTitle}</strong><div class="search-snippet">..${highlightedSnippet}...</div>`;

      resultItem.addEventListener("click", () => {
        openSection(section);
        setTimeout(() => {
          highlightMatch(section, query, currentMatchIndex);
        }, 500);
      });

      resultsContainer.appendChild(resultItem);
    }
  });

});

function highlightMatch(section, query, targetIndex) {

  removeHighlights();

  const content = section.querySelector('.section-content');

  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);

  let matchCount = 0;
  const regex = new RegExp(query, 'gi');

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.nodeValue;

    let match;

    while ((match = regex.exec(text)) !== null) {
      if (matchCount === targetIndex) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + query.length);

        const span = document.createElement('span');
        span.className = 'search-highlight';

        range.surroundContents(span);

        const yOffset = -120;
        const y = span.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });

        return;
      }
      matchCount++;
    }
  }
}


function removeHighlights() {
  document.querySelectorAll('.search-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
}

function openSection(section) {
  const content = section.querySelector('.section-content');

  closeAllSections();

  section.classList.add("open");
  content.style.maxHeight = content.scrollHeight + "px";
}
