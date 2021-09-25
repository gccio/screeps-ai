import { assignPrototype } from "@/utils"
import RoomExtension from "./extension"

export default () => {
    assignPrototype(RoomExtension, Room)
}