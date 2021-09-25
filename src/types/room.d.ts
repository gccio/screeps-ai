interface Room {
  addSpawnTask(creepName: string): ScreepsReturnCode | number
  backoffSpawnTask(): void
}
