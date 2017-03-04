brain.special.creepSpawner = function () {

    //start spawning
    for (let roomName in Game.rooms) {

        if (Memory.claimList[roomName] == undefined) continue;
        if (Memory.claimList[roomName].roomType == 'Mine') continue;


        let spawn = Game.rooms[roomName].find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_SPAWN })[0];
        if (!spawn) continue;


        if (!spawn.spawning) {
            config.log(1, 'Special CreepSpawner is running for room: ' + spawn.room.name);

            let uniqueNameId = Math.floor((Math.random() * 1000) + 1);
            let operationSize = config.operationSize(spawn.room.name);
            
            for (let claimName in Memory.claimList) {
                let roles = Memory.rooms[claimName].roles;
                let claim = Memory.claimList[claimName];


                if (claim.roomType == 'Mine') {
                    if (claim.parentRoom == spawn.room.name) {

                        if (!claim.task.hasReserver) {
                            // Spawn reserver for mine by parent room

                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' claimer (reserve) for claim ' + claimName);

                            let startPoint = new RoomPosition(25, 25, claim.parentRoom); // Set startPoint to parent room
                            let endPoint = new RoomPosition(25, 25, claimName); // Set endPoint to target claimName

                            if (spawn.canCreateCreep(roles.roleClaimer.operation[operationSize].bodyParts, roles.roleClaimer.id + uniqueNameId) == OK) {
                                spawn.createCreep(roles.roleClaimer.operation[operationSize].bodyParts,
                                    roles.roleClaimer.id + uniqueNameId,
                                    {
                                        task: {
                                            role: roles.roleClaimer.id,
                                            hasResource: false,
                                            startPoint: startPoint,
                                            endPoint: endPoint,
                                            claim: false
                                        }
                                    });
                                //break;
                            }
                        } else if (claim.task.hasReserver && !isNullOrUndefined(Game.rooms[claimName]) && roles.roleProspector.amountOfProspectors < roles.roleProspector.operation[operationSize].minimumOfProspectors) {
                            // Spawn prospector
                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' prospector (mine) for claim ' + claimName);

                            let startPoint = new RoomPosition(25, 25, claim.parentRoom); // Set startPoint to parent room
                            let endPoint = undefined;

                            let source = _.filter(Memory.rooms[claimName].sources, (s) => s.openSpots > 0);
                            if (source[0].openSpots > 0) {
                                endPoint = Game.getObjectById(source[0].source);
                            }

                            if (!endPoint) {
                                continue;
                            }

                            if (startPoint && endPoint) {
                                if (spawn.canCreateCreep(roles.roleProspector.operation[operationSize].bodyParts, roles.roleProspector.id + uniqueNameId) == OK) {
                                    spawn.createCreep(roles.roleProspector.operation[operationSize].bodyParts,
                                        roles.roleProspector.id + uniqueNameId,
                                        {
                                            task: {
                                                role: roles.roleProspector.id,
                                                hasResource: false,
                                                startPoint: startPoint,
                                                endPoint: endPoint
                                            }
                                        });
                                    //break;
                                }
                            }
                        } else if (claim.task.useCollectors && claim.task.collectorCount < 2) {
                            // Spawn collector
                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' collector for claim ' + claimName);

                            let startPoint = new RoomPosition(25, 25, claimName); // Set startPoint to the room with overflow
                            let endPoint = new RoomPosition(25, 25, claim.parentRoom);; // Set endPoint to the room to deliver the energy

                            if (startPoint && endPoint) {

                                if (spawn.canCreateCreep(roles.roleCollector.operation[operationSize].bodyParts, roles.roleCollector.id + uniqueNameId) == OK) {
                                    spawn.createCreep(roles.roleCollector.operation[operationSize].bodyParts, roles.roleCollector.id + uniqueNameId, {
                                            task: {
                                                role: roles.roleCollector.id,
                                                hasResource: false,
                                                startPoint: startPoint,
                                                endPoint: endPoint
                                            }
                                        });
                                    //break;
                                }
                            }
                        }
                    }
                } else if (claim.roomType == 'Outpost') {
                    if (claim.parentRoom == spawn.room.name) {

                        let outpostSpawn = Game.rooms[claimName].find(FIND_MY_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_SPAWN });

                        if (!claim.task.isClaimed && !claim.task.hasClaimer) {
                            // Spawn claimer to claim outpost
                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' claimer (claim controller in ' + claimName + ')');

                            let startPoint = new RoomPosition(25, 25, claim.parentRoom); // Set startPoint to parent room
                            let endPoint = new RoomPosition(25, 25, claimName); // Set endPoint to target claimName

                            if (spawn.canCreateCreep(roles.roleClaimer.operation[operationSize].bodyParts, roles.roleClaimer.id + uniqueNameId) == OK) {
                                spawn.createCreep([CLAIM, MOVE, MOVE, MOVE], roles.roleClaimer.id + uniqueNameId, {
                                    task: {
                                        role: roles.roleClaimer.id,
                                        hasResource: false,
                                        startPoint: startPoint,
                                        endPoint: endPoint,
                                        claim: true
                                    }
                                });
                                break;
                            }
                        } else if (claim.task.isClaimed && outpostSpawn.length > 0 && roles.roleProspector.amountOfProspectors < roles.roleProspector.operation[operationSize].minimumOfProspectors) {
                            // Spawn prospector to create the spawn in the outpost
                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' prospector (create spawn in ' + claimName + ')');

                            let startPoint = new RoomPosition(25, 25, claim.parentRoom); // Set startPoint to parent room
                            let endPoint = undefined;

                            let source = _.filter(Memory.rooms[claimName].sources, (s) => s.openSpots > 0);
                            if (source[0].openSpots > 0) {
                                endPoint = Game.getObjectById(source[0].source);
                            }

                            if (!endPoint) {
                                continue;
                            }

                            if (startPoint && endPoint) {
                                if (spawn.canCreateCreep(roles.roleProspector.operation[operationSize].bodyParts, roles.roleProspector.id + uniqueNameId) == OK) {
                                    spawn.createCreep(roles.roleProspector.operation[operationSize].bodyParts,
                                        roles.roleProspector.id + uniqueNameId,
                                        {
                                            task: {
                                                role: roles.roleProspector.id,
                                                hasResource: false,
                                                startPoint: startPoint,
                                                endPoint: endPoint
                                            }
                                        });
                                    break;
                                }
                            }


                        } else if (claim.task.isClaimed && claim.task.useCollectors && claim.task.collectorCount < 1) {
                            // Spawn collector for outpost
                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' collector for claim ' + claimName);

                            let startPoint = new RoomPosition(25, 25, claimName); // Set startPoint to the room with overflow
                            let endPoint = new RoomPosition(25, 25, claim.parentRoom);; // Set endPoint to the room to deliver the energy

                            if (startPoint && endPoint) {

                                if (spawn.canCreateCreep(roles.roleCollector.operation[operationSize].bodyParts, roles.roleCollector.id + uniqueNameId) == OK) {
                                    spawn.createCreep(roles.roleCollector.operation[operationSize].bodyParts, roles.roleCollector.id + uniqueNameId, {
                                        task: {
                                            role: roles.roleCollector.id,
                                            hasResource: false,
                                            startPoint: startPoint,
                                            endPoint: endPoint
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }

            for (let squadName in Memory.squads) {
                let squad = Memory.squads[squadName];
                let roles = Game.rooms[squad.squadBase].memory.roles;

                if (squad.squadBase == spawn.room.name) {
                    if (!squad.squadHasSpawned) {

                        let countAttackersInSquad = _.sum(Game.creeps, (c) => c.memory.squad == squadName && c.memory.role == 'attacker');
                        let countHealersInSquad = _.sum(Game.creeps, (c) => c.memory.squad == squadName && c.memory.role == 'healer');

                        if (countAttackersInSquad < squad.attackers) {
                            // Spawn attacker for squad
                            config.log(3, 'debug scope: Room: ' + spawn.room.name + ' attacker for squad ' + squadName);

                            let forwardBase = Game.flags[squadName];
                            let target = new RoomPosition(25, 25, squadName);

                            let startPoint = forwardBase; // Set startPoint to flag for rendevour
                            let endPoint = target; // Set endPoint to the room of the attack

                            if (startPoint && endPoint) {

                                if (spawn.canCreateCreep(roles.roleAttacker.operation[operationSize].bodyParts, roles.roleAttacker.id + uniqueNameId) == OK) {
                                    spawn.createCreep(roles.roleAttacker.operation[operationSize].bodyParts, roles.roleAttacker.id + uniqueNameId, {
                                        task: {
                                            role: roles.roleAttacker.id,
                                            hasResource: false,
                                            squad: squadName,
                                            startPoint: startPoint,
                                            endPoint: endPoint
                                        }
                                    });
                                    break;
                                }
                            }

                        } else if (countHealersInSquad < squad.healers) {

                        }

                    }
                }
            }
        }
    }
}