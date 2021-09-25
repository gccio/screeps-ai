interface Creep {
  work(): void
  harvestFrom(target: Structure | Source | Tombstone, resourceType?: ResourceConstant): ScreepsReturnCode
  transferTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode
  repairTo(target: Structure): ScreepsReturnCode
  pickupFrom(target: Resource): ScreepsReturnCode
  upgradeRoomController(target?: StructureController): ScreepsReturnCode
  acceptMutual(direction: DirectionConstant): boolean
  customMoveTo(dst: RoomPosition, range?: number): CreepMoveReturnCode | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS | ERR_NO_PATH

  _moveTo(dst: RoomPosition | { pos: RoomPosition }, range?: number): CreepMoveReturnCode | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE | ERR_NOT_OWNER | ERR_INVALID_ARGS | ERR_NO_PATH
}

interface AutoHarvesterStats {
  roomName: string
  sources: HarvesterArgs[]
}
