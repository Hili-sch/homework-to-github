document.getElementById('btn').addEventListener('click', (e) => {
    
    // 1. בקשת GET להבאת כל הבתים
    fetch('http://localhost:3000/houses')
        // המרת התשובה הראשונית ל-JSON
        .then(response => response.json())
        
        .then(houses => {
            console.log('Successfully retrieved houses:', houses);

            // 2. יצירת מערך של בקשות POST (מערך של Promises) - בקשה אחת עבור כל בית
            const fetchPromises = houses.map(house => {
                return fetch('http://localhost:3000/bulk-politicians', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(house.politicians)
                });
            });

            // 3. החזרת Promise.all שמחכה שכל בקשות ה-POST יחזרו מהשרת
            return Promise.all(fetchPromises);
        })
        
        .then(responses => {
            // בשלב זה כל הבקשות חזרו. 'responses' הוא מערך של אובייקטי Response.
            // 4. יצירת מערך חדש של Promises שקוראים ל-.json() על כל תשובה
            const jsonPromises = responses.map(response => response.json());

            // 5. החזרת Promise.all שני שמחכה שכל ההמרות ל-JSON יסתיימו
            return Promise.all(jsonPromises);
        })
        
        .then(allPoliticiansData => {
            // 6. השלב הסופי: כל הנתונים הומרו בהצלחה ואפשר להדפיס אותם
            console.log('Final politicians data:', allPoliticiansData);
        })
        
        // 7. תפיסת שגיאות: הבלוק הזה יתפוס כל שגיאה שתתרחש בכל אחד מהשלבים בשרשרת
        .catch(error => {
            console.error('An error occurred during the requests:', error);
        });
        
});