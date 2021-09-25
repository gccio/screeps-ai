import CreepControl from '@/controller/creep'
import prototypeFn from '@/prototype'
prototypeFn()

global.routeCache = global.routeCache || {}

export const loop = () => {
  Object.values(Game.rooms).forEach((room: Room) => {
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
