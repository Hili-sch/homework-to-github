export default (req, res, next) => {
    try {
        const id = Math.floor(Math.random() * 9000) + 1000
        res.locals.requestId = id
        const logData ={
            message: 'Incoming request',
            requestId: id
        };
        console.log(logData);
        next()
    } catch (error) {
        console.log(error);
    }
}

//כדי שירוץ על כל האפליקציה צריך להגדיר שורת קוד  app.use(requestId) בתחילת עמוד ה-server, לפני הגדרת הראוטים עצמם.

//וכדי שיהיה רק על ראוטר מסויים, מגדירים את השורה הנ"ל בתוך העמוד של הראוטר