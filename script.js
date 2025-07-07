// JavaScript for Personal Portfolio Website

// Video Background Functions
function handleVideoLoad() {
  console.log("Video loaded successfully");
  const video = document.getElementById("bg-video");
  video.classList.add("loaded");
}

function handleVideoError() {
  console.log("Video failed to load, using gradient background");
  const video = document.getElementById("bg-video");
  video.style.display = "none";
}

// Initialize video background
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("bg-video");

  // Check if device is mobile or has slow connection
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isSlowConnection =
    navigator.connection &&
    navigator.connection.effectiveType &&
    (navigator.connection.effectiveType === "slow-2g" ||
      navigator.connection.effectiveType === "2g");

  // Disable video on mobile or slow connections
  if (isMobile || isSlowConnection) {
    console.log(
      "Mobile device or slow connection detected, using gradient background"
    );
    handleVideoError();
    return;
  }

  // Check if video can be played
  if (video.canPlayType && video.canPlayType("video/mp4")) {
    video.addEventListener("loadeddata", function () {
      console.log("Video data loaded");
      handleVideoLoad();
    });

    video.addEventListener("error", function () {
      console.log("Video error occurred");
      handleVideoError();
    });

    // Timeout fallback - if video doesn't load in 5 seconds, hide it
    setTimeout(() => {
      if (!video.classList.contains("loaded")) {
        console.log("Video loading timeout, using gradient background");
        handleVideoError();
      }
    }, 5000);
  } else {
    console.log("Video format not supported, using gradient background");
    handleVideoError();
  }
});

// Function to open resume in a new tab
function openResume() {
  window.open("./assets/Resume.pdf", "_blank");
}

// Function to open Gmail compose directly
function contactMe() {
  const email = "pokhrelankit2004@gmail.com";

  try {
    // Open Gmail compose in browser directly
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
    window.open(gmailUrl, "_blank");
    console.log("Gmail compose opened successfully");
  } catch (error) {
    console.error("Error opening Gmail:", error);
    // Fallback: try mailto
    try {
      window.location.href = `mailto:${email}`;
      console.log("Email client opened successfully");
    } catch (mailtoError) {
      console.error("Error opening email client:", mailtoError);
      // Final fallback: copy email to clipboard and alert user
      navigator.clipboard
        .writeText(email)
        .then(() => {
          alert(`Email address copied to clipboard: ${email}`);
        })
        .catch(() => {
          alert(`Please contact me at: ${email}`);
        });
    }
  }
}

// Add smooth scrolling behavior
document.addEventListener("DOMContentLoaded", function () {
  // Add click event listeners to all social icons
  const socialIcons = document.querySelectorAll(".social-icon");

  socialIcons.forEach((icon) => {
    icon.addEventListener("click", function (e) {
      // Add a small animation on click
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });

  // Add click event listeners to buttons
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Add a small animation on click
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });

  // Add parallax effect to profile image
  const profileImg = document.getElementById("profile-pic");
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;

    const translateX = (mouseX - 0.5) * 10;
    const translateY = (mouseY - 0.5) * 10;

    profileImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;
  });

  // Reset profile image position when mouse leaves
  document.addEventListener("mouseleave", function () {
    profileImg.style.transform = "translate(0, 0) scale(1)";
  });
});

// Add typing effect to the name (optional enhancement)
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typing effect when page loads
window.addEventListener("load", function () {
  const nameElement = document.querySelector(".name");
  const roleElement = document.querySelector(".role");
  const originalNameText = nameElement.textContent;
  const originalRoleText = roleElement.textContent;

  // Add a small delay before starting the typing effect
  setTimeout(() => {
    typeWriter(nameElement, originalNameText, 150);
    // Start role typing after name is finished
    setTimeout(() => {
      typeWriter(roleElement, originalRoleText, 100);
    }, originalNameText.length * 150 + 300);
  }, 500);
});

// Add keyboard navigation
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    const focusedElement = document.activeElement;

    if (
      focusedElement.classList.contains("social-icon") ||
      focusedElement.classList.contains("btn")
    ) {
      focusedElement.click();
    }
  }
});

// Add accessibility improvements
document.addEventListener("DOMContentLoaded", function () {
  // Add tabindex to interactive elements
  const interactiveElements = document.querySelectorAll(".social-icon, .btn");

  interactiveElements.forEach((element, index) => {
    element.setAttribute("tabindex", index + 1);
  });

  // Add focus indicators
  interactiveElements.forEach((element) => {
    element.addEventListener("focus", function () {
      this.style.outline = "2px solid rgba(255, 255, 255, 0.5)";
      this.style.outlineOffset = "2px";
    });

    element.addEventListener("blur", function () {
      this.style.outline = "none";
    });
  });
});
