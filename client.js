import WebSocket from "ws"

import { sha256 } from "./Utils/Utils.js"

// Details
const username = "fork"
const password = "admin123"

const socket = new WebSocket("ws://localhost:8080")

socket.on("open", () => {
    //send("register", { username, password: sha256(password), license: "" })
    send("login", { username, password: sha256(password) })

    // Create new license
    //send("license")
})

socket.on("message", message => {
    const msg = JSON.parse(message)

    switch (msg.method) {
        case "login":
        case "register:":
            console.log(msg.params.success ? `Successfully ${msg.method == "login" ? "logged in" : "registered"}!` : "Failed socket login!" + (socket.close() ?? ""))
            break
        case "error":
            console.log("An error occured: " + msg.params.error)
            break    
    }

    // For debugging
    console.log(`${msg.method} > ${JSON.stringify(msg.params)}`)
})

socket.on("error", (error) => console.error(error))

const send = (method, params) => socket.send(JSON.stringify({ method, params }))