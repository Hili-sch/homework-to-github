//execise 4
document.getElementById("weather-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error-message");
  const tableEl = document.getElementById("city-table");

  errorEl.style.display = "none";

  try {
    const cityValue = document.getElementById("city-input").value;
    if (!cityValue) {
      tableEl.style.display = "none";
      return
    }


    const response = await fetch("http://localhost:3000/weather", {
      method: "post",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: cityValue })
    })

    if (response.status === 404) {
      errorEl.textContent = "No information found for this city";
      errorEl.style.display = "block";
      tableEl.style.display = "none";
      return;
    }

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const result = await response.json()


    document.getElementById("value-city").textContent = result.city
    document.getElementById("value-country").textContent = result.country
    document.getElementById("value-temperature_c").textContent = result.temperature_c
    document.getElementById("value-humidity").textContent = result.humidity
    document.getElementById("value-radiation").textContent = result.radiation

    tableEl.style.display = "block";
    tableEl.style.display = "table";
  } catch (error) {
    console.log(error);
    errorEl.textContent = "An unexpected error occurred.";
    errorEl.style.display = "block";
    tableEl.style.display = "none";
  }
});