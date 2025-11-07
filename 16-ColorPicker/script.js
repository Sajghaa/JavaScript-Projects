function generateGradient() {
      const color1 = document.getElementById("color1").value;
      const color2 = document.getElementById("color2").value;
      const direction = document.getElementById("direction").value;
      const gradient = `linear-gradient(${direction}, ${color1}, ${color2})`;
      
      document.body.style.background = gradient;
      document.getElementById("output").textContent = `background: ${gradient};`;
    }

    window.onload = generateGradient;