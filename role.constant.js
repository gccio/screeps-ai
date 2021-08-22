// RoleType
const ROLE_TYPE_HARVESTER = "harvester"
const ROLE_TYPE_UPGRADER = "upgrader"
const ROLE_TYPE_BUILDER = "builder"
const ROLE_TYPE_CARRIER = "carrier"
const ROLE_TYPE_REPAIRER = "repairer"

module.exports.ROLE_TYPE_HARVESTER = ROLE_TYPE_HARVESTER
module.exports.ROLE_TYPE_UPGRADER = ROLE_TYPE_UPGRADER
module.exports.ROLE_TYPE_BUILDER = ROLE_TYPE_BUILDER
module.exports.ROLE_TYPE_CARRIER = ROLE_TYPE_CARRIER
module.exports.ROLE_TYPE_REPAIRER = ROLE_TYPE_REPAIRER

/** 
 * MOVE             50
 * WORK         	100	
 * CARRY	        50
 * ATTACK	        80
 * RANGED_ATTACK	150	
 * HEAL	            250	
 * CLAIM	        600	
 * TOUGH	        10	
 */
module.exports.RoleBodyGuide = {
    harvester: [
        [800, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        [700, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        [600, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        [500, WORK, WORK, WORK, WORK, CARRY, MOVE],
        [400, WORK, WORK, WORK, CARRY, MOVE],
        [350, WORK, WORK, CARRY, MOVE, MOVE],
    ],
    builder: [
        [550, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        [400, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        [350, WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
        [300, WORK, CARRY, CARRY, MOVE, MOVE],
    ],
    upgrader: [
        [550, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        [400, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        [300, WORK, CARRY, CARRY, MOVE, MOVE],
    ],
    carrier: [
        [500, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        [350, WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
        [300, WORK, CARRY, CARRY, MOVE, MOVE],
    ],
    default: [200, WORK, CARRY, MOVE],
}


module.exports.EnergyInfo = {
    id: [
        '5bbcac819099fc012e635937',
        '5bbcac819099fc012e635939',
    ],
    order: {
        '5bbcac819099fc012e635937': 0,
        '5bbcac819099fc012e635939': 1,
    }
}

module.exports.ContainerInfo = {
    id: [
        '6120e2b5408cd667a6dbf936',
        '6121f2f746872359a260abb2',
    ],
    order: {
        '6120e2b5408cd667a6dbf936': 0,
        '6121f2f746872359a260abb2': 1,
    }
}

module.exports.RoleMaxNum = {
    harvester: 1,
    builder: 2,
    carrier: 2,
    upgrader: 2,
}

module.exports.RoleBuildOrder = [
    ROLE_TYPE_CARRIER,
    ROLE_TYPE_HARVESTER,
    ROLE_TYPE_BUILDER,
    ROLE_TYPE_UPGRADER,
]

module.exports.isHarvester = role => {
    return role === ROLE_TYPE_HARVESTER
}

module.exports.isUpgrader = role => {
    return role === ROLE_TYPE_UPGRADER
}

module.exports.isCarrier = role => {
    return role === ROLE_TYPE_CARRIER
}

module.exports.isBuilder = role => {
    return role === ROLE_TYPE_BUILDER
}