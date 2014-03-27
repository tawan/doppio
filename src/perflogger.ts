import enums = require('./enums');

var getTime: () => number = typeof performance !== 'undefined' ? () => { return performance.now(); } : Date.now;

/**
 * A simple performance logger. Records how much time the application spends
 * in particular states.
 */
class PerfLogger {
  private currentState: number;
  private stateStart: number;
  private stateDurationMap: {[state: number]: number};

  constructor(private possibleStates: any) {
    this.reset();
  }

  public reset() {
    var stateName: string, state: number;

    // Reset state.
    this.currentState = undefined;
    this.stateStart = -1;
    this.stateDurationMap = {};

    // Set all valid states to 0 duration.
    for (stateName in this.possibleStates) {
      if (this.possibleStates.hasOwnProperty(stateName)) {
        // Enums contain both string => num lookup and num => string lookup.
        state = this.possibleStates[stateName];
        if (typeof state === 'number') {
          this.stateDurationMap[state] = 0;
        }
      }
    }
  }

  public recordEvent(state: number): void {
    var currTime: number;
    if (state !== this.currentState) {
      currTime = getTime();
      // State change.
      if (this.stateStart > -1) {
        // Record duration of current state.
        this.stateDurationMap[this.currentState] += currTime - this.stateStart;
      }
      // Switch to new state.
      this.currentState = state;
      this.stateStart = currTime;
    }
  }

  public finish(): any {
    // Flush current state runtime w/ impossible enum value.
    this.recordEvent(-1.1);
    // Serialize output.
    var states = Object.keys(this.stateDurationMap), i: number, output = {};
    for (i = 0; i < states.length; i++) {
      // output[NAME_OF_STATE] = duration;
      output[this.possibleStates[states[i]]] = this.stateDurationMap[states[i]];
    }
    return output;
  }

  public getDuration(state: number): number {
    return this.stateDurationMap[state];
  }

  private static instance: PerfLogger = new PerfLogger(enums.DoppioState);
  public static getInstance(): PerfLogger {
    return this.instance;
  }
}

export = PerfLogger;