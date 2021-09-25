import roles from '@/roles'

const creepAPI = {
  // Add 添加一个Creep的配置
  // 在完成Creep添加后，虫巢可以创建名为${creepName}，配置为${CreepArgs}的Creep
  Add(creepName: string, role: BaseRoleConstant, args: CreepArgs, spawnRoom: string) {
    if (!Memory.creepConfigs) {
      Memory.creepConfigs = {}
    }

    if (!roles[role]) {
      return ERR_NOT_FOUND
    }

    const creepWork = roles[role](args) as ICreepConfig
    // 不管有没有直接覆盖掉
    Memory.creepConfigs[creepName] = { role, args, bodys: creepWork.bodys, spawnRoom } as CreepConfig

    // 如果已经存在的话就不推送孵化任务了
    if (creepName in Game.creeps) {
      return OK
    }
    // 检测目标房间是否可以进行孵化
    const room = Game.rooms[spawnRoom]
    if (!room) {
      return ERR_NOT_OWNER
    }

    // 推送孵化任务
    room.addSpawnTask(creepName)
    return OK
  },
  Delete(creepName: string): OK | ERR_NOT_FOUND {
    if (!Memory.creepConfigs || !(creepName in Memory.creepConfigs)) {
      return ERR_NOT_FOUND
    }

    delete Memory.creepConfigs[creepName]
    return OK
  },
  Get() {
    return
  }
}

export default creepAPI