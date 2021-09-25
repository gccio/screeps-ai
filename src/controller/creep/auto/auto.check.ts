import roles from '@/roles'
import creepAPI from '../api'

export default () => {
  if (Object.keys(Game.creeps) === Object.keys(Memory.creeps)) {
    return
  }

  for (const name in Memory.creeps) {
    if (name in Game.creeps) {
      continue
    }

    // 如果 creep 已经凉了
    const creepConfig = Memory.creepConfigs[name]
    // 获取配置项
    if (!creepConfig) {
      console.log(`死亡 ${name} 未找到对应 creepConfig, 已删除`, ['creepController'])
      delete Memory.creeps[name]
      return
    }

    // 检查指定的 room 中有没有它的生成任务
    const spawnRoom = Game.rooms[creepConfig.spawnRoom]
    if (!spawnRoom) {
      console.log(`死亡 ${name} 未找到 ${creepConfig.spawnRoom}`, ['creepController'])
      return
    }

    const creepWorkFn = roles[creepConfig.role](creepConfig.data)
    // 如果有 isNeed 阶段并且该阶段返回 false 则遗弃该 creep
    if (creepWorkFn.isNeed && !creepWorkFn.isNeed(Game.rooms[creepConfig.spawnRoom], name, Memory.creeps[name])) {
      creepAPI.Delete(name)
      delete Memory.creeps[name]
      return
    }

    if (spawnRoom.addSpawnTask(name) != ERR_NAME_EXISTS) {
      delete Memory.creeps[name]
    }
  }
}