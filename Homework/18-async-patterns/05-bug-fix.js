document.getElementById('load-btn').addEventListener('click', (e) => {
  fetch('http://localhost:3000/products', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())  // באג 1
    
    .then(products => {
      const requests = products.map(product =>
        fetch(`http://localhost:3000/products/${product.id}`)
      )
      return Promise.all(requests)
    })
    .then(responses => {
      return Promise.all(responses.map(r => r.json()))
    })
    .then(details => {
      console.log('All product details:', details)
    })
    .catch(err => {
      console.error(err)  // באג 2 — מה אם ל-err אין הודעה?
    })
})
