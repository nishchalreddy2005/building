/**
 * Vishala Vista - Interactive Client Logic (Dynamic Database API Connected)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const header = document.querySelector("header");
  const navToggle = document.getElementById("navToggle");
  const navLinksList = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section, footer");
  
  const searchInput = document.getElementById("directorySearch");
  const filterSelect = document.getElementById("directoryFilter");
  const directoryContainer = document.getElementById("directoryCardsContainer");
  const visualFloorButtons = document.querySelectorAll(".building-floor-btn");
  const galleryGrid = document.querySelector(".gallery-grid");
  
  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxDesc = lightbox.querySelector(".lightbox-desc");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let directoryData = [];
  let galleryData = [];
  let activeFilterFloor = "all"; // "all" or floor id (e.g. "ground", "first")
  let activeLightboxImages = [];
  let activeLightboxIndex = 0;

  // ==========================================
  // 1. Navigation Header Effects
  // ==========================================
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll Spy - Highlight active section link
    let currentSectionId = "";
    
    // Check if user is near the bottom of the page
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);
    
    if (isAtBottom) {
      currentSectionId = "contact";
    } else {
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute("id");
        }
      });
    }

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile Navigation Toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navLinksList.classList.toggle("open");
  });

  // Close mobile nav on click
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("open");
      navLinksList.classList.remove("open");
    });
  });

  // ==========================================
  // 2. Fetch Data from Backend API
  // ==========================================
  async function loadData() {
    try {
      const [directoryRes, galleryRes, propertyRes] = await Promise.all([
        fetch('/api/directory'),
        fetch('/api/gallery'),
        fetch('/api/property')
      ]);

      if (directoryRes.ok) {
        directoryData = await directoryRes.json();
        updateVisualStackIndicators();
        renderDirectory();
        setupVacancyAdvertisements();
      }

      if (galleryRes.ok) {
        galleryData = await galleryRes.json();
        renderGallery();
      }

      if (propertyRes.ok) {
        const propertyData = await propertyRes.json();
        renderPropertyInfo(propertyData);
      }
    } catch (error) {
      console.error("Error loading building data:", error);
      directoryContainer.innerHTML = `<p style="text-align:center;color:#ef4444;padding:2rem;">Failed to load building data. Please check your connection.</p>`;
    }
  }

  function renderPropertyInfo(data) {
    if (!data) return;
    
    const elements = {
      aboutTitle: data.title,
      aboutDesc1: data.description1,
      aboutDesc2: data.description2,
      accessTitle: data.accessTitle,
      accessDetails: data.accessDetails,
      locationTitle: data.locationTitle,
      locationDetails: data.locationDetails,
      scheduleWeekdays: data.scheduleWeekdays,
      scheduleSunday: data.scheduleSunday,
      amenity1: data.amenity1,
      amenity2: data.amenity2,
      amenity3: data.amenity3,
      amenity4: data.amenity4
    };

    for (const [id, val] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val;
    }

    // Dynamic Email Rendering
    const emailEl = document.getElementById("contactEmail");
    if (emailEl && data.contactEmail) {
      emailEl.href = `mailto:${data.contactEmail}`;
      emailEl.textContent = data.contactEmail;
    }

    // Dynamic Phone Numbers Rendering (supporting multiple numbers)
    const phonesContainer = document.getElementById("contactPhonesContainer");
    if (phonesContainer && data.contactPhones) {
      const phones = data.contactPhones.split(",").map(p => p.trim()).filter(Boolean);
      phonesContainer.innerHTML = phones.map(phone => {
        const cleanPhone = phone.replace(/[\s-()]/g, '');
        return `<p><a href="tel:${cleanPhone}">${phone}</a></p>`;
      }).join("");
    }

    // Operating Schedule (Preserve SVG icon, replace text)
    const scheduleHeader = document.getElementById("scheduleTitle");
    if (scheduleHeader) {
      const svg = scheduleHeader.querySelector("svg");
      scheduleHeader.innerHTML = "";
      if (svg) scheduleHeader.appendChild(svg);
      scheduleHeader.appendChild(document.createTextNode(" " + data.scheduleTitle));
    }

    // Building Amenities (Preserve SVG icon, replace text)
    const amenitiesHeader = document.getElementById("amenitiesTitle");
    if (amenitiesHeader) {
      const svg = amenitiesHeader.querySelector("svg");
      amenitiesHeader.innerHTML = "";
      if (svg) amenitiesHeader.appendChild(svg);
      amenitiesHeader.appendChild(document.createTextNode(" " + data.amenityTitle));
    }
  }

  // Update visual stack indicators (e.g. coloring vacant floors differently)
  function updateVisualStackIndicators() {
    visualFloorButtons.forEach(btn => {
      const floorId = btn.getAttribute("data-floor");
      const floorInfo = directoryData.find(f => f.id === floorId);
      
      if (floorInfo) {
        if (floorInfo.isVacant) {
          btn.classList.add("vacant-btn");
          // If label doesn't contain vacancy note, add it
          if (!btn.innerHTML.includes("VACANT")) {
            const label = btn.querySelector(".floor-label");
            if (label) {
              label.innerHTML += ` <span class="vacant-tag">[VACANT]</span>`;
            }
          }
        } else {
          btn.classList.remove("vacant-btn");
          const tag = btn.querySelector(".vacant-tag");
          if (tag) tag.remove();
        }
      }
    });
  }

  // ==========================================
  // 3. Interactive Directory Rendering & Logic
  // ==========================================
  function renderDirectory() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const typeFilter = filterSelect.value;
    
    directoryContainer.innerHTML = "";
    let matchesFound = false;

    const isShed2Split = directoryData.find(f => f.id === 'shed2')?.isSplit || false;

    directoryData.forEach(floor => {
      // If Shed 2 is split, hide the main unified Shed 2 card
      if (floor.id === 'shed2' && isShed2Split) {
        return;
      }
      // If Shed 2 is NOT split, hide the sub-shed cards (A & B)
      if ((floor.id === 'shed2a' || floor.id === 'shed2b') && !isShed2Split) {
        return;
      }

      // Check if floor matches active floor selection from building graphic
      if (activeFilterFloor !== "all") {
        if (activeFilterFloor === 'shed2') {
          // If Shed 2 button is selected, show whichever sub-spaces are active
          if (floor.id !== 'shed2' && floor.id !== 'shed2a' && floor.id !== 'shed2b') {
            return;
          }
        } else if (floor.id !== activeFilterFloor) {
          return;
        }
      }

      // Check if floor matches filters
      const matchesSearch = 
        floor.name.toLowerCase().includes(searchTerm) || 
        (!floor.isVacant && (
          floor.tenantName.toLowerCase().includes(searchTerm) ||
          floor.tenantDescription.toLowerCase().includes(searchTerm) ||
          floor.tenantCategory.toLowerCase().includes(searchTerm)
        )) ||
        (floor.isVacant && "vacant available lease rent empty".includes(searchTerm));
      
      let matchesCategory = true;
      if (typeFilter !== "all") {
        if (floor.isVacant) {
          matchesCategory = false; // vacant spaces don't belong to active categories
        } else {
          matchesCategory = 
            floor.tenantCategory.toLowerCase() === typeFilter.toLowerCase() ||
            floor.badge.toLowerCase().includes(typeFilter.toLowerCase());
        }
      }

      if (matchesSearch && matchesCategory) {
        matchesFound = true;
        
        const floorCard = document.createElement("div");
        floorCard.className = `floor-card ${activeFilterFloor !== "all" ? "highlighted" : ""} ${floor.isVacant ? "vacant-card" : ""}`;
        floorCard.id = `card-${floor.id}`;
        
        let occupantsHtml = "";
        
        if (floor.isVacant) {
          const desc = floor.tenantDescription || "Prime space is currently vacant and open for commercial/office layouts. Custom design modifications can be accommodated.";
          const contact = floor.tenantContact || "Call Management: +91 98765 43210";
          // Render Vacant Space Layout
          occupantsHtml = `
            <div class="occupant-item vacant-item-layout">
              <div class="occupant-avatar vacant-avatar">🔑</div>
              <div class="occupant-info">
                <h4 style="color: var(--accent);">Space Available for Lease</h4>
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--primary); margin: 0.15rem 0 0.4rem;">Size: ${floor.areaSft || 'N/A'}</div>
                <p>${desc}</p>
              </div>
              <div class="occupant-action">
                <span class="badge badge-vacant">AVAILABLE NOW</span>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.4rem; font-weight: 600;">
                  ${contact}
                </div>
              </div>
            </div>
          `;
        } else {
          // Render Tenant Layout
          occupantsHtml = `
            <div class="occupant-item">
              <div class="occupant-avatar">${floor.tenantInitials}</div>
              <div class="occupant-info">
                <h4>${floor.tenantName}</h4>
                <p>${floor.tenantDescription}</p>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem; font-weight: 500;">
                  Occupied Size: ${floor.areaSft || 'N/A'}
                </div>
              </div>
              <div class="occupant-action">
                <span class="badge ${floor.badgeClass}">${floor.tenantCategory}</span>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.4rem; font-weight: 500;">
                  ${floor.tenantContact}
                </div>
              </div>
            </div>
          `;
        }

        floorCard.innerHTML = `
          <div class="floor-header">
            <div class="floor-title-group">
              <div class="floor-icon">${floor.icon}</div>
              <div>
                <h3>${floor.name}</h3>
                <button class="view-floor-img-btn" data-floor-id="${floor.id}" style="background:none; border:none; color:var(--accent); font-size:0.8rem; font-weight:600; cursor:pointer; padding:0; display:flex; align-items:center; gap:0.25rem; margin-top:0.25rem; text-decoration:underline;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:14px; height:14px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Floor Images
                </button>
              </div>
            </div>
            <span class="badge ${floor.isVacant ? 'badge-vacant-header' : floor.badgeClass}">
              ${floor.isVacant ? 'VACANT' : floor.badge}
            </span>
          </div>
          <div class="floor-occupants-list">
            ${occupantsHtml}
          </div>
        `;

        directoryContainer.appendChild(floorCard);
      }
    });

    if (!matchesFound) {
      directoryContainer.innerHTML = `
        <div class="text-center" style="padding: 3rem 1rem; border: 1px dashed #cbd5e1; border-radius: 12px; background: #f8fafc;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 48px; height: 48px; margin: 0 auto 1rem; color: #94a3b8;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 style="color: #1e293b; margin-bottom: 0.5rem;">No Occupants Found</h4>
          <p style="color: #64748b; font-size: 0.9rem;">Try adjusting your search query or selecting a different floor filter.</p>
          <button class="btn btn-outline" id="resetFiltersBtn" style="margin-top: 1.25rem; padding: 0.5rem 1.25rem; font-size: 0.85rem;">Clear Filters</button>
        </div>
      `;
      
      const resetBtn = document.getElementById("resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetAllFilters);
      }
    }

    // Attach event listeners for floor images
    document.querySelectorAll(".view-floor-img-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const floorId = btn.getAttribute("data-floor-id");
        const floor = directoryData.find(f => f.id === floorId);
        
        if (floor && floor.floorImages) {
          const urls = floor.floorImages.split(",").map(url => url.trim()).filter(Boolean);
          if (urls.length > 0) {
            const images = urls.map((url, idx) => ({
              url: url,
              title: `${floor.name} - Image ${idx + 1}`,
              description: floor.tenantName ? `Interior/Exterior of ${floor.tenantName}` : `View of ${floor.name}`
            }));
            openLightboxWithImages(images, 0);
            return;
          }
        }
        
        // Fallback: Map floor IDs to specific gallery images
        const mapping = {
          second: "lobby",
          first: "lobby",
          ground: "parking",
          shed1: "shed",
          shed2: "shed",
          shed2a: "shed",
          shed2b: "shed"
        };
        
        const imgId = mapping[floorId] || "ext";
        const galleryItem = galleryData.find(item => item.id === imgId);
        
        if (galleryItem) {
          openLightboxWithImages([galleryItem], 0);
        }
      });
    });
  }

  // Handle clicking visual building elements
  visualFloorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedFloor = btn.getAttribute("data-floor");
      
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        activeFilterFloor = "all";
      } else {
        visualFloorButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilterFloor = selectedFloor;
      }
      
      renderDirectory();
      
      if (window.innerWidth <= 1024) {
        document.getElementById("directoryCardsContainer").scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Handle Search Input & Category Dropdown
  searchInput.addEventListener("input", renderDirectory);
  filterSelect.addEventListener("change", renderDirectory);

  function resetAllFilters() {
    searchInput.value = "";
    filterSelect.value = "all";
    activeFilterFloor = "all";
    visualFloorButtons.forEach(b => b.classList.remove("active"));
    renderDirectory();
  }

  // ==========================================
  // 4. Gallery Render & Lightbox Modal Logic
  // ==========================================
  function openLightboxWithImages(images, startIndex = 0) {
    if (!images || images.length === 0) return;
    activeLightboxImages = images;
    activeLightboxIndex = startIndex;

    updateLightboxContent();

    if (images.length > 1) {
      if (lightboxPrev) lightboxPrev.style.display = "flex";
      if (lightboxNext) lightboxNext.style.display = "flex";
    } else {
      if (lightboxPrev) lightboxPrev.style.display = "none";
      if (lightboxNext) lightboxNext.style.display = "none";
    }

    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function updateLightboxContent() {
    const currentImg = activeLightboxImages[activeLightboxIndex];
    if (!currentImg) return;
    lightboxImg.src = currentImg.url;
    lightboxImg.alt = currentImg.title || "";
    lightboxTitle.textContent = currentImg.title || "";
    lightboxDesc.textContent = currentImg.description || "";
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeLightboxImages.length > 1) {
        activeLightboxIndex = (activeLightboxIndex - 1 + activeLightboxImages.length) % activeLightboxImages.length;
        updateLightboxContent();
      }
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeLightboxImages.length > 1) {
        activeLightboxIndex = (activeLightboxIndex + 1) % activeLightboxImages.length;
        updateLightboxContent();
      }
    });
  }

  function renderGallery() {
    galleryGrid.innerHTML = "";
    
    galleryData.forEach(item => {
      const galleryDiv = document.createElement("div");
      galleryDiv.className = "gallery-item";
      galleryDiv.setAttribute("data-title", item.title);
      galleryDiv.setAttribute("data-desc", item.description);
      galleryDiv.setAttribute("aria-label", `View ${item.title}`);
      
      galleryDiv.innerHTML = `
        <img src="${item.url}" alt="${item.title}">
        <div class="gallery-overlay">
          <h4>${item.title}</h4>
          <p>${item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}</p>
        </div>
      `;
      
      // Add lightbox click handler
      galleryDiv.addEventListener("click", () => {
        const index = galleryData.findIndex(g => g.id === item.id);
        openLightboxWithImages(galleryData, index >= 0 ? index : 0);
      });

      galleryGrid.appendChild(galleryDiv);
    });
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!lightbox.classList.contains("open")) {
        lightboxImg.src = "";
      }
    }, 300);
  }

  lightboxClose.addEventListener("click", closeLightbox);
  
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("container") || e.target.closest(".lightbox-content") === null) {
      if (e.target !== lightboxClose && !e.target.closest(".lightbox-close") && e.target !== lightboxPrev && e.target !== lightboxNext) {
        closeLightbox();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("open")) {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft" && activeLightboxImages.length > 1) {
        activeLightboxIndex = (activeLightboxIndex - 1 + activeLightboxImages.length) % activeLightboxImages.length;
        updateLightboxContent();
      } else if (e.key === "ArrowRight" && activeLightboxImages.length > 1) {
        activeLightboxIndex = (activeLightboxIndex + 1) % activeLightboxImages.length;
        updateLightboxContent();
      }
    }
  });

  function setupVacancyAdvertisements() {
    const vacantFloors = directoryData.filter(f => f.isVacant);
    const announcementBar = document.getElementById("announcementBar");
    const heroContent = document.querySelector(".hero-content");

    if (vacantFloors.length > 0) {
      // 1. Setup Top Announcement Bar
      if (announcementBar) {
        // Find first vacant floor details
        const primaryVacant = vacantFloors[0];
        const floorName = primaryVacant.name;
        const sftText = primaryVacant.areaSft ? ` (${primaryVacant.areaSft})` : "";
        
        announcementBar.innerHTML = `
          <span>🔥 Prime space available for rent: <strong>${floorName}${sftText}</strong> is now vacant!</span>
          <span class="announcement-link" data-target="${primaryVacant.id}">
            View Details & Contact
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:14px; height:14px; display:inline; margin-left:0.25rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          <button class="announcement-close" aria-label="Close Announcement">&times;</button>
        `;
        announcementBar.style.display = "flex";
        document.body.classList.add("has-announcement");

        // Click handler to scroll to card and flash highlight it
        announcementBar.querySelector(".announcement-link").addEventListener("click", () => {
          const targetId = primaryVacant.id;
          // If Shed 2 is split, target the sub-sheds
          const isShed2Split = directoryData.find(f => f.id === 'shed2')?.isSplit || false;
          let actualCardId = `card-${targetId}`;
          if (targetId === 'shed2' && isShed2Split) {
            actualCardId = `card-shed2a`; // point to part A as representative
          }
          
          const cardEl = document.getElementById(actualCardId);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
            cardEl.classList.remove("card-flash-highlight");
            // Trigger reflow
            void cardEl.offsetWidth;
            cardEl.classList.add("card-flash-highlight");
          }
        });

        // Close announcement handler
        announcementBar.querySelector(".announcement-close").addEventListener("click", () => {
          announcementBar.style.display = "none";
          document.body.classList.remove("has-announcement");
        });
      }

      // 2. Setup Hero Badge
      if (heroContent && !document.querySelector(".hero-vacancy-badge")) {
        const badge = document.createElement("div");
        badge.className = "hero-vacancy-badge";
        badge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:16px; height:16px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Leasing Open: Space Available
        `;
        heroContent.insertBefore(badge, heroContent.firstChild);
      }
    } else {
      if (announcementBar) {
        announcementBar.style.display = "none";
        document.body.classList.remove("has-announcement");
      }
      const existingBadge = document.querySelector(".hero-vacancy-badge");
      if (existingBadge) existingBadge.remove();
    }
  }

  // Initial load
  loadData();
});
