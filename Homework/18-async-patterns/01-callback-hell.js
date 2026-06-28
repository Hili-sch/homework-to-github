// פונקציית עזר לבקשות רשת באמצעות Callbacks טהורים (ללא fetch, ללא Promises, ללא .then)
function fetchJSON(url, method, body, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // קולבק שמופעל כשהבקשה מסתיימת בהצלחה ומתקבלת תשובה מהשרת
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            callback(data); // הפעלת הקולבק שהועבר כפרמטר יחד עם הנתונים
        } else {
            console.error('Server error:', xhr.statusText);
        }
    };

    // קולבק שמופעל במקרה של שגיאת רשת
    xhr.onerror = function() {
        console.error('Network error occurred');
    };

    // שליחת הבקשה אל השרת (עם נתונים אם קיימים, או בלעדיהם)
    if (body) {
        xhr.send(JSON.stringify(body));
    } else {
        xhr.send();
    }
}

// ---------------------------------------------------------
// הלוגיקה המרכזית: מימוש "גיהנום הקולבקים" (Callback Hell)
// ---------------------------------------------------------

// חיבור מאזין לחיצה לכפתור לפי ה-ID שלו
document.getElementById('btn').addEventListener('click', function() {
    
    // 1. קריאה ל-fetchJSON כדי לבצע בקשת GET עבור רשימת הבתים
    fetchJSON('http://localhost:3000/houses', 'GET', null, function(houses) {
        console.log('Successfully retrieved houses:', houses);

        // 2. ריצה בלולאה על כל בית שהתקבל מהשרת
        houses.forEach(function(house) {
            
            // 3. קריאה נוספת ל-fetchJSON כדי לבצע בקשת POST עבור הפוליטיקאים של אותו בית
            // זהו קולבק מקונן (קולבק שנמצא בתוך קולבק אחר)
            fetchJSON('http://localhost:3000/bulk-politicians', 'POST', house.politicians, function(politicians) {
                
                // 4. הדפסת נתוני הפוליטיקאים בתוך הקולבק הפנימי ביותר
                console.log('Politicians for ' + (house.name || 'house') + ':', politicians);
                
            });
        });
    });
});