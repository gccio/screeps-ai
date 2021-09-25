import creepAPI from './api'
import autoCheck from './auto/auto.check'
import autoHarvester from './auto/auto.harvester'
global['creepAPI'] = creepAPI

export default (room: Room, interval: number = 5) => {
  if (Game.time % interval) {
    return
  }

  autoCheck()
  autoHarvester(room)
}