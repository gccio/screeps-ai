module.exports.transfer = (c, s, r) => {
    if (c.transfer(s, r) === ERR_NOT_IN_RANGE) {
        c.moveTo(s)
    }
}

module.exports.withdraw = (c, s, r) => {
    if (c.withdraw(s, r) === ERR_NOT_IN_RANGE) {
        c.moveTo(s)
    }
}


// canUsedEnergy 获取可以直接使用的资源数量
module.exports.canUsedEnergy = room => {
    var ss = room.find(FIND_MY_STRUCTURES, {
        filter: s => (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    })
    return _.sum(ss.map(s => s.store.getUsedCapacity(RESOURCE_ENERGY)))
}