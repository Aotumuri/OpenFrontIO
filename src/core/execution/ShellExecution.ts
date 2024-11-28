import { Execution, MutableGame, MutablePlayer, MutableUnit, Tile, Unit, UnitType } from "../game/Game";
import { PathFinder, PathFindResultType } from "../pathfinding/PathFinding";

export class ShellExecution implements Execution {

    private active = true
    private pathFinder = new PathFinder(2000, () => true, 10)
    private shell: MutableUnit

    constructor(private spawn: Tile, private _owner: MutablePlayer, private target: MutableUnit) {

    }

    init(mg: MutableGame, ticks: number): void {
    }

    tick(ticks: number): void {
        if (this.shell == null) {
            this.shell = this._owner.buildUnit(UnitType.Shell, 0, this.spawn)
        }
        if (!this.target.isActive()) {
            this.shell.delete()
            this.active = false
            return
        }
        for (let i = 0; i < 3; i++) {
            const result = this.pathFinder.nextTile(this.shell.tile(), this.target.tile())
            switch (result.type) {
                case PathFindResultType.Completed:
                    this.active = false
                    this.target.delete()
                    this.shell.delete()
                    return
                case PathFindResultType.NextTile:
                    this.shell.move(result.tile)
                    break
                case PathFindResultType.Pending:
                    return
                case PathFindResultType.PathNotFound:
                    console.log(`Shell ${this.shell} could not find target`)
                    this.active = false
                    this.shell.delete()
                    return
            }
        }
    }

    owner(): MutablePlayer {
        return null
    }
    isActive(): boolean {
        return this.active
    }
    activeDuringSpawnPhase(): boolean {
        return false
    }

}