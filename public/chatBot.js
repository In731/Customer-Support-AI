(async function () {
    const api_Url = "https://customer-support-ai-blush-two.vercel.app/api/chat"
    
    const scriptTag = document.currentScript;
    const ownerId = scriptTag.getAttribute("data-owner-id")

    if (!ownerId) {
        console.log("owner id not found")
        return
    }

    const public_api_url = "https://customer-support-ai-blush-two.vercel.app/api/settings/public?ownerId=" + ownerId;
    let config = {
        primaryColor: "#0f172a", // slate-900 default
        widgetIcon: "💬",
        welcomeMessage: "Hi! How can I help you today?",
        businessName: "Customer Support"
    };

    try {
        const res = await fetch(public_api_url);
        if (res.ok) {
            config = await res.json();
        }
    } catch (e) {
        console.error("Failed to load widget config", e);
    }

    // Modern Icons
    const sendIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${config.primaryColor}" style="display: block; margin-left: 4px;"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>`;
    const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

    const fontStyle = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

    // Create Floating Button
    const button = document.createElement("div")
    button.textContent = config.widgetIcon;
    Object.assign(button.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "60px",
        height: "60px",
        borderRadius: "9999px",
        background: config.primaryColor,
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "28px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        zIndex: "999999",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        fontFamily: fontStyle
    })
    
    button.onmouseover = () => button.style.transform = "scale(1.05)";
    button.onmouseout = () => button.style.transform = "scale(1)";
    document.body.appendChild(button)

    // Create Chat Box
    const box = document.createElement("div")
    Object.assign(box.style, {
        position: "fixed",
        bottom: "100px",
        right: "24px",
        width: "360px",
        height: "500px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e4e4e7",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        display: "none",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: "999999",
        fontFamily: fontStyle,
        opacity: "0",
        transform: "translateY(10px)",
        transition: "opacity 0.2s ease, transform 0.2s ease"
    })

    box.innerHTML = `
    <!-- Header -->
    <div style="
      background:#ffffff;
      color:#09090b;
      padding:16px 20px;
      font-size:16px;
      font-weight:600;
      display:flex;
      justify-content:space-between;
      align-items:center;
      border-bottom:1px solid #e4e4e7;
    ">
        <div style="display:flex; flex-direction:column; gap:2px;">
            <span>${config.businessName}</span>
            <span style="font-size:12px; font-weight:400; color:#71717a;">Online</span>
        </div>
        <button id="chat-close" style="
            background:transparent;
            border:none;
            color:#71717a;
            cursor:pointer;
            padding:4px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:6px;
            transition:background 0.2s;
        " onmouseover="this.style.background='#f4f4f5'" onmouseout="this.style.background='transparent'">
            ${closeIcon}
        </button>
    </div>

    <!-- Messages Area -->
    <div id="chat-messages" style="
      flex:1;
      padding:20px;
      overflow-y:auto;
      background:#ffffff;
      display:flex;
      flex-direction:column;
      gap:16px;
    "></div>

    <!-- Input Area -->
    <div style="
      display:flex;
      padding:16px;
      gap:12px;
      border-top:1px solid #e4e4e7;
      background:#ffffff;
      align-items:center;
    ">
    <input id="chat-input" type="text" 
    style="
          flex:1;
          padding:12px 16px;
          border:1px solid #e4e4e7;
          border-radius:24px;
          font-size:15px;
          outline:none;
          transition:border-color 0.2s;
          background:#f0f2f5;
          color:#09090b;
        "
         placeholder="Type a message"/>
    <button id="chat-send" style="
          display:flex;
          align-items:center;
          justify-content:center;
          width:44px;
          height:44px;
          border:none;
          background:transparent;
          border-radius:50%;
          cursor:pointer;
          padding:0;
          transition:background 0.2s;
        " onmouseover="this.style.background='#f4f4f5'" onmouseout="this.style.background='transparent'">
          ${sendIcon}
        </button>
    </div>
    `

    document.body.appendChild(box)

    const input = document.querySelector("#chat-input")
    input.onfocus = () => input.style.border = "1px solid #a1a1aa";
    input.onblur = () => input.style.border = "1px solid #e4e4e7";

    button.onclick = () => {
        if (box.style.display === "none") {
            box.style.display = "flex"
            // Trigger reflow for animation
            setTimeout(() => {
                box.style.opacity = "1"
                box.style.transform = "translateY(0)"
            }, 10)
        } else {
            box.style.opacity = "0"
            box.style.transform = "translateY(10px)"
            setTimeout(() => {
                box.style.display = "none"
            }, 200) // Match transition duration
        }
    }

    document.querySelector("#chat-close").onclick = () => {
        box.style.opacity = "0"
        box.style.transform = "translateY(10px)"
        setTimeout(() => {
            box.style.display = "none"
        }, 200)
    }

    const sendBtn = document.querySelector("#chat-send")
    const messageArea = document.querySelector("#chat-messages")

    function addMessage(text, from) {
        const bubbleContainer = document.createElement("div")
        Object.assign(bubbleContainer.style, {
            display: "flex",
            width: "100%",
            justifyContent: from === "user" ? "flex-end" : "flex-start",
        })

        const bubble = document.createElement("div")
        bubble.textContent = text; // XSS PATCH: Using textContent instead of innerHTML
        Object.assign(bubble.style, {
            maxWidth: "85%",
            padding: "10px 16px",
            fontSize: "14px",
            lineHeight: "1.5",
            wordBreak: "break-word",
            
            // Shadcn specific aesthetic
            borderRadius: "16px",
            background: from === "user" ? config.primaryColor : "#f4f4f5",
            color: from === "user" ? "#ffffff" : "#09090b",
            borderBottomRightRadius: from === "user" ? "4px" : "16px",
            borderBottomLeftRadius: from === "user" ? "16px" : "4px",
        })

        bubbleContainer.appendChild(bubble)
        messageArea.appendChild(bubbleContainer)
        messageArea.scrollTop = messageArea.scrollHeight
    }

    // Allow Enter key to send
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendBtn.click();
        }
    })

    // Insert welcome message
    if (config.welcomeMessage) {
        addMessage(config.welcomeMessage, "ai");
    }

    sendBtn.onclick = async () => {
        const text = input.value.trim()
        if (!text) {
            return
        }
        addMessage(text, "user")
        input.value = ""

        const typingContainer = document.createElement("div")
        Object.assign(typingContainer.style, {
            display: "flex",
            width: "100%",
            justifyContent: "flex-start",
        })

        const typing = document.createElement("div")
        typing.innerHTML = `<span style="display:flex;gap:4px;align-items:center;height:20px;">
            <span style="width:6px;height:6px;background:#a1a1aa;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;"></span>
            <span style="width:6px;height:6px;background:#a1a1aa;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;animation-delay:0.16s;"></span>
            <span style="width:6px;height:6px;background:#a1a1aa;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;animation-delay:0.32s;"></span>
        </span>`
        Object.assign(typing.style, {
            padding: "10px 16px",
            background: "#f4f4f5",
            borderRadius: "16px",
            borderBottomLeftRadius: "4px"
        })
        
        // Add tiny CSS animation for typing dots dynamically
        if(!document.getElementById('chatbot-typing-css')) {
            const style = document.createElement('style');
            style.id = 'chatbot-typing-css';
            style.innerHTML = `@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`;
            document.head.appendChild(style);
        }

        typingContainer.appendChild(typing)
        messageArea.appendChild(typingContainer)
        messageArea.scrollTop = messageArea.scrollHeight

        try {
            const response = await fetch(api_Url, {
                method: "POST",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify({
                    ownerId, message: text
                })
            })

            const data = await response.json()
            messageArea.removeChild(typingContainer)

            if (response.ok) {
                addMessage(data || "something went wrong", "ai")
            } else {
                addMessage(data.message || "something went wrong", "ai")
            }

        } catch (error) {
            console.log(error)
            messageArea.removeChild(typingContainer)
            addMessage("Network error or server unavailable", "ai")
        }
    }
})()
