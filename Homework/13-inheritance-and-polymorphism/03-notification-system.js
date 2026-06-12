class Notification {
   
    constructor(sender, message) {
     this.sender = sender
     this.message = message
     this.sent = false        
    }

    send() {
        console.log("send() not implemented");        
    }

    log(){
        this.send()
        this.sent = true
        console.log(`notification from ${this.sender} sent: ${this.sent}`);        
    }
}

class EmailNotification extends Notification {

    constructor(sender, message, toEmail) {
        super(sender, message);
        this.toEmail = toEmail
    }

    send(){
        console.log(`Email to ${this.toEmail}: ${this.message}`);        
    }
}

class SMSNotification extends Notification {
  
    constructor(sender, message, phone) {
        super(sender, message);
        this.phone = phone
    }

    send() {
        console.log(`SMS to ${this.phone}: ${this.message}`);
    }
}

class PushNotification extends Notification {

    constructor(sender, message, deviceId) {
        super(sender, message);
        this.deviceId = deviceId
    }

    send(){
        console.log(`Push to device ${this.deviceId}: ${this.message}`);
    }
}

const email = new EmailNotification("Hili", "Hello Simi, I would like to schedule a meeting with you tomorrow morning.", "shmi@ai.net")
const sms = new SMSNotification("Beni", "Yossi, I would like to coordinate details with you regarding the contract, please call me as soon as possible.", "0521234567")
const push = new PushNotification("Pini", "I sent you homework.", "github.com/pini")

const arr = [email, sms, push]

for (const item of arr ){
    item.log()
}

const newArr = arr.filter(noti => noti.send)

console.log(`You have ${newArr.length} new notifications.`);

/*
שאלות בונוס
שאלה 1
אם הבנתי נכון, השאלה היא למה ליצור אב טיפוס אחד וממנו ירושות, ולא כל יורש מחדש
התשובה כדי לחסוך במשאבים, שלא נגדיר מחדש מתודות עבור הילדים

שאלה 2
כדי שמנוע JS לא ילך לבנאי של ההורה

שאלה 3
הגירסא של הצ'ייאלד, כי התונה מעדיפה את המתודה המוגדרת ישירות עליו

שאלה 4
ירושה, זה קבלת המאפיינים של ההורה
פולימורפיזם, זה דריסת מאפייני ההורה
*/