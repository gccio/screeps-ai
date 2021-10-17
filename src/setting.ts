export const importantRoles: BaseRoleConstant[] = ['harvester']
export const defaultCreepMemory: CreepMemory = {
  role: 'harvester',
  ready: false,
  working: false,
  producerId: '',
  consumerId: '',
  standguard: false,
  _move: {
    prev: '',
    path: '',
    dst: '',
    tick: -1,
  }
}
// genBodyConfig 快速生成 creep 身体部件配置项
const genBodyConfig = function(...bodySets: [BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]): BodyConfig {
  let config = { 300: [], 550: [], 800: [], 1300: [], 1800: [], 2300: [], 5600: [], 10000: [] }

  // 遍历空配置项，用传入的 bodySet 依次生成配置项
  Object.keys(config).forEach((level, index) => {
    const bodySet = bodySets[index]
    config[level] = [].concat(...Object.keys(bodySet).map(type => Array(bodySet[type]).fill(type)))
  })

  return config
}

export const bodyConfigs: BodyConfigs = {
  harvester: genBodyConfig(
    { [WORK]: 2, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 4, [CARRY]: 1, [MOVE]: 2 },
    { [WORK]: 6, [CARRY]: 1, [MOVE]: 3 },
    { [WORK]: 8, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 10, [CARRY]: 1, [MOVE]: 5 },
    { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
    { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
    { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
  ),
  worker: genBodyConfig(
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
    { [WORK]: 6, [CARRY]: 6, [MOVE]: 6 },
    { [WORK]: 7, [CARRY]: 7, [MOVE]: 7 },
    { [WORK]: 12, [CARRY]: 6, [MOVE]: 9 },
    { [WORK]: 20, [CARRY]: 8, [MOVE]: 14 },
  ),
  upgrader: genBodyConfig(
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
    { [WORK]: 6, [CARRY]: 6, [MOVE]: 6 },
    { [WORK]: 9, [CARRY]: 9, [MOVE]: 9 },
    { [WORK]: 17, [CARRY]: 9, [MOVE]: 17 },
    { [WORK]: 12, [CARRY]: 12, [MOVE]: 12 }
  ),
  collector: genBodyConfig(
    { [CARRY]: 2, [MOVE]: 1 },
    { [CARRY]: 4, [MOVE]: 2 },
    { [CARRY]: 6, [MOVE]: 3 },
    { [CARRY]: 8, [MOVE]: 4 },
    { [CARRY]: 12, [MOVE]: 6 },
    { [CARRY]: 14, [MOVE]: 7 },
    { [CARRY]: 18, [MOVE]: 9 },
    { [CARRY]: 28, [MOVE]: 14 },
  ),
}

// Rampart生命值
export const RampartHitMax: number[] = [
  0,
  300000, // 300K
  1000000, // 1M
  3000000, // 3M
  10000000, // 10M
  30000000, // 30M
  100000000, // 100M
  300000000, // 300M
]
