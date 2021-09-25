import roles from '@/roles'
import { bodyConfigs, defaultCreepMemory, importantRoles } from '@/setting'

export default class SpawnExtension extends StructureSpawn {
  public work(): void {
    if (this.spawning) {
      return
    }

    if (!this.room.memory.spawnList) {
      this.room.memory.spawnList = this.room.memory.spawnList || []
    }

    if (!this.room.memory.spawnList.length) {
      return
    }

    const spawnTask = this.room.memory.spawnList[0]
    const spawnResult: ScreepsReturnCode = this.mySpawnCreep(spawnTask)
    // 生成成功后移除任务
    if (spawnResult === OK) {
      this.room.memory.spawnList.shift()
      return
    }

    if (spawnResult === ERR_NOT_ENOUGH_ENERGY && !importantRoles.includes(Memory.creepConfigs[spawnTask].role)) {
      this.room.backoffSpawnTask()
    }

    return
  }

  private mySpawnCreep(configName: string): ScreepsReturnCode {
    // 如果配置列表中已经找不到该 creep 的配置了 则直接移除该生成任务
    const creepConfig: CreepConfig = Memory.creepConfigs[configName]

    if (!creepConfig) {
      return OK
    }

    // 找不到他的工作逻辑的话也直接移除任务
    const creepWork = roles[creepConfig.role](creepConfig.args)
    if (!creepWork) {
      return OK
    }

    let creepMemory: CreepMemory = _.cloneDeep(defaultCreepMemory)
    creepMemory = Object.assign(creepMemory, creepConfig.args)
    creepMemory.role = creepConfig.role
    
    const bodys = (typeof creepWork.bodys === 'string') ?
      this.getBodys(creepConfig.bodys as BodyAutoConfigConstant) :
      creepConfig.bodys as BodyPartConstant[]

    if (bodys.length <= 0) {
      return ERR_NOT_ENOUGH_ENERGY
    }

    const spawnResult: ScreepsReturnCode = this.spawnCreep(bodys, configName, {
      memory: creepMemory
    })

    if (spawnResult == OK || spawnResult == ERR_NAME_EXISTS) {
      return OK
    }

    return spawnResult
  }

  private getBodys(bodyType: BodyAutoConfigConstant): BodyPartConstant[] {
    const bodyConfig: BodyConfig = bodyConfigs[bodyType]

    const targetLevel = Object.keys(bodyConfig).reverse().find(level => {
      // 先通过等级粗略判断，再加上 dryRun 精确验证
      const availableEnergyCheck = (Number(level) <= this.room.energyAvailable)
      const dryCheck = (this.spawnCreep(bodyConfig[level], 'bodyTester', { dryRun: true }) == OK)

      return availableEnergyCheck && dryCheck
    })
    if (!targetLevel) return []

    // 获取身体部件
    const bodys: BodyPartConstant[] = bodyConfig[targetLevel]

    return bodys
  }

}
