"use strict";

(() => {
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarButton = document.querySelector("[data-sidebar-btn]");
  const navigationLinks = Array.from(
    document.querySelectorAll("[data-nav-link]"),
  );
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  const goToButtons = Array.from(document.querySelectorAll("[data-go-to]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const filterSelect = document.querySelector("[data-filter-select]");
  const projectCards = Array.from(document.querySelectorAll("[data-project]"));
  const emptyState = document.querySelector("[data-empty-state]");
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const currentYear = document.querySelector("[data-current-year]");

  const validPages = new Set(pages.map((page) => page.dataset.page));

  const setSidebarState = (open) => {
    if (!sidebar || !sidebarButton) return;

    sidebar.classList.toggle("open", open);
    sidebarButton.setAttribute("aria-expanded", String(open));
  };

  sidebarButton?.addEventListener("click", () => {
    setSidebarState(!sidebar.classList.contains("open"));
  });

  const activatePage = (pageName, options = {}) => {
    const { updateHash = true, focusTab = false, scroll = true } = options;
    const safePageName = validPages.has(pageName) ? pageName : "about";

    pages.forEach((page) => {
      const isActive = page.dataset.page === safePageName;
      page.classList.toggle("active", isActive);
      page.hidden = !isActive;
    });

    navigationLinks.forEach((link) => {
      const isActive = link.dataset.navLink === safePageName;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-selected", String(isActive));
      link.tabIndex = isActive ? 0 : -1;

      if (isActive && focusTab) {
        link.focus({ preventScroll: true });
      }
    });

    if (updateHash) {
      const nextHash = `#${safePageName}`;
      if (window.location.hash !== nextHash) {
        history.pushState(null, "", nextHash);
      }
    }

    document.title = `${safePageName.charAt(0).toUpperCase()}${safePageName.slice(1)} | Ian Sosi Nyabwari`;

    if (scroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  navigationLinks.forEach((link, index) => {
    link.addEventListener("click", () => activatePage(link.dataset.navLink));

    link.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight")
        nextIndex = (index + 1) % navigationLinks.length;
      if (event.key === "ArrowLeft")
        nextIndex =
          (index - 1 + navigationLinks.length) % navigationLinks.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = navigationLinks.length - 1;

      activatePage(navigationLinks[nextIndex].dataset.navLink, {
        focusTab: true,
      });
    });
  });

  goToButtons.forEach((button) => {
    button.addEventListener("click", () => activatePage(button.dataset.goTo));
  });

  window.addEventListener("hashchange", () => {
    const requestedPage = window.location.hash
      .replace("#", "")
      .trim()
      .toLowerCase();
    activatePage(requestedPage, { updateHash: false, scroll: false });
  });

  const applyProjectFilter = (filter) => {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const categories = (card.dataset.categories || "")
        .split(/\s+/)
        .filter(Boolean);
      const visible = filter === "all" || categories.includes(filter);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (filterSelect && filterSelect.value !== filter) {
      filterSelect.value = filter;
    }

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () =>
      applyProjectFilter(button.dataset.filter),
    );
  });

  filterSelect?.addEventListener("change", () =>
    applyProjectFilter(filterSelect.value),
  );

  const setFieldValidity = (field) => {
    const valid = field.checkValidity();
    field.classList.toggle("invalid", !valid);
    return valid;
  };

  contactForm?.addEventListener("input", (event) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      if (event.target.classList.contains("invalid")) {
        setFieldValidity(event.target);
      }
    }
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
    const valid = fields.every(setFieldValidity);

    if (!valid) {
      if (formStatus) {
        formStatus.textContent =
          "Please complete all required fields with valid information.";
        formStatus.className = "form-status error";
      }
      fields.find((field) => !field.checkValidity())?.focus();
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("fullname") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const body = [
      `Hello Ian,`,
      "",
      message,
      "",
      `From: ${name}`,
      `Email: ${email}`,
    ].join("\n");

    const mailto = `mailto:biodehood@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formStatus) {
      formStatus.textContent =
        "Your email application should open with a prepared draft.";
      formStatus.className = "form-status success";
    }

    window.location.href = mailto;
  });

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  const initialPage = window.location.hash
    .replace("#", "")
    .trim()
    .toLowerCase();
  activatePage(initialPage, { updateHash: false, scroll: false });
  applyProjectFilter("all");

  const desktopQuery = window.matchMedia("(min-width: 1080px)");
  const syncSidebarForViewport = () => setSidebarState(desktopQuery.matches);
  syncSidebarForViewport();
  desktopQuery.addEventListener?.("change", syncSidebarForViewport);
})();
