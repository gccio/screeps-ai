import { assignPrototype } from "@/utils"
import SpawnExtension from "./spawn"
import TowerExtension from "./tower"

export default () => {
  assignPrototype(SpawnExtension, StructureSpawn)
  assignPrototype(TowerExtension, StructureTower)
}
