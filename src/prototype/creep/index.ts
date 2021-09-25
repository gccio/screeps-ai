import { assignPrototype } from "@/utils"
import CreepExtension from "./extension"

export default () => {
    assignPrototype(CreepExtension, Creep)
}