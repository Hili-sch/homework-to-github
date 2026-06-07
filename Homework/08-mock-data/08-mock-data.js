//----------------------------<code>--------------
function processQueue(queue, logs) {
  const cleanQueue = [];

  for (const request of queue) {
    if (
      request.status === "corrupted" ||
      request.payload === null
    ) {
      continue;
    }
    cleanQueue.push(request);
  }

  while (cleanQueue.length > 0) {
    const currentRequest = cleanQueue.shift();
    if (currentRequest.type === "CRITICAL_HALT") {
      console.error("fatal error");
      break;
    }

    const isApproved =
      (currentRequest.user.role === "admin" || currentRequest.priority > 2) &&
      currentRequest.user.active &&
      !(
        currentRequest.payload.model === "claude" &&
        currentRequest.payload.tokens < 200
      );

    if (isApproved) {
      for (const key in currentRequest.payload) {
        if (currentRequest.payload[key] === null || currentRequest.payload[key] === undefined) {
          currentRequest.payload[key] = "MISSING_DATA";
        }
      }

  
      switch (currentRequest.type) {
        case "AI_PROMPT":
          console.log("Routing to LLM Engine...");
          break;
        case "DB_QUERY":
          console.log("Executing Secure Query...");
          break;
        case "SEND_EMAIL":
          console.log("Adding to Mail Delivery Queue...");
          break;
        default:
          console.log("Unknown request type, moving to dead-letter queue.");
          break;
      }
    }
  }



  for (let i = logs.length - 1; i >= Math.max(0, logs.length - 3); i--) {
    console.log(logs[i]);
    
  }
}
//------------------------------------</code>---------------------------------

//===========================================================================

//------------------------------------<data>----------------------------------

const requestsQueue = [
  {
    id: 1,
    type: "AI_PROMPT",
    status: "pending",
    priority: 1,
    payload: { model: "claude", tokens: 150, stream: true },
    user: { role: "student", active: true },
  },
  {
    id: 2,
    type: "DB_QUERY",
    status: "pending",
    priority: 3,
    payload: { query: "SELECT *", limit: 10 },
    user: { role: "admin", active: true },
  },
  {
    id: 3,
    type: "SEND_EMAIL",
    status: "corrupted",
    priority: 2,
    payload: null,
    user: { role: "guest", active: false },
  },
  {
    id: 4,
    type: "AI_PROMPT",
    status: "pending",
    priority: 5,
    payload: { model: "gpt-4", tokens: null, temp: undefined },
    user: { role: "admin", active: true },
  },
  {
    id: 5,
    type: "CRITICAL_HALT",
    status: "fatal",
    priority: 0,
    payload: { error: "Memory Overflow" },
    user: { role: "system", active: true },
  },
];

const actionLogs = [
  "init",
  "auth_check",
  "load_modules",
  "connect_db",
  "ready",
];
//----------------------</data>--------------------------

//=======================================================

//-------------------<function>--------------------------

processQueue(requestsQueue, actionLogs)