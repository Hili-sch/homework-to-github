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