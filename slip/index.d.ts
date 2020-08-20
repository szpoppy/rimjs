import EventEmitter from "../event";
export default class Slip extends EventEmitter {
    dom: HTMLElement;
    ax: number;
    ay: number;
    mx: number;
    my: number;
    bx: number;
    by: number;
    on<T>(type: "start", fn: (this: T, arg: Event) => void, isPre?: boolean): void;
    on<T>(type: "move" | "end", fn: (this: T, arg: {
        x: number;
        y: number;
        event: Event;
    }) => void, isPre?: boolean): void;
    constructor(id: string | HTMLElement, mx?: number, my?: number);
    setSkewing(x: number, y: number): [number, number];
}
