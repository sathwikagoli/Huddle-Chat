const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");
const cors = require("cors");

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(cors({
    origin: "*", // Change this to a specific origin in production
    methods: ["GET", "POST"]
}));
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId; // Expecting userId from the client-side connection
    if (userId) {
        socket.join(userId);
        console.log(`User ${userId} connected`);
    } else {
        console.log("User connected without userId");
    }

    // Listen for disconnection
    socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
    });
});

connectDB();
app.use(express.json());

// Your existing routes
app.use("/api/auth", require("./routes/authRoutes")); 
app.use("/api/chat", require("./routes/chatRoutes")(io)); 
app.use('/api/groupChat', require('./routes/groupChatRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
