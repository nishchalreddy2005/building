/**
 * Vishala Vista - Admin Panel Interactivity
 */

document.addEventListener("DOMContentLoaded", () => {
  const updateChannel = new BroadcastChannel("vishala_vista_updates");

  // Authentication Elements
  const loginSection = document.getElementById("loginSection");
  const loginForm = document.getElementById("loginForm");
  const adminPasswordInput = document.getElementById("adminPassword");
  const loginError = document.getElementById("loginError");
  
  // Dashboard Elements
  const dashboardSection = document.getElementById("dashboardSection");
  const adminDirectoryList = document.getElementById("adminDirectoryList");
  const logoutBtn = document.getElementById("logoutBtn");
  
  // Modal Split Checkbox
  const splitShed2FormGroup = document.getElementById("splitShed2FormGroup");
  const editIsSplit = document.getElementById("editIsSplit");

  // Modal Elements
  const editModal = document.getElementById("editModal");
  const editOccupantForm = document.getElementById("editOccupantForm");
  const editFloorId = document.getElementById("editFloorId");
  const modalFloorTitle = document.getElementById("modalFloorTitle");
  
  // Containers
  const unifiedShedFieldsContainer = document.getElementById("unifiedShedFieldsContainer");
  const splitShedFieldsContainer = document.getElementById("splitShedFieldsContainer");

  // Unified/Single Elements
  const editIsVacant = document.getElementById("editIsVacant");
  const editAreaSft = document.getElementById("editAreaSft");
  const tenantFieldsContainer = document.getElementById("tenantFieldsContainer");
  const editTenantName = document.getElementById("editTenantName");
  const editTenantCategory = document.getElementById("editTenantCategory");
  const editTenantInitials = document.getElementById("editTenantInitials");
  const editTenantDescription = document.getElementById("editTenantDescription");
  const editTenantContact = document.getElementById("editTenantContact");

  // Part A Elements
  const editIsVacantA = document.getElementById("editIsVacantA");
  const editAreaSftA = document.getElementById("editAreaSftA");
  const tenantFieldsContainerA = document.getElementById("tenantFieldsContainerA");
  const editTenantNameA = document.getElementById("editTenantNameA");
  const editTenantCategoryA = document.getElementById("editTenantCategoryA");
  const editTenantInitialsA = document.getElementById("editTenantInitialsA");
  const editTenantDescriptionA = document.getElementById("editTenantDescriptionA");
  const editTenantContactA = document.getElementById("editTenantContactA");

  // Part B Elements
  const editIsVacantB = document.getElementById("editIsVacantB");
  const editAreaSftB = document.getElementById("editAreaSftB");
  const tenantFieldsContainerB = document.getElementById("tenantFieldsContainerB");
  const editTenantNameB = document.getElementById("editTenantNameB");
  const editTenantCategoryB = document.getElementById("editTenantCategoryB");
  const editTenantInitialsB = document.getElementById("editTenantInitialsB");
  const editTenantDescriptionB = document.getElementById("editTenantDescriptionB");
  const editTenantContactB = document.getElementById("editTenantContactB");
  
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");

  // Floor Image URL Manager Elements
  const unifiedImagesContainer = document.getElementById("unifiedImagesContainer");
  const addUnifiedImageBtn = document.getElementById("addUnifiedImageBtn");
  
  const partAImagesContainer = document.getElementById("partAImagesContainer");
  const addPartAImageBtn = document.getElementById("addPartAImageBtn");
  
  const partBImagesContainer = document.getElementById("partBImagesContainer");
  const addPartBImageBtn = document.getElementById("addPartBImageBtn");

  function createFloorImageInputRow(container, val = "") {
    if (!container) return;
    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:0.5rem; align-items:center;";
    row.className = "floor-image-input-row";
    row.innerHTML = `
      <input type="text" class="form-control floor-image-input-field" value="${val}" placeholder="e.g. https://ik.imagekit.io/..." required>
      <button type="button" class="btn btn-outline remove-floor-image-btn" style="padding:0.5rem 0.75rem; border-color:#ef4444; color:#ef4444; background:transparent; line-height:1; font-size:1.25rem;">&times;</button>
    `;
    row.querySelector(".remove-floor-image-btn").addEventListener("click", () => {
      row.remove();
    });
    container.appendChild(row);
  }

  if (addUnifiedImageBtn) addUnifiedImageBtn.addEventListener("click", () => createFloorImageInputRow(unifiedImagesContainer, ""));
  if (addPartAImageBtn) addPartAImageBtn.addEventListener("click", () => createFloorImageInputRow(partAImagesContainer, ""));
  if (addPartBImageBtn) addPartBImageBtn.addEventListener("click", () => createFloorImageInputRow(partBImagesContainer, ""));

  let directoryData = [];
  let adminPassword = sessionStorage.getItem("adminPassword") || "";

  // ==========================================
  // 1. Initial State Check
  // ==========================================
  if (adminPassword) {
    verifyStoredPassword();
  } else {
    showLogin();
  }

  async function verifyStoredPassword() {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword })
      });
      
      if (response.ok) {
        showDashboard();
      } else {
        sessionStorage.removeItem("adminPassword");
        adminPassword = "";
        showLogin();
      }
    } catch (e) {
      console.error("Connection error during login verification:", e);
      showLogin();
    }
  }

  function showLogin() {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
    logoutBtn.style.display = "none";
  }

  function showDashboard() {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    logoutBtn.style.display = "block";
    loadAdminDirectory();
    loadAdminPropertyInfo();
    loadAdminGallery();
  }

  // ==========================================
  // 2. Login & Logout Handlers
  // ==========================================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const enteredPassword = adminPasswordInput.value.trim();
    loginError.style.display = "none";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: enteredPassword })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        adminPassword = enteredPassword;
        sessionStorage.setItem("adminPassword", adminPassword);
        adminPasswordInput.value = "";
        showDashboard();
      } else {
        loginError.style.display = "block";
      }
    } catch (err) {
      console.error("Login request failed:", err);
      loginError.textContent = "Server connection failed. Make sure server is running.";
      loginError.style.display = "block";
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminPassword");
    adminPassword = "";
    showLogin();
  });

  // ==========================================
  // 3. Load Directory & Render Management Rows
  // ==========================================
  async function loadAdminDirectory() {
    try {
      const response = await fetch("/api/directory");
      if (response.ok) {
        directoryData = await response.json();
        renderAdminRows();
      }
    } catch (err) {
      console.error("Failed to load admin directory:", err);
      adminDirectoryList.innerHTML = `<p style="color:#ef4444;text-align:center;padding:1rem;">Failed to fetch data from database.</p>`;
    }
  }

  function renderAdminRows() {
    adminDirectoryList.innerHTML = "";
    
    const isShed2Split = directoryData.find(f => f.id === 'shed2')?.isSplit || false;
    
    directoryData.forEach(floor => {
      // If Shed 2 is split, hide the main unified row
      if (floor.id === 'shed2' && isShed2Split) {
        return;
      }
      // If Shed 2 is NOT split, hide the sub-shed rows A & B
      if ((floor.id === 'shed2a' || floor.id === 'shed2b') && !isShed2Split) {
        return;
      }
      
      const row = document.createElement("div");
      row.className = `admin-row ${floor.isVacant ? "vacant-row" : ""}`;
      
      let occupantDetails = "";
      const sizeTag = floor.areaSft ? ` <span style="color:var(--text-muted); font-size:0.85rem;">[${floor.areaSft}]</span>` : "";
      if (floor.isVacant) {
        occupantDetails = `<strong style="color:#ef4444;">[VACANT] Space Available for Rent</strong>${sizeTag}`;
      } else {
        occupantDetails = `<strong>${floor.tenantName}</strong> (${floor.tenantCategory})${sizeTag}`;
      }

      row.innerHTML = `
        <div>
          <span style="font-size:0.8rem; text-transform:uppercase; color:var(--text-muted); display:block; font-weight:600;">
            ${floor.name} (${floor.icon})
          </span>
          <span style="font-size:1.05rem;">${occupantDetails}</span>
        </div>
        <div class="admin-actions">
          <button class="btn btn-primary edit-btn" data-id="${floor.id}" style="padding:0.4rem 0.85rem; font-size:0.85rem;">Edit Details</button>
        </div>
      `;

      // Attach edit button listener
      row.querySelector(".edit-btn").addEventListener("click", () => openEditModal(floor.id));

      adminDirectoryList.appendChild(row);
    });
  }

  // ==========================================
  // 4. Modal Interactions (Open, Toggle, Close, Save)
  // ==========================================
  
  function handleVacancyToggle(isVacant, nameInput, catInput, initialsInput, descInput, contactInput) {
    const nameGroup = nameInput.closest(".form-group");
    const gridGroup = catInput.closest("div[style*='grid']");
    const descLabel = descInput.previousElementSibling;
    const contactLabel = contactInput.previousElementSibling;

    if (isVacant) {
      if (nameGroup) nameGroup.style.display = "none";
      if (gridGroup) gridGroup.style.display = "none";
      if (descLabel) descLabel.textContent = "Leasing Description / Highlights";
      descInput.placeholder = "e.g. Prime road-facing office space available for rent, modular partition layouts supported.";
      if (contactLabel) contactLabel.textContent = "Leasing Contact Details";
      contactInput.placeholder = "e.g. Call Management: +91 98765 43210";
    } else {
      if (nameGroup) nameGroup.style.display = "block";
      if (gridGroup) gridGroup.style.display = "grid";
      if (descLabel) descLabel.textContent = "Tenant Description";
      descInput.placeholder = "A brief description of what the business does...";
      if (contactLabel) contactLabel.textContent = "Contact Details";
      contactInput.placeholder = "e.g. Suite 101 | Contact: info@email.com";
    }
  }

  // Hide/Show details dynamically if "Vacant" is toggled
  editIsVacant.addEventListener("change", () => {
    handleVacancyToggle(editIsVacant.checked, editTenantName, editTenantCategory, editTenantInitials, editTenantDescription, editTenantContact);
  });

  editIsVacantA.addEventListener("change", () => {
    handleVacancyToggle(editIsVacantA.checked, editTenantNameA, editTenantCategoryA, editTenantInitialsA, editTenantDescriptionA, editTenantContactA);
  });

  editIsVacantB.addEventListener("change", () => {
    handleVacancyToggle(editIsVacantB.checked, editTenantNameB, editTenantCategoryB, editTenantInitialsB, editTenantDescriptionB, editTenantContactB);
  });

  function toggleShedFieldsLayout(isSplitChecked) {
    if (isSplitChecked) {
      unifiedShedFieldsContainer.style.display = "none";
      splitShedFieldsContainer.style.display = "flex";
    } else {
      unifiedShedFieldsContainer.style.display = "block";
      splitShedFieldsContainer.style.display = "none";
    }
  }

  editIsSplit.addEventListener("change", () => {
    toggleShedFieldsLayout(editIsSplit.checked);
  });

  function openEditModal(id) {
    const floor = directoryData.find(f => f.id === id);
    if (!floor) return;

    editFloorId.value = floor.id;
    modalFloorTitle.textContent = `Modify - ${floor.name}`;
    
    const shed2Obj = directoryData.find(f => f.id === 'shed2');
    const shed2aObj = directoryData.find(f => f.id === 'shed2a');
    const shed2bObj = directoryData.find(f => f.id === 'shed2b');

    // 1. Populate unified fields
    editIsVacant.checked = floor.isVacant;
    editAreaSft.value = floor.areaSft || "";
    editTenantName.value = floor.tenantName || "";
    editTenantCategory.value = floor.tenantCategory || "";
    editTenantInitials.value = floor.tenantInitials || "";
    editTenantDescription.value = floor.tenantDescription || "";
    editTenantContact.value = floor.tenantContact || "";

    // 2. Populate Part A fields
    if (shed2aObj) {
      editIsVacantA.checked = shed2aObj.isVacant;
      editAreaSftA.value = shed2aObj.areaSft || "";
      editTenantNameA.value = shed2aObj.tenantName || "";
      editTenantCategoryA.value = shed2aObj.tenantCategory || "";
      editTenantInitialsA.value = shed2aObj.tenantInitials || "";
      editTenantDescriptionA.value = shed2aObj.tenantDescription || "";
      editTenantContactA.value = shed2aObj.tenantContact || "";
      handleVacancyToggle(shed2aObj.isVacant, editTenantNameA, editTenantCategoryA, editTenantInitialsA, editTenantDescriptionA, editTenantContactA);
    }

    // 3. Populate Part B fields
    if (shed2bObj) {
      editIsVacantB.checked = shed2bObj.isVacant;
      editAreaSftB.value = shed2bObj.areaSft || "";
      editTenantNameB.value = shed2bObj.tenantName || "";
      editTenantCategoryB.value = shed2bObj.tenantCategory || "";
      editTenantInitialsB.value = shed2bObj.tenantInitials || "";
      editTenantDescriptionB.value = shed2bObj.tenantDescription || "";
      editTenantContactB.value = shed2bObj.tenantContact || "";
      handleVacancyToggle(shed2bObj.isVacant, editTenantNameB, editTenantCategoryB, editTenantInitialsB, editTenantDescriptionB, editTenantContactB);
    }

    // Split Shed 2 handling inside the modal
    if (id === 'shed2' || id === 'shed2a' || id === 'shed2b') {
      splitShed2FormGroup.style.display = "flex";
      const isSplit = shed2Obj ? shed2Obj.isSplit : false;
      editIsSplit.checked = isSplit;
      toggleShedFieldsLayout(isSplit);
    } else {
      splitShed2FormGroup.style.display = "none";
      toggleShedFieldsLayout(false);
    }

    // Trigger toggle layout for unified
    handleVacancyToggle(floor.isVacant, editTenantName, editTenantCategory, editTenantInitials, editTenantDescription, editTenantContact);

    // Populate Floor Images for Unified
    if (unifiedImagesContainer) {
      unifiedImagesContainer.innerHTML = "";
      if (floor.floorImages) {
        floor.floorImages.split(",").map(url => url.trim()).filter(Boolean).forEach(url => {
          createFloorImageInputRow(unifiedImagesContainer, url);
        });
      }
    }

    // Populate Floor Images for Part A
    if (partAImagesContainer && shed2aObj) {
      partAImagesContainer.innerHTML = "";
      if (shed2aObj.floorImages) {
        shed2aObj.floorImages.split(",").map(url => url.trim()).filter(Boolean).forEach(url => {
          createFloorImageInputRow(partAImagesContainer, url);
        });
      }
    }

    // Populate Floor Images for Part B
    if (partBImagesContainer && shed2bObj) {
      partBImagesContainer.innerHTML = "";
      if (shed2bObj.floorImages) {
        shed2bObj.floorImages.split(",").map(url => url.trim()).filter(Boolean).forEach(url => {
          createFloorImageInputRow(partBImagesContainer, url);
        });
      }
    }

    editModal.classList.add("open");
  }

  function closeModal() {
    editModal.classList.remove("open");
    editOccupantForm.reset();
  }

  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  
  // Close modal when clicking outside
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeModal();
    }
  });

  // Handle Edit form submit
  editOccupantForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editFloorId.value;
    
    // Determine if it is currently split
    const isSplitActive = (id === 'shed2' || id === 'shed2a' || id === 'shed2b') && editIsSplit.checked;

    if (isSplitActive) {
      const isVacantA = editIsVacantA.checked;
      const imagesA = Array.from(partAImagesContainer.querySelectorAll(".floor-image-input-field"))
        .map(input => input.value.trim())
        .filter(Boolean)
        .join(", ");
      const payloadA = {
        isVacant: isVacantA,
        isSplit: true,
        areaSft: editAreaSftA.value.trim(),
        tenantName: isVacantA ? "" : editTenantNameA.value.trim(),
        tenantCategory: isVacantA ? "" : editTenantCategoryA.value.trim(),
        tenantInitials: isVacantA ? "" : editTenantInitialsA.value.trim(),
        tenantDescription: editTenantDescriptionA.value.trim(),
        tenantContact: editTenantContactA.value.trim(),
        floorImages: imagesA
      };

      const isVacantB = editIsVacantB.checked;
      const imagesB = Array.from(partBImagesContainer.querySelectorAll(".floor-image-input-field"))
        .map(input => input.value.trim())
        .filter(Boolean)
        .join(", ");
      const payloadB = {
        isVacant: isVacantB,
        isSplit: true,
        areaSft: editAreaSftB.value.trim(),
        tenantName: isVacantB ? "" : editTenantNameB.value.trim(),
        tenantCategory: isVacantB ? "" : editTenantCategoryB.value.trim(),
        tenantInitials: isVacantB ? "" : editTenantInitialsB.value.trim(),
        tenantDescription: editTenantDescriptionB.value.trim(),
        tenantContact: editTenantContactB.value.trim(),
        floorImages: imagesB
      };

      try {
        const shed2Obj = directoryData.find(f => f.id === 'shed2');
        
        const [resA, resB, resMain] = await Promise.all([
          fetch(`/api/directory/shed2a`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
            body: JSON.stringify(payloadA)
          }),
          fetch(`/api/directory/shed2b`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
            body: JSON.stringify(payloadB)
          }),
          fetch(`/api/directory/shed2`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
            body: JSON.stringify({
              ...shed2Obj,
              isSplit: true
            })
          })
        ]);

        if (!resA.ok || !resB.ok || !resMain.ok) {
          const errA = !resA.ok ? await resA.text() : "OK";
          const errB = !resB.ok ? await resB.text() : "OK";
          const errMain = !resMain.ok ? await resMain.text() : "OK";
          console.error("Save split failed:", errA, errB, errMain);
          alert(`Failed to save split details:\nShed 2A: ${resA.status} (${errA})\nShed 2B: ${resB.status} (${errB})\nMain: ${resMain.status} (${errMain})`);
          return;
        }

        closeModal();
        loadAdminDirectory();
        updateChannel.postMessage("refresh");
      } catch (err) {
        console.error("Error saving split details:", err);
        alert("Failed to save split details: " + err.message);
      }
    } else {
      const isVacant = editIsVacant.checked;
      const imagesUnified = Array.from(unifiedImagesContainer.querySelectorAll(".floor-image-input-field"))
        .map(input => input.value.trim())
        .filter(Boolean)
        .join(", ");
      const updatePayload = {
        isVacant,
        areaSft: editAreaSft.value.trim(),
        tenantName: isVacant ? "" : editTenantName.value.trim(),
        tenantCategory: isVacant ? "" : editTenantCategory.value.trim(),
        tenantInitials: isVacant ? "" : editTenantInitials.value.trim(),
        tenantDescription: editTenantDescription.value.trim(),
        tenantContact: editTenantContact.value.trim(),
        floorImages: imagesUnified
      };

      if (id === 'shed2' || id === 'shed2a' || id === 'shed2b') {
        updatePayload.isSplit = false;
      }

      try {
        const response = await fetch(`/api/directory/${id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-password": adminPassword
          },
          body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
          if (id === 'shed2' || id === 'shed2a' || id === 'shed2b') {
            await Promise.all([
              fetch(`/api/directory/shed2`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
                body: JSON.stringify({ ...updatePayload, isSplit: false })
              }),
              fetch(`/api/directory/shed2a`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
                body: JSON.stringify({ isSplit: false })
              }),
              fetch(`/api/directory/shed2b`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
                body: JSON.stringify({ isSplit: false })
              })
            ]);
          }
          
          closeModal();
          loadAdminDirectory();
          updateChannel.postMessage("refresh");
        } else {
          alert("Failed to save changes.");
        }
      } catch (err) {
        console.error("Error updating details:", err);
        alert("Network error.");
      }
    }
  });

  const phoneInputsContainer = document.getElementById("phoneInputsContainer");
  const addPhoneFieldBtn = document.getElementById("addPhoneFieldBtn");

  function createPhoneInputRow(val = "") {
    if (!phoneInputsContainer) return;
    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:0.5rem; align-items:center;";
    row.className = "phone-input-row";
    row.innerHTML = `
      <input type="text" class="form-control phone-input-field" value="${val}" placeholder="e.g. +91 98765 43210" required>
      <button type="button" class="btn btn-outline remove-phone-btn" style="padding:0.5rem 0.75rem; border-color:#ef4444; color:#ef4444; background:transparent; line-height:1; font-size:1.25rem;">&times;</button>
    `;
    row.querySelector(".remove-phone-btn").addEventListener("click", () => {
      row.remove();
    });
    phoneInputsContainer.appendChild(row);
  }

  if (addPhoneFieldBtn) {
    addPhoneFieldBtn.addEventListener("click", () => createPhoneInputRow(""));
  }

  const amenitiesInputsContainer = document.getElementById("amenitiesInputsContainer");
  const addAmenityFieldBtn = document.getElementById("addAmenityFieldBtn");

  function createAmenityInputRow(val = "") {
    if (!amenitiesInputsContainer) return;
    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;";
    row.className = "amenity-input-row";
    row.innerHTML = `
      <input type="text" class="form-control amenity-input-field" value="${val}" placeholder="e.g. Dedicated 24/7 security guard presence" required>
      <button type="button" class="btn btn-outline remove-amenity-btn" style="padding:0.5rem 0.75rem; border-color:#ef4444; color:#ef4444; background:transparent; line-height:1; font-size:1.25rem;">&times;</button>
    `;
    row.querySelector(".remove-amenity-btn").addEventListener("click", () => {
      row.remove();
    });
    amenitiesInputsContainer.appendChild(row);
  }

  if (addAmenityFieldBtn) {
    addAmenityFieldBtn.addEventListener("click", () => createAmenityInputRow(""));
  }

  // Load property details
  async function loadAdminPropertyInfo() {
    try {
      const response = await fetch("/api/property");
      if (response.ok) {
        const data = await response.json();
        document.getElementById("propTitle").value = data.title;
        document.getElementById("propDesc1").value = data.description1;
        document.getElementById("propDesc2").value = data.description2;
        document.getElementById("propAccessTitle").value = data.accessTitle;
        document.getElementById("propAccessDetails").value = data.accessDetails;
        document.getElementById("propLocationTitle").value = data.locationTitle;
        document.getElementById("propLocationDetails").value = data.locationDetails;
        document.getElementById("propScheduleTitle").value = data.scheduleTitle;
        document.getElementById("propScheduleWeekdays").value = data.scheduleWeekdays;
        document.getElementById("propScheduleSunday").value = data.scheduleSunday;
        document.getElementById("propAmenityTitle").value = data.amenityTitle;
        if (amenitiesInputsContainer) {
          amenitiesInputsContainer.innerHTML = "";
          if (data.amenities) {
            const list = data.amenities.split(";").map(a => a.trim()).filter(Boolean);
            list.forEach(item => createAmenityInputRow(item));
          } else {
            createAmenityInputRow("");
          }
        }
        
        // Populate Contact fields
        document.getElementById("propContactEmail").value = data.contactEmail || "";
        if (phoneInputsContainer) {
          phoneInputsContainer.innerHTML = "";
          if (data.contactPhones) {
            const phones = data.contactPhones.split(",").map(p => p.trim()).filter(Boolean);
            phones.forEach(p => createPhoneInputRow(p));
          } else {
            createPhoneInputRow("");
          }
        }
      }
    } catch (err) {
      console.error("Failed to load property info:", err);
    }
  }

  const propertyInfoForm = document.getElementById("propertyInfoForm");
  if (propertyInfoForm) {
    propertyInfoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const phoneFields = document.querySelectorAll(".phone-input-field");
      const phoneNumbers = Array.from(phoneFields).map(f => f.value.trim()).filter(Boolean).join(", ");

      const amenityFields = document.querySelectorAll(".amenity-input-field");
      const amenitiesStr = Array.from(amenityFields).map(f => f.value.trim()).filter(Boolean).join("; ");

      const payload = {
        title: document.getElementById("propTitle").value.trim(),
        description1: document.getElementById("propDesc1").value.trim(),
        description2: document.getElementById("propDesc2").value.trim(),
        accessTitle: document.getElementById("propAccessTitle").value.trim(),
        accessDetails: document.getElementById("propAccessDetails").value.trim(),
        locationTitle: document.getElementById("propLocationTitle").value.trim(),
        locationDetails: document.getElementById("propLocationDetails").value.trim(),
        scheduleTitle: document.getElementById("propScheduleTitle").value.trim(),
        scheduleWeekdays: document.getElementById("propScheduleWeekdays").value.trim(),
        scheduleSunday: document.getElementById("propScheduleSunday").value.trim(),
        amenityTitle: document.getElementById("propAmenityTitle").value.trim(),
        amenities: amenitiesStr,
        contactEmail: document.getElementById("propContactEmail").value.trim(),
        contactPhones: phoneNumbers
      };

      try {
        const response = await fetch("/api/property", {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-password": adminPassword
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert("Property info saved successfully!");
          loadAdminPropertyInfo();
          updateChannel.postMessage("refresh");
        } else {
          alert("Failed to save property info. Check credentials.");
        }
      } catch (err) {
        console.error("Error saving property info:", err);
        alert("Network error.");
      }
    });
  }

  // Load gallery images
  async function loadAdminGallery() {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        galleryData = await response.json();
        renderAdminGallery();
      }
    } catch (err) {
      console.error("Failed to load admin gallery:", err);
      document.getElementById("adminGalleryList").innerHTML = `<p style="color:#ef4444;text-align:center;">Failed to load gallery images.</p>`;
    }
  }

  function renderAdminGallery() {
    const container = document.getElementById("adminGalleryList");
    container.innerHTML = "";
    
    galleryData.forEach(img => {
      const row = document.createElement("div");
      row.style.cssText = "display:grid; grid-template-columns: 100px 1fr auto; gap:1.5rem; background:#f8fafc; padding:1.25rem; border-radius:8px; border:1px solid #e2e8f0; align-items:center;";
      
      row.innerHTML = `
        <div style="width:100px; height:75px; border-radius:6px; overflow:hidden; border:1px solid #cbd5e1; background:#fff; display:flex; align-items:center; justify-content:center;">
          <img src="${img.url}" alt="${img.title}" style="max-width:100%; max-height:100%; object-fit:cover;">
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1.2fr 1.8fr; gap:1rem; width:100%;">
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem; font-weight:600;">Image Title</label>
            <input type="text" id="galleryTitle-${img.id}" class="form-control" value="${img.title}" required style="padding:0.35rem 0.6rem; font-size:0.9rem;">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem; font-weight:600;">Image URL (ImageKit URL)</label>
            <input type="text" id="galleryUrl-${img.id}" class="form-control" value="${img.url}" required style="padding:0.35rem 0.6rem; font-size:0.9rem;">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem; font-weight:600;">Description</label>
            <textarea id="galleryDesc-${img.id}" class="form-control" required style="padding:0.35rem 0.6rem; font-size:0.9rem; height:38px; min-height:38px; resize:none;" rows="1">${img.description}</textarea>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem; justify-content:center;">
          <button class="btn btn-primary save-gallery-btn" data-id="${img.id}" style="padding:0.4rem 0.85rem; font-size:0.85rem; white-space:nowrap;">Save Photo</button>
          <button class="btn btn-outline delete-gallery-btn" data-id="${img.id}" style="padding:0.4rem 0.85rem; font-size:0.85rem; border-color:#ef4444; color:#ef4444; background:transparent; white-space:nowrap;">Delete</button>
        </div>
      `;
      
      row.querySelector(".save-gallery-btn").addEventListener("click", () => saveGalleryImage(img.id));
      row.querySelector(".delete-gallery-btn").addEventListener("click", () => deleteGalleryImage(img.id));
      container.appendChild(row);
    });
  }

  async function saveGalleryImage(id) {
    const title = document.getElementById(`galleryTitle-${id}`).value.trim();
    const url = document.getElementById(`galleryUrl-${id}`).value.trim();
    const description = document.getElementById(`galleryDesc-${id}`).value.trim();
    
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword
        },
        body: JSON.stringify({ title, url, description })
      });
      
      if (response.ok) {
        alert("Gallery photo updated successfully!");
        loadAdminGallery();
        updateChannel.postMessage("refresh");
      } else {
        alert("Failed to update gallery photo.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    }
  }

  async function deleteGalleryImage(id) {
    if (!confirm("Are you sure you want to delete this gallery photo?")) return;
    
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": adminPassword
        }
      });
      
      if (response.ok) {
        alert("Gallery photo deleted successfully!");
        loadAdminGallery();
        updateChannel.postMessage("refresh");
      } else {
        alert("Failed to delete gallery photo.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    }
  }

  const addGalleryPhotoForm = document.getElementById("addGalleryPhotoForm");
  if (addGalleryPhotoForm) {
    addGalleryPhotoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const payload = {
        title: document.getElementById("newPhotoTitle").value.trim(),
        url: document.getElementById("newPhotoUrl").value.trim(),
        description: document.getElementById("newPhotoDesc").value.trim()
      };

      try {
        const response = await fetch("/api/gallery", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-password": adminPassword
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert("New gallery photo added successfully!");
          addGalleryPhotoForm.reset();
          loadAdminGallery();
          updateChannel.postMessage("refresh");
        } else {
          alert("Failed to add gallery photo.");
        }
      } catch (err) {
        console.error("Error adding gallery photo:", err);
        alert("Network error.");
      }
    });
  }
});
