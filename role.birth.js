const { 
    RoleBodyGuide, 
    EnergyInfo,
    RoleBuildOrder,
    RoleMaxNum,
    isHarvester,
    ROLE_TYPE_HARVESTER,
    ROLE_TYPE_CARRIER,
    ContainerInfo,
 } = require("./role.constant")
const { canUsedEnergy } = require("./lib.util")

var isEnough = (role, spawn) => {
    var creeps = spawn.room.find(FIND_MY_CREEPS, {
        filter: c => c.memory.role === role,
    })

    // 如果是harvester，则检查是否都是最好的harvester，否则直接返回true，肯定是要造一个最好的harvester的
    if (isHarvester(role)) {
        var best = 0
        for (var i=0; i<creeps.length; i++) {
            if (creeps[i].memory.best) {
                best++
             }
        }
        if (best < RoleMaxNum[role]) {
            return false
        }
    }

    return creeps.length >= RoleMaxNum[role]
}

var clean = () => {
    _.forEach(Memory.creeps, (creep, creepName) => {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName]
            console.log(`creep ${creepName} has been dead.`)
        }
    })
}

var completeSpawnOptions = (spawn, spawnOptions) => {
    const role = spawnOptions.memory.role
    if (role != ROLE_TYPE_CARRIER && role != ROLE_TYPE_HARVESTER) {
        return spawnOptions
    }
    const best = spawnOptions.memory.best

    // 没有任何screep在工作的source的id
    var idsAny = []
    // 没有最佳状态screep的source的id
    var idsBest = []
    var order = {}

    switch (role) {
        case ROLE_TYPE_HARVESTER:
            idsAny = [...EnergyInfo.id]
            idsBest = [...EnergyInfo.id]
            order = EnergyInfo.order
            break
        case ROLE_TYPE_CARRIER:
            idsAny = [...ContainerInfo.id]
            idsBest = [...ContainerInfo.id]
            order = ContainerInfo.order
            break
    }
  
    var curCreeps = spawn.room.find(FIND_MY_CREEPS, {
        filter: creep => {
            var result = creep.memory.role === role
            if (result) {
                if (creep.memory.tid) {
                    idsAny.splice(order[creep.memory.tid], 1)
                    if(creep.memory.best) {
                        idsBest.splice(order[creep.memory.tid], 1)
                    }
                }
            }
            return result
        }
    })

    if (role == ROLE_TYPE_HARVESTER && curCreeps.length === EnergyInfo.id.length && !best) {
        return ERR_NOT_ENOUGH_ENERGY
    }

    if (idsAny.length) {
        spawnOptions.memory.tid = idsAny[0]
    } else if (idsBest.length) {
        spawnOptions.memory.tid = idsBest[0]
    }
    
    return spawnOptions
}

var create = (role, spawn) => {
    if (isEnough(role, spawn)) {
        return false
    }
    if (spawn.spawning) {
        return true
    }
    var bodyPart = RoleBodyGuide.default
    const energy = canUsedEnergy(spawn.room)
    if (energy < bodyPart[0]) {
        return false
    }
    const guide = RoleBodyGuide[role] || []
    var best = false
    for (var i = 0; i < guide.length; i++) {
        var betterBody = guide[i]
        // 找一个资源足够的bodypart创建
        if (betterBody[0] <= energy) {
            best = !i
            bodyPart = betterBody
            break
        }
    }

    // 如果创建的harvester
    // 如果当前拥有的harvester数量充足，但并非部分harvester不是当前可造的最好的harvester
    // 则等建造一个好的harvester之后再建造其他的creeps
    var optOrErr = completeSpawnOptions(spawn, {
        memory: {
            role,
            best,
        },
    })
    if (optOrErr === ERR_NOT_ENOUGH_ENERGY) {
        return optOrErr
    }

    const spawnOptions = optOrErr
    const bp = [...bodyPart]
    bp.shift()

    var creepName = `${role}-${Game.time}`
    console.log(`Spawning new creep: ${creepName}`)
    return spawn.spawnCreep(bp, creepName, spawnOptions) === OK
}

module.exports = {
    run: spawn => {
        clean()
        for (var i = 0; i < RoleBuildOrder.length; i++) {
            var err = create(RoleBuildOrder[i], spawn)
            if (err) {
                break
            }
        }
    },
}