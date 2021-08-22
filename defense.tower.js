module.exports = {
    run: tower => {
        if(tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if(closestHostile) {
                return tower.attack(closestHostile)
            }

            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: s => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && s.hits < s.hitsMax,
            })
            if(closestDamagedStructure) {
                return tower.repair(closestDamagedStructure)
            }
        }
    }
}