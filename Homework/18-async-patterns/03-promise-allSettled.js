document.getElementById("btn").addEventListener("click", async (e) => {
  try {
    console.log({
      message: "Trying to get houses from server",
      elemId: "btn",
      event: "click",
    });

    const housesHeaders = await fetch("http://localhost:3000/houses", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const houses = await housesHeaders.json();
    console.log({
      message: "Successfully got houses from server",
      elemId: "btn",
      event: "click",
      data: houses
    });
  
    const requestsArr = [];
    for (const house of houses) {
      requestsArr.push(
        fetch("http://localhost:3000/bulk-politicians", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(house.politicians),
        })
      );
    }

    console.log({
      message: "Trying to get politicians from server",
      elemId: "btn",
      event: "click",
    });

    // 1. שימוש ב-allSettled עבור בקשות הרשת
    const politiciansHeadersSettled = await Promise.allSettled(requestsArr);
    
    // סינון הבקשות שהצליחו והדפסת אזהרות על אלו שנכשלו
    const successfulHeaders = [];
    for (const result of politiciansHeadersSettled) {
      if (result.status === "fulfilled") {
        successfulHeaders.push(result.value); // שומרים רק את התשובות שהצליחו
      } else {
        console.warn({ message: "Fetch request rejected", reason: result.reason });
      }
    }

    const politiciansBodyReq = [];
    // ממשיכים הלאה רק עם הבקשות שהצליחו
    for (const header of successfulHeaders) {
      politiciansBodyReq.push(header.json());
    }

    // 2. שימוש ב-allSettled עבור המרות ה-JSON
    const politiciansResponseSettled = await Promise.allSettled(politiciansBodyReq);

    // סינון ההמרות ל-JSON שהצליחו והדפסת אזהרות על אלו שנכשלו
    const finalPoliticiansData = [];
    for (const result of politiciansResponseSettled) {
      if (result.status === "fulfilled") {
        finalPoliticiansData.push(result.value); // שומרים רק את הנתונים הסופיים התקינים
      } else {
        console.warn({ message: "JSON conversion rejected", reason: result.reason });
      }
    }

    console.log({
      message: "Successfully got politicians from server",
      elemId: "btn",
      event: "click",
      data: finalPoliticiansData
    });
  } catch (error) {
    // בלוק זה יופעל רק אם יש שגיאה בבקשת ה-GET הראשונה או שגיאת קוד קריטית
    console.error({ data: error.message });
  }
});

/*שאלה4
OK: Alice
FAILED: Network timeout
OK: Bob
*/