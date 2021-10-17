import CreepControl from '@/controller/creep'
import prototypeFn from '@/prototype'
prototypeFn()

global.routeCache = global.routeCache || {}
function loadRoomStructurePos() {
  Object.values(Game.rooms).forEach((room: Room) => {
    room.memory.structures = {}
    room.find(FIND_STRUCTURES).forEach((s: AnyStructure) => {
      const structures = room.memory.structures[s.structureType] || []
      structures.push(s.pos)
      room.memory.structures[s.structureType] = structures
    })
  })
}
loadRoomStructurePos()
export const loop = () => {
  Object.values(Game.rooms).forEach((room: Room) => {
    if (Game.time % 60 === 0) {
      loadRoomStructurePos()
    }
    CreepControl(room)
  })

  Object.values(Game.structures).forEach((s: Structure) => {
    if (s.work) {
      s.work()
    }
  })

  Object.values(Game.creeps).forEach((creep: Creep) => {
    if (creep.work) {
      creep.work()
    }
  })
}
