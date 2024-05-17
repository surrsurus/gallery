import { Socket } from "phoenix"

const socket = new Socket("/socket", {})

socket.connect()

const channel = socket.channel("gallery:main", {})

export { channel }
