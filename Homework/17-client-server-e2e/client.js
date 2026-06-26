//execise 4
document.getElementById("weather-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const cityValue = document.getElementById("city-input").value;

    const response = await fetch("http://localhost:3000/weather", {
      method: "post",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: cityValue })
    })

    console.log(response);
    
    const result = await response.json()
    document.getElementById("weather-result").textContent = JSON.stringify(result)

  } catch (error) {
    console.error(error);
  }
});

//execise 5
document.getElementById('order-btn').addEventListener('click', async (e) => {
  e.preventDefault()
  const selectedIds = [3, 7, 12]

  const res = await fetch('http://localhost:3000/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: selectedIds })
  })

  const data = await res.json()
  document.getElementById('confirmation').textContent = JSON.stringify(data)
})
