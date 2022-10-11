import { WebSocketServer } from "ws"
import crypto from "crypto"
import fs from "fs"

const server = new WebSocketServer({ port: 8080 })
const clients = new Map()

server.on("connection", (socket) => {
    socket.on("message", async message => {
        let msg = JSON.parse(message)
        const users = await JSON.parse(fs.readFileSync("Data/users.json"))
        const licenses = await JSON.parse(fs.readFileSync("Data/licenses.json"))

        switch (msg.method) {
            case "login":
                const details = msg.params

                const user = Object.entries(users).find(([uuid, user]) => user.username == details.username && user.password == details.password)?.[0]        
                if (!user) return socket.send(JSON.stringify({ method: "login", params: { success: false } }))

                clients.set(socket, user)
                socket.send(JSON.stringify({ method: "login", params: { success: true } }))
                break
            case "register":
                if (!Object.values(users).some(user => user.username === msg.params.username) && licenses[msg.params.license]?.used == false) {
                    // Save new user
                    const uuid = crypto.randomUUID()
                    users[uuid] = msg.params
                    fs.writeFileSync("Data/users.json", JSON.stringify(users))

                    // Save license
                    licenses[msg.params.license].used = true
                    fs.writeFileSync("Data/licenses.json", JSON.stringify(licenses))

                    socket.send(JSON.stringify({ method: "register", params: { success: true } }))
                } else socket.send(JSON.stringify({ method: "register", params: { success: false } }))

                break
            case "license":
                // Create new license
                if (users[clients.get(socket)]?.username === "admin") {
                    const license = crypto.randomBytes(32).toString("hex")

                    licenses[license] = { used: false }
                    fs.writeFileSync("Data/licenses.json", JSON.stringify(licenses))

                    socket.send(JSON.stringify({ method: "license", params: { license } }))
                }
                else socket.send(JSON.stringify({ method: "license", params: { success: false } }))
                
                break
            default:
                socket.send(JSON.stringify({ method: "error", params: { error: "Invalid method" } }))         
                break    
        }
    })
})