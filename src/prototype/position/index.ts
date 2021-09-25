import { assignPrototype } from "@/utils"
import PositionExtension from "./extension"

export default () => {
  assignPrototype(PositionExtension, RoomPosition)
}
