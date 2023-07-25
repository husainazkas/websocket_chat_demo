const { Server } = require('ws')
const wsPort = 8009

let clients = {}

// Start websocket server
const socket = new Server({ port: wsPort })
socket.on('connection', (ws, req) => {
    const userId = req.url.substr(1) // Get user id from URL ip:8008/userId 
    clients[userId] = ws // Store ws to array per user id

    console.log(`User ${userId} connected!`)

    // Listen message event on ws
    ws.on('message', (message) => {
        // Parse & decode payload
        let datastring = message.toString();
        if (datastring.charAt(0) == "{") {
            datastring = datastring.replace(/\'/g, '"');

            // Parse & get command and data
            const { cmd, data } = JSON.parse(datastring)
            switch (cmd) {
                case 'send':
                    const client = clients[data.receiver_id] // Check if there is reciever connection
                    if (client) {
                        // Send message to receiver
                        client.send(JSON.stringify({ cmd: cmd, message: 'success: New message arrived!', data }))
                        // Send back to sender to notify the message has sent successfully
                        ws.send(JSON.stringify({ cmd: cmd, message: 'success: Message sent successfully', data }))
                    } else {
                        // Notify sendey that message has failed to send
                        ws.send(JSON.stringify({ cmd: cmd, message: 'failure: Message failed to send, there is no receiver found', data }))
                    }
                    break;
            }
        }
    })

    // Listen close event on ws
    ws.on('close', () => {
        const userId = req.url.substr(1)
        delete clients[userId] //on connection close, remove reciver from connection list
        console.log(`User ${userId} disconnected`)
    })

    // Notify to ws client that connect was successfully
    ws.send(JSON.stringify({ cmd: 'connection', message: 'success: You are connected!' })) //innitial connection return message
})