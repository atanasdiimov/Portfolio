document.documentElement.classList.add("app-ready");

function forEachElements(elements, callback) {
  Array.prototype.forEach.call(elements, callback);
}

function removeElement(element) {
  if (!element || !element.parentNode) {
    return;
  }

  element.parentNode.removeChild(element);
}

const siteLoader = document.querySelector("[data-site-loader]");

if (siteLoader) {
  const mediaQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  const prefersReducedMotion = !!(mediaQuery && mediaQuery.matches);
  const removeDelayMs = prefersReducedMotion ? 0 : 200;
  let loaderHidden = false;

  function hideSiteLoader() {
    if (loaderHidden) {
      return;
    }

    loaderHidden = true;

    if (document.body) {
      document.body.classList.remove("is-loading");
    }

    siteLoader.classList.add("is-hidden");
    siteLoader.setAttribute("aria-hidden", "true");

    window.setTimeout(function () {
      removeElement(siteLoader);
    }, removeDelayMs);
  }

  // The document can be used while images are still downloading.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideSiteLoader, { once: true });
  } else {
    hideSiteLoader();
  }
}

const currentPage = document.body ? document.body.dataset.page : "";
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

if (nav && currentPage) {
  forEachElements(nav.querySelectorAll("a"), function (link) {
    if (link.dataset.page === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

if (nav && navToggle) {
  navToggle.addEventListener("click", function () {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));

    if (expanded) {
      nav.classList.remove("is-open");
    } else {
      nav.classList.add("is-open");
    }
  });

  forEachElements(nav.querySelectorAll("a"), function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        forEachElements(entries, function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    forEachElements(revealElements, function (element) {
      observer.observe(element);
    });
  } else {
    forEachElements(revealElements, function (element) {
      element.classList.add("is-visible");
    });
  }
}

forEachElements(document.querySelectorAll("[data-portrait]"), function (image) {
  const shell = image.closest("[data-portrait-shell]");

  if (!shell) {
    return;
  }

  function showFallback() {
    shell.classList.add("is-fallback");
  }

  function showImage() {
    shell.classList.remove("is-fallback");
  }

  image.addEventListener("load", function () {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showFallback();
    }
  });

  image.addEventListener("error", showFallback);

  if (image.complete && image.naturalWidth > 0) {
    showImage();
  } else {
    showFallback();
  }
});

const tiltPhotoElements = document.querySelectorAll(
  ".portrait-shell, .about-campus-card, .activity-photo-frame, .gallery-photo-box"
);

if (tiltPhotoElements.length) {
  const reducedMotionQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  const canUseTilt = !(reducedMotionQuery && reducedMotionQuery.matches);

  forEachElements(tiltPhotoElements, function (element) {
    element.classList.add("tilt-photo");

    if (!canUseTilt) {
      return;
    }

    element.addEventListener("pointermove", function (event) {
      const rect = element.getBoundingClientRect();
      const pointerX = (event.clientX - rect.left) / rect.width;
      const pointerY = (event.clientY - rect.top) / rect.height;
      const rotateY = (pointerX - 0.5) * 12;
      const rotateX = (0.5 - pointerY) * 10;

      element.style.setProperty("--tilt-x", rotateX.toFixed(2) + "deg");
      element.style.setProperty("--tilt-y", rotateY.toFixed(2) + "deg");
      element.style.setProperty("--tilt-scale", "1.025");
    });

    element.addEventListener("pointerleave", function () {
      element.style.removeProperty("--tilt-x");
      element.style.removeProperty("--tilt-y");
      element.style.removeProperty("--tilt-scale");
    });
  });
}

function getElapsedCalendarTime(startDate, now) {
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();

  if (now.getDate() < startDate.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return { years: 0, months: 0 };
  }

  return { years: years, months: months };
}

function formatExperience(startDate, now) {
  const elapsed = getElapsedCalendarTime(startDate, now);
  return elapsed.years + " г. " + elapsed.months + " мес.";
}

forEachElements(document.querySelectorAll("[data-experience-start]"), function (element) {
  const startValue = element.getAttribute("data-experience-start");
  const startDate = new Date(startValue + "T00:00:00");
  const now = new Date();

  if (Number.isNaN(startDate.getTime())) {
    return;
  }

  if (now < startDate) {
    element.textContent = "0 г. 0 мес.";
    return;
  }

  element.textContent = formatExperience(startDate, now);
});

forEachElements(document.querySelectorAll("[data-birth-date]"), function (element) {
  const birthDate = new Date(element.getAttribute("data-birth-date") + "T00:00:00");

  if (Number.isNaN(birthDate.getTime())) {
    return;
  }

  element.textContent = getElapsedCalendarTime(birthDate, new Date()).years + " г.";
});

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const helper = document.querySelector("[data-contact-helper]");
  const note = document.querySelector("[data-contact-note]");
  const submitButton = contactForm.querySelector("[type=\"submit\"]");
  const isLocalFile = window.location.protocol === "file:";

  function setContactMessage(message, state) {
    if (!helper) {
      return;
    }

    helper.textContent = message;
    helper.classList.remove("is-success", "is-error");

    if (state) {
      helper.classList.add("is-" + state);
    }
  }

  function setContactBusy(isBusy) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Изпращане..." : "Изпрати съобщение";
  }

  function getFieldValue(name, fallbackValue) {
    const field = contactForm.querySelector('[name="' + name + '"]');

    if (!field || typeof field.value !== "string") {
      return fallbackValue;
    }

    const value = field.value.trim();
    return value || fallbackValue;
  }

  if (isLocalFile) {
    if (note) {
      note.textContent = "";
    }

    if (helper) {
      helper.textContent = "";
    }
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = contactForm.getAttribute("data-contact-email") || "";

    if (!contactForm.reportValidity()) {
      return;
    }

    if (!email) {
      setContactMessage("Липсва имейл адрес за получаване на съобщението.", "error");
      return;
    }

    if (!isLocalFile && window.fetch && window.FormData) {
      const submitUrl = "https://formsubmit.co/ajax/" + encodeURIComponent(email);
      const formData = new FormData(contactForm);

      formData.delete("_next");
      setContactBusy(true);
      setContactMessage("Съобщението се изпраща...", "");

      fetch(submitUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || (data && data.success === false)) {
              throw new Error((data && data.message) || "FormSubmit не прие съобщението.");
            }

            return data;
          });
        })
        .then(function () {
          contactForm.reset();
          setContactMessage("Съобщението е изпратено успешно.", "success");
        })
        .catch(function () {
          setContactMessage("Съобщението не беше изпратено. Моля, опитайте отново или използвайте имейла отляво.", "error");
        })
        .finally(function () {
          setContactBusy(false);
        });

      return;
    }

    const name = getFieldValue("name", "");
    const sender = getFieldValue("email", "");
    const subject = getFieldValue("subject", "Съобщение от портфолиото");
    const message = getFieldValue("message", "");
    const bodyLines = [
      "Име: " + name,
      "Имейл: " + sender,
      "",
      "Съобщение:",
      message,
    ];

    const mailtoUrl = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyLines.join("\n"));
    window.location.href = mailtoUrl;
  });
}

forEachElements(document.querySelectorAll("[data-gallery-toggle]"), function (button) {
  button.addEventListener("click", function () {
    const controlsId = button.getAttribute("aria-controls");
    const panel = controlsId ? document.getElementById(controlsId) : null;

    if (!panel) {
      return;
    }

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    panel.hidden = isExpanded;
  });
});
