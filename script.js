document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  const header = document.querySelector("header");
  const navLinks = document.querySelector(".nav-links");

  // Garante botão mobile em todas as páginas, inclusive itens.
  let menuToggle = document.querySelector(".menu-toggle");
  if (!menuToggle && navLinks) {
    menuToggle = document.createElement("button");
    menuToggle.className = "menu-toggle";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    const logo = document.querySelector(".logo");
    if (logo && logo.parentElement) {
      logo.insertAdjacentElement("afterend", menuToggle);
    }
  }

  const menuIcon = menuToggle ? menuToggle.querySelector("i") : null;

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const isOpen = navLinks.classList.contains("active");
      if (menuIcon) {
        menuIcon.classList.toggle("fa-bars", !isOpen);
        menuIcon.classList.toggle("fa-xmark", isOpen);
      }
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        if (menuIcon) {
          menuIcon.classList.add("fa-bars");
          menuIcon.classList.remove("fa-xmark");
        }
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("active");
        if (menuIcon) {
          menuIcon.classList.add("fa-bars");
          menuIcon.classList.remove("fa-xmark");
        }
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset - 20);
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // Evita imagem quebrada quando preview local ainda não existe.
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      const isItemPage = window.location.pathname.includes("/itens_cardapio/") || window.location.pathname.includes("\\itens_cardapio\\");
      const fallback = isItemPage ? "../img/bolo_mescladoLCChoc.jpg" : "img/bolo_mescladoLCChoc.jpg";
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.src = fallback;
      }
    });
  });
});

