require('./lib.creep')

var roleHarvester = require('./role.harvester')
var roleUpgrader = require('./role.upgrader')
var roleBuilder = require('./role.builder')
var roleCarrier = require('./role.carrier')
var roleBirth = require('./role.birth')
var defTower = require('./defense.tower')

module.exports.loop = function () {
    _.forEach(Game.rooms, room => {
        var towers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
        })

        if (towers.length) {
            _.forEach(towers, defTower.run)
        }

        var spawns = room.find(FIND_MY_SPAWNS)
        if (spawns.length) {
            roleBirth.run(spawns[0])
        }
    })

    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name]
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep)
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep)
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep)
        }
        if(creep.memory.role == 'carrier') {
            roleCarrier.run(creep)
        }
    }
}